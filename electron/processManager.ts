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
  accentColor?: string;
}

export type WindowMode = 'visible' | 'minimized' | 'hidden';

export interface ActiveProcessSession {
  id: string;
  presetId: string;
  name: string;
  executable: string;
  activeExecutables: string[];
  windowTitle: string;
  pids: number[];
  startTime: number;
  targetDurationSeconds: number; // default 920 (15m 20s)
  elapsedSeconds: number;
  windowMode: WindowMode;
  isCompleted: boolean;
  autoStop: boolean;
  soundAlert: boolean;
  accentColor?: string;
}

export interface EmulationState {
  isRunning: boolean;
  sessions: ActiveProcessSession[];
  targetDurationSeconds: number;
  autoStop: boolean;
  soundAlert: boolean;
  windowMode: WindowMode;
}

interface InternalSessionHolder {
  session: ActiveProcessSession;
  children: ChildProcess[];
}

export class ProcessManager {
  private activeSessions: Map<string, InternalSessionHolder> = new Map();
  private timerInterval: NodeJS.Timeout | null = null;
  private stubExePath: string;
  private binDir: string;
  private onStateChangeCallback: ((state: EmulationState) => void) | null = null;

  // Default target duration: 15 minutes + 20 seconds = 920 seconds
  public state: EmulationState = {
    isRunning: false,
    sessions: [],
    targetDurationSeconds: 15 * 60 + 20, // 920 seconds
    autoStop: true,
    soundAlert: true,
    windowMode: 'visible',
  };

  constructor() {
    const localStub = path.join(__dirname, 'stub', 'StubRunner.exe');
    const sourceStub = path.join(__dirname, '../electron/stub', 'StubRunner.exe');
    this.stubExePath = fs.existsSync(localStub) ? localStub : sourceStub;
    this.binDir = path.join(app.getPath('userData'), 'emulated_bin');

    this.ensureStubCompiled();
    this.ensureBinDir();
    this.startGlobalTicker();
  }

  public setOnStateChange(cb: (state: EmulationState) => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyStateChange() {
    this.state.sessions = Array.from(this.activeSessions.values()).map((h) => ({ ...h.session }));
    this.state.isRunning = this.state.sessions.length > 0;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({ ...this.state, sessions: [...this.state.sessions] });
    }
  }

  private ensureStubCompiled(): void {
    if (!fs.existsSync(this.stubExePath)) {
      const buildScript = path.join(__dirname, 'stub', 'build-stub.js');
      const srcBuildScript = path.join(__dirname, '../electron/stub', 'build-stub.js');
      const scriptToRun = fs.existsSync(buildScript) ? buildScript : srcBuildScript;
      if (fs.existsSync(scriptToRun)) {
        try {
          console.log('[ProcessManager] Compiling StubRunner.exe...');
          execSync(`node "${scriptToRun}"`, { stdio: 'inherit' });
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

  private startGlobalTicker() {
    if (this.timerInterval) return;

    this.timerInterval = setInterval(() => {
      if (this.activeSessions.size === 0) return;

      let hasChanges = false;
      const completedToStop: string[] = [];

      for (const [sessionId, holder] of this.activeSessions.entries()) {
        holder.session.elapsedSeconds += 1;
        hasChanges = true;

        if (
          holder.session.elapsedSeconds >= holder.session.targetDurationSeconds &&
          !holder.session.isCompleted
        ) {
          holder.session.isCompleted = true;

          // Native Windows Notification
          if (Notification.isSupported()) {
            new Notification({
              title: '🎉 Квест выполнен!',
              body: `${holder.session.name} продержан 15м 20с. Заберите награду в Discord!`,
            }).show();
          }

          if (holder.session.autoStop) {
            completedToStop.push(sessionId);
          }
        }
      }

      for (const id of completedToStop) {
        this.stopSession(id);
      }

      if (hasChanges) {
        this.notifyStateChange();
      }
    }, 1000);
  }

  public async startSession(params: {
    preset: QuestPreset;
    windowMode: WindowMode;
    durationSeconds: number;
    autoStop: boolean;
    soundAlert: boolean;
  }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    this.ensureStubCompiled();
    if (!fs.existsSync(this.stubExePath)) {
      return { success: false, error: 'StubRunner.exe не найден' };
    }

    const sessionId = params.preset.id || `custom-${Date.now()}`;

    // If already running this exact session, return success
    if (this.activeSessions.has(sessionId)) {
      return { success: true, sessionId };
    }

    try {
      // Parse executable names and aliases
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

      const children: ChildProcess[] = [];
      const pids: number[] = [];

      for (let i = 0; i < exeNames.length; i++) {
        const exeName = exeNames[i];
        const targetExePath = path.join(this.binDir, exeName);

        try {
          fs.copyFileSync(this.stubExePath, targetExePath);
        } catch (copyErr) {
          console.warn('[ProcessManager] Target exe copy warning:', copyErr);
        }

        const title = params.preset.windowTitle || params.preset.name;
        // First executable gets visible window if requested, others run quietly in background
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
        children.push(child);
        if (child.pid) {
          pids.push(child.pid);
        }

        child.on('exit', () => {
          const holder = this.activeSessions.get(sessionId);
          if (holder) {
            holder.children = holder.children.filter((c) => c !== child);
            if (holder.children.length === 0) {
              this.stopSession(sessionId);
            }
          }
        });
      }

      const primaryPid = pids[0] || 0;

      // Connect Discord RPC if app ID is provided
      if (params.preset.discordAppId) {
        discordRpc.connect(params.preset.discordAppId).then((connected) => {
          if (connected) {
            discordRpc.setActivity({
              pid: primaryPid,
              state: 'Квест Discord (XQuest)',
              details: params.preset.name,
              startTimestamp: Date.now(),
            });
          }
        });
      }

      const session: ActiveProcessSession = {
        id: sessionId,
        presetId: params.preset.id,
        name: params.preset.name,
        executable: params.preset.executable,
        activeExecutables: exeNames,
        windowTitle: params.preset.windowTitle || params.preset.name,
        pids,
        startTime: Date.now(),
        targetDurationSeconds: params.durationSeconds || (15 * 60 + 20),
        elapsedSeconds: 0,
        windowMode: params.windowMode,
        isCompleted: false,
        autoStop: params.autoStop,
        soundAlert: params.soundAlert,
        accentColor: params.preset.accentColor,
      };

      this.activeSessions.set(sessionId, { session, children });
      this.notifyStateChange();

      return { success: true, sessionId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  public async startBatchSessions(params: {
    presets: QuestPreset[];
    windowMode: WindowMode;
    durationSeconds: number;
    autoStop: boolean;
    soundAlert: boolean;
  }): Promise<{ success: boolean; sessionIds?: string[]; error?: string }> {
    const sessionIds: string[] = [];
    for (const preset of params.presets) {
      const res = await this.startSession({
        preset,
        windowMode: params.windowMode,
        durationSeconds: params.durationSeconds,
        autoStop: params.autoStop,
        soundAlert: params.soundAlert,
      });
      if (res.success && res.sessionId) {
        sessionIds.push(res.sessionId);
      }
    }
    return { success: true, sessionIds };
  }

  public async stopSession(sessionId: string): Promise<{ success: boolean }> {
    const holder = this.activeSessions.get(sessionId);
    if (holder) {
      for (const child of holder.children) {
        try {
          if (child.pid) {
            process.kill(child.pid);
          }
        } catch {}
      }
      this.activeSessions.delete(sessionId);
      this.notifyStateChange();
    }
    return { success: true };
  }

  public async stopAllSessions(): Promise<{ success: boolean }> {
    for (const sessionId of Array.from(this.activeSessions.keys())) {
      await this.stopSession(sessionId);
    }
    discordRpc.disconnect();
    this.notifyStateChange();
    return { success: true };
  }

  public checkDiscordRunning(): { isDiscordRunning: boolean; processCount: number } {
    try {
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
