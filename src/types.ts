export type QuestCategory = 'all' | 'game' | 'browser' | 'app' | 'custom';
export type WindowMode = 'visible' | 'minimized' | 'hidden';

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

export interface DiscordStatus {
  isDiscordRunning: boolean;
  pid?: number;
  processCount?: number;
}

export interface IElectronAPI {
  startEmulation: (params: {
    preset: QuestPreset;
    windowMode: WindowMode;
    durationMinutes: number;
    autoStop: boolean;
    soundAlert: boolean;
  }) => Promise<{ success: boolean; pid?: number; error?: string }>;
  stopEmulation: () => Promise<{ success: boolean; error?: string }>;
  getEmulationStatus: () => Promise<EmulationState>;
  checkDiscord: () => Promise<DiscordStatus>;
  getPresets: () => Promise<QuestPreset[]>;
  saveCustomPreset: (preset: QuestPreset) => Promise<{ success: boolean; error?: string }>;
  deleteCustomPreset: (id: string) => Promise<{ success: boolean; error?: string }>;
  openStubWindow: () => Promise<void>;
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
