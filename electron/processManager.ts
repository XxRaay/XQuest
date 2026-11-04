import { app, Notification } from 'electron';
import { ChildProcess, spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { discordRpc } from './discordRpc';

export interface QuestPreset {
  id: string;
  name: string;
  executable: string;
  windowTitle: string;
  category: 'game' | 'browser' | 'app' | 'custom';
  description: string;
  rewardHint?: string;
  discordAppId?: string;
  isCustom?: boolean;
}

export type WindowMode = 'visible' | 'minimized' | 'hidden';

export interface EmulationState {
  isRunning: boolean;
  activePreset: QuestPreset | null;
  pid: number | null;
  pids?: number[];
  activeExecutables?: string[];
  startTime: number | null;
  targetDurationSeconds: number;
  elapsedSeconds: number;
  windowMode: WindowMode;
  rpcConnected: boolean;
  isCompleted: boolean;
  autoStop: boolean;
  soundAlert: boolean;
}

export class ProcessManager {
  private childProcesses: ChildProcess[] = [];
  private timerInterval: NodeJS.Timeout | null = null;
  private stubExePath: string;
  private binDir: string;
  private onStateChangeCallback: ((state: EmulationState) => void) | null = null;

  public state: EmulationState = {
    isRunning: false,
    activePreset: null,
    pid: null,
    pids: [],
    activeExecutables: [],
    startTime: null,
    targetDurationSeconds: 15 * 60,
    elapsedSeconds: 0,
    windowMode: 'visible',
    rpcConnected: false,
    isCompleted: false,
    autoStop: true,
    soundAlert: true,
  };

  constructor() {
    const localStub = path.join(__dirname, 'stub', 'StubRunner.exe');
    const sourceStub = path.join(__dirname, '../electron/stub', 'StubRunner.exe');
    this.stubExePath = fs.existsSync(localStub) ? localStub : sourceStub;
    this.binDir = path.join(app.getPath('userData'), 'emulated_bin');

    this.ensureStubCompiled();
    this.ensureBinDir();
  }

  public setOnStateChange(cb: (state: EmulationState) => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({ ...this.state });
    }
  }

  private ensureStubCompiled(): void {
    if (!fs.existsSync(this.stubExePath)) {
      const buildScript = path.join(__dirname, 'stub', 'build-stub.js');
      if (fs.existsSync(buildScript)) {
        try {
          console.log('[ProcessManager] Compiling StubRunner.exe...');
          execSync(`node "${buildScript}"`, { stdio: 'inherit' });
        } catch (err) {
          console.error('[ProcessManager] Failed to compile StubRunner:', err);
        }
      }
    }
  }

  private ensureBinDir(): void {
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }
  }

  public async startEmulation(params: {
    preset: QuestPreset;
    windowMode: WindowMode;
    durationMinutes: number;
    autoStop: boolean;
    soundAlert: boolean;
  }): Promise<{ success: boolean; pid?: number; error?: string }> {
    if (this.state.isRunning) {
      await this.stopEmulation();
    }

    this.ensureStubCompiled();
    if (!fs.existsSync(this.stubExePath)) {
      return { success: false, error: 'StubRunner.exe не найден и не удалось его скомпилировать' };
    }

    try {
      // Parse executable names (can be comma or semicolon separated aliases)
      const rawNames = params.preset.executable
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const exeNames: string[] = [];
      for (const name of rawNames) {
        let clean = name;
        if (!clean.toLowerCase().endsWith('.exe')) {
          clean += '.exe';
        }
        if (!exeNames.includes(clean)) {
          exeNames.push(clean);
        }
      }

      if (exeNames.length === 0) {
        return { success: false, error: 'Не указано имя исполняемого файла' };
      }

      this.childProcesses = [];
      const pids: number[] = [];

      // Spawn all specified process aliases
      for (let i = 0; i < exeNames.length; i++) {
        const exeName = exeNames[i];
        const targetExePath = path.join(this.binDir, exeName);

        try {
          fs.copyFileSync(this.stubExePath, targetExePath);
        } catch (copyErr) {
          console.warn('[ProcessManager] Target exe copy warning:', copyErr);
        }

        const title = params.preset.windowTitle || params.preset.name;
        // Only the first process gets the visible window if visible mode is active
        const processMode = i === 0 ? params.windowMode : 'hidden';

        const args = [
          `--title=${title}`,
          `--mode=${processMode}`,
          '--width=720',
          '--height=440',
        ];

        const child = spawn(targetExePath, args, {
          detached: true,
          stdio: 'ignore',
          windowsHide: processMode === 'hidden',
        });

        child.unref();
        this.childProcesses.push(child);
        if (child.pid) {
          pids.push(child.pid);
        }

        child.on('exit', () => {
          this.childProcesses = this.childProcesses.filter((c) => c !== child);
          if (this.childProcesses.length === 0 && this.state.isRunning) {
            this.stopEmulation();
          }
        });
      }

      const primaryPid = pids[0] || 0;

      // Connect Discord RPC if app ID is provided
      let rpcConnected = false;
      if (params.preset.discordAppId) {
        rpcConnected = await discordRpc.connect(params.preset.discordAppId);
        if (rpcConnected) {
          discordRpc.setActivity({
            pid: primaryPid,
            state: 'Квест Discord (XQuest)',
            details: params.preset.name,
            startTimestamp: Date.now(),
          });
        }
      }

      this.state = {
        isRunning: true,
        activePreset: params.preset,
        pid: primaryPid,
        pids,
        activeExecutables: exeNames,
        startTime: Date.now(),
        targetDurationSeconds: params.durationMinutes * 60,
        elapsedSeconds: 0,
        windowMode: params.windowMode,
        rpcConnected,
        isCompleted: false,
        autoStop: params.autoStop,
        soundAlert: params.soundAlert,
      };

      this.notifyStateChange();

      // Start ticker
      this.timerInterval = setInterval(() => {
        if (!this.state.isRunning) return;

        this.state.elapsedSeconds += 1;

        if (
          this.state.elapsedSeconds >= this.state.targetDurationSeconds &&
          !this.state.isCompleted
        ) {
          this.state.isCompleted = true;

          // Trigger Windows OS notification
          if (Notification.isSupported()) {
            new Notification({
              title: '🎉 Квест выполнен!',
              body: `Вы продержали ${params.preset.name} (${exeNames.join(', ')}) запущенным ${params.durationMinutes} мин. Заберите награду в Discord!`,
            }).show();
          }

          if (this.state.autoStop) {
            this.stopEmulation();
            return;
          }
        }

        this.notifyStateChange();
      }, 1000);

      return { success: true, pid: primaryPid };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  public async stopEmulation(): Promise<{ success: boolean }> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    for (const child of this.childProcesses) {
      try {
        if (child.pid) {
          process.kill(child.pid);
        }
      } catch {}
    }
    this.childProcesses = [];

    if (this.state.pid) {
      discordRpc.clearActivity(this.state.pid);
      discordRpc.disconnect();
    }

    this.state.isRunning = false;
    this.state.activePreset = null;
    this.state.pid = null;
    this.state.pids = [];
    this.state.activeExecutables = [];
    this.state.rpcConnected = false;

    this.notifyStateChange();
    return { success: true };
  }

  public checkDiscordRunning(): { isDiscordRunning: boolean; processCount: number } {
    try {
      // Fast check via tasklist on Windows
      const output = execSync('tasklist /FI "IMAGENAME eq Discord.exe" /NH', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const isRunning = output.toLowerCase().includes('discord.exe');
      const lines = output.trim().split('\n').filter((l) => l.toLowerCase().includes('discord.exe'));
      return { isDiscordRunning: isRunning, processCount: lines.length };
    } catch {
      return { isDiscordRunning: false, processCount: 0 };
    }
  }
}

export const processManager = new ProcessManager();
