export type QuestCategory = 'all' | 'game' | 'browser' | 'app' | 'custom';
export type WindowMode = 'visible' | 'minimized' | 'hidden';

export interface QuestPreset {
  id: string;
  name: string;
  executable: string; // single or comma-separated aliases
  windowTitle: string;
  category: 'game' | 'browser' | 'app' | 'custom';
  description: string;
  rewardHint?: string;
  discordAppId?: string;
  isCustom?: boolean;
  accentColor?: string; // Hex or Tailwind color for gorgeous cards
}

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
  targetDurationSeconds: number; // default 920s (15m 20s)
  autoStop: boolean;
  soundAlert: boolean;
  windowMode: WindowMode;
}

export interface DiscordStatus {
  isDiscordRunning: boolean;
  pid?: number;
  processCount?: number;
}

export interface SelectedExeResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  appName?: string;
}

export interface IElectronAPI {
  startSession: (params: {
    preset: QuestPreset;
    windowMode: WindowMode;
    durationSeconds: number;
    autoStop: boolean;
    soundAlert: boolean;
  }) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  startBatchSessions: (params: {
    presets: QuestPreset[];
    windowMode: WindowMode;
    durationSeconds: number;
    autoStop: boolean;
    soundAlert: boolean;
  }) => Promise<{ success: boolean; sessionIds?: string[]; error?: string }>;
  stopSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  stopAllSessions: () => Promise<{ success: boolean; error?: string }>;
  getEmulationStatus: () => Promise<EmulationState>;
  checkDiscord: () => Promise<DiscordStatus>;
  getPresets: () => Promise<QuestPreset[]>;
  saveCustomPreset: (preset: QuestPreset) => Promise<{ success: boolean; error?: string }>;
  deleteCustomPreset: (id: string) => Promise<{ success: boolean; error?: string }>;
  openStubWindow: (sessionId?: string) => Promise<void>;
  selectExeFile: () => Promise<SelectedExeResult>;
  getRunningProcesses: () => Promise<string[]>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onStateUpdate: (callback: (state: EmulationState) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
