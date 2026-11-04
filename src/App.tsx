import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_PRESETS } from './presetsData';
import { QuestPreset, WindowMode, EmulationState, DiscordStatus, ActiveProcessSession } from './types';
import { TopNav } from './components/ui/TopNav';
import { PlexusBackground } from './components/ui/PlexusBackground';
import { ActiveEmulationCard } from './components/ActiveEmulationCard';
import { PresetsGrid } from './components/PresetsGrid';
import { CustomProcessModal } from './components/CustomProcessModal';
import { StreamGuideModal } from './components/StreamGuideModal';
import { sounds } from './utils/SoundEffects';

// Default duration is now 15 minutes + 20 seconds = 920s (+20s buffer for Discord sync!)
const DEFAULT_DURATION_SECONDS = 15 * 60 + 20;

const INITIAL_STATE: EmulationState = {
  isRunning: false,
  sessions: [],
  targetDurationSeconds: DEFAULT_DURATION_SECONDS,
  autoStop: true,
  soundAlert: true,
  windowMode: 'visible',
};

export const App: React.FC = () => {
  const [presets, setPresets] = useState<QuestPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<QuestPreset>(DEFAULT_PRESETS[0]);
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [state, setState] = useState<EmulationState>(INITIAL_STATE);

  const [windowMode, setWindowMode] = useState<WindowMode>('visible');
  const [durationSeconds, setDurationSeconds] = useState<number>(DEFAULT_DURATION_SECONDS);
  const [autoStop, setAutoStop] = useState<boolean>(true);
  const [soundAlert, setSoundAlert] = useState<boolean>(true);

  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>({ isDiscordRunning: false });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const prevCompletedCountRef = useRef(0);

  // Load presets and check Discord status on mount
  useEffect(() => {
    const initData = async () => {
      if (window.electronAPI) {
        try {
          const loadedPresets = await window.electronAPI.getPresets();
          if (loadedPresets && loadedPresets.length > 0) {
            // Merge custom saved presets with default presets
            const combined = [...loadedPresets, ...DEFAULT_PRESETS.filter(d => !loadedPresets.some(l => l.id === d.id))];
            setPresets(combined);
            setSelectedPreset(combined[0]);
          }

          const status = await window.electronAPI.checkDiscord();
          setDiscordStatus(status);

          const currentStatus = await window.electronAPI.getEmulationStatus();
          setState(currentStatus);
        } catch (err) {
          console.error('[XQuest] Initialization error:', err);
        }
      }
    };

    initData();

    // Listen to real-time state updates from main process
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onStateUpdate((updatedState) => {
        setState(updatedState);

        const currentCompletedCount = (updatedState.sessions || []).filter((s) => s.isCompleted).length;
        if (currentCompletedCount > prevCompletedCountRef.current) {
          if (updatedState.soundAlert) {
            sounds.playComplete();
          }

          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#5865F2', '#34d399', '#f97316', '#ffffff'],
          });
        }
        prevCompletedCountRef.current = currentCompletedCount;
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  const handleRefreshDiscord = async () => {
    if (window.electronAPI) {
      const status = await window.electronAPI.checkDiscord();
      setDiscordStatus(status);
    }
  };

  // Launch a single preset/process session
  const handleStartPreset = async (preset: QuestPreset) => {
    if (soundAlert) {
      sounds.playStart();
    }

    if (window.electronAPI) {
      await window.electronAPI.startSession({
        preset,
        windowMode,
        durationSeconds,
        autoStop,
        soundAlert,
      });
    } else {
      // Mock for browser
      const mockSession: ActiveProcessSession = {
        id: preset.id,
        presetId: preset.id,
        name: preset.name,
        executable: preset.executable,
        activeExecutables: [preset.executable],
        windowTitle: preset.windowTitle,
        pids: [1000 + Math.floor(Math.random() * 9000)],
        startTime: Date.now(),
        targetDurationSeconds: durationSeconds,
        elapsedSeconds: 0,
        windowMode,
        isCompleted: false,
        autoStop,
        soundAlert,
        accentColor: preset.accentColor,
      };
      setState((prev) => ({
        ...prev,
        isRunning: true,
        sessions: [...prev.sessions.filter((s) => s.id !== preset.id), mockSession],
      }));
    }
  };

  // Launch all selected presets simultaneously (e.g. Firefox + Roblox together!)
  const handleStartBatchSelected = async () => {
    const toLaunch = presets.filter((p) => selectedPresetIds.includes(p.id));
    if (toLaunch.length === 0) return;

    if (soundAlert) {
      sounds.playStart();
    }

    if (window.electronAPI) {
      await window.electronAPI.startBatchSessions({
        presets: toLaunch,
        windowMode,
        durationSeconds,
        autoStop,
        soundAlert,
      });
      setSelectedPresetIds([]);
    } else {
      // Mock for browser
      const mockSessions: ActiveProcessSession[] = toLaunch.map((preset) => ({
        id: preset.id,
        presetId: preset.id,
        name: preset.name,
        executable: preset.executable,
        activeExecutables: [preset.executable],
        windowTitle: preset.windowTitle,
        pids: [1000 + Math.floor(Math.random() * 9000)],
        startTime: Date.now(),
        targetDurationSeconds: durationSeconds,
        elapsedSeconds: 0,
        windowMode,
        isCompleted: false,
        autoStop,
        soundAlert,
        accentColor: preset.accentColor,
      }));
      setState((prev) => ({
        ...prev,
        isRunning: true,
        sessions: [...prev.sessions, ...mockSessions],
      }));
      setSelectedPresetIds([]);
    }
  };

  // Stop a single session
  const handleStopSingleSession = async (sessionId: string) => {
    if (soundAlert) {
      sounds.playStop();
    }

    if (window.electronAPI) {
      await window.electronAPI.stopSession(sessionId);
    } else {
      setState((prev) => {
        const nextSessions = prev.sessions.filter((s) => s.id !== sessionId);
        return {
          ...prev,
          sessions: nextSessions,
          isRunning: nextSessions.length > 0,
        };
      });
    }
  };

  // Stop all active sessions
  const handleStopAll = async () => {
    if (soundAlert) {
      sounds.playStop();
    }

    if (window.electronAPI) {
      await window.electronAPI.stopAllSessions();
    } else {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        sessions: [],
      }));
    }
  };

  const handleOpenWindow = async (sessionId?: string) => {
    if (window.electronAPI) {
      await window.electronAPI.openStubWindow(sessionId);
    }
  };

  // Multi-select toggle
  const handleToggleSelectPreset = (presetId: string) => {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
  };

  const handleSelectAllPresets = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedPresetIds(presets.map((p) => p.id));
    } else {
      setSelectedPresetIds([]);
    }
  };

  const handleSaveCustomPreset = async (newPreset: QuestPreset) => {
    const updated = [newPreset, ...presets.filter((p) => p.id !== newPreset.id)];
    setPresets(updated);
    setSelectedPreset(newPreset);

    if (window.electronAPI) {
      await window.electronAPI.saveCustomPreset(newPreset);
    }
  };

  const handleDeleteCustomPreset = async (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    if (selectedPreset.id === id) {
      setSelectedPreset(updated[0] || DEFAULT_PRESETS[0]);
    }
    setSelectedPresetIds((prev) => prev.filter((item) => item !== id));

    if (window.electronAPI) {
      await window.electronAPI.deleteCustomPreset(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden select-none">
      {/* Dynamic Cybernetic Plexus Background */}
      <PlexusBackground theme="cyan" />

      {/* Top Navigation Bar with Frameless controls */}
      <TopNav
        discordStatus={discordStatus}
        onRefreshDiscord={handleRefreshDiscord}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto">
        {/* Hero Active Emulation Section (with multi-process support & +20s buffer) */}
        <ActiveEmulationCard
          state={state}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          windowMode={windowMode}
          onWindowModeChange={setWindowMode}
          durationSeconds={durationSeconds}
          onDurationChange={setDurationSeconds}
          autoStop={autoStop}
          onAutoStopChange={setAutoStop}
          soundAlert={soundAlert}
          onSoundAlertChange={setSoundAlert}
          onStart={() => handleStartPreset(selectedPreset)}
          onStopAll={handleStopAll}
          onStopSingleSession={handleStopSingleSession}
          onOpenWindow={handleOpenWindow}
          onSaveToPresets={handleSaveCustomPreset}
        />

        {/* Enhanced Presets & Games Library with Multi-Selection */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Каталог квестов и игр
              </h2>
              <p className="text-xs text-muted-foreground">
                Запускайте квесты по отдельности или выбирайте несколько (например, Firefox и Roblox) для одновременной эмуляции
              </p>
            </div>
          </div>

          <PresetsGrid
            presets={presets}
            activeSessions={state.sessions || []}
            selectedPresetIds={selectedPresetIds}
            onToggleSelectPreset={handleToggleSelectPreset}
            onSelectAllPresets={handleSelectAllPresets}
            onStartSinglePreset={handleStartPreset}
            onStopSession={handleStopSingleSession}
            onStartBatchSelected={handleStartBatchSelected}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onDeleteCustomPreset={handleDeleteCustomPreset}
          />
        </div>
      </main>

      {/* Custom Process Modal */}
      <CustomProcessModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomPreset}
      />

      {/* Stream & Quest Guide Modal */}
      <StreamGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
};
