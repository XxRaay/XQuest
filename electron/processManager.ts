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
  private childProcess: ChildProcess | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private stubExePath: string;
  private binDir: string;
  private onStateChangeCallback: ((state: EmulationState) => void) | null = null;

  public state: EmulationState = {
    isRunning: false,
    activePreset: null,
    pid: null,
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
      let cleanExeName = params.preset.executable.trim();
      if (!cleanExeName.toLowerCase().endsWith('.exe')) {
        cleanExeName += '.exe';
      }

      const targetExePath = path.join(this.binDir, cleanExeName);

      // Copy stub executable to target game executable name
      try {
        fs.copyFileSync(this.stubExePath, targetExePath);
      } catch (copyErr) {
        // If file is locked, try with random timestamp suffix
        console.warn('[ProcessManager] Target exe copy warning:', copyErr);
      }

      const title = params.preset.windowTitle || params.preset.name;
      const args = [
        `--title=${title}`,
        `--mode=${params.windowMode}`,
        '--width=720',
        '--height=440',
      ];

      const child = spawn(targetExePath, args, {
        detached: true,
        stdio: 'ignore',
        windowsHide: params.windowMode === 'hidden',
      });

      child.unref();

      this.childProcess = child;
      const pid = child.pid || 0;

      // Connect Discord RPC if app ID is provided
      let rpcConnected = false;
      if (params.preset.discordAppId) {
        rpcConnected = await discordRpc.connect(params.preset.discordAppId);
        if (rpcConnected) {
          discordRpc.setActivity({
            pid,
            state: 'Квест Discord (XQuest)',
            details: params.preset.name,
            startTimestamp: Date.now(),
          });
        }
      }

      this.state = {
        isRunning: true,
        activePreset: params.preset,
        pid,
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
              body: `Вы продержали ${params.preset.name} запущенным ${params.durationMinutes} мин. Заберите награду в Discord!`,
            }).show();
          }

          if (this.state.autoStop) {
            this.stopEmulation();
            return;
          }
        }

        this.notifyStateChange();
      }, 1000);

      child.on('exit', () => {
        if (this.state.isRunning) {
          this.stopEmulation();
        }
      });

      return { success: true, pid };
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

    if (this.childProcess) {
      try {
        if (this.childProcess.pid) {
          process.kill(this.childProcess.pid);
        }
      } catch {}
      this.childProcess = null;
    }

    if (this.state.pid) {
      discordRpc.clearActivity(this.state.pid);
      discordRpc.disconnect();
    }

    this.state.isRunning = false;
    this.state.activePreset = null;
    this.state.pid = null;
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
