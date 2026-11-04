import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_PRESETS } from './presetsData';
import { QuestPreset, WindowMode, EmulationState, DiscordStatus } from './types';
import { TopNav } from './components/ui/TopNav';
import { PlexusBackground } from './components/ui/PlexusBackground';
import { ActiveEmulationCard } from './components/ActiveEmulationCard';
import { PresetsGrid } from './components/PresetsGrid';
import { CustomProcessModal } from './components/CustomProcessModal';
import { StreamGuideModal } from './components/StreamGuideModal';
import { sounds } from './utils/SoundEffects';

const INITIAL_STATE: EmulationState = {
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

export const App: React.FC = () => {
  const [presets, setPresets] = useState<QuestPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<QuestPreset>(DEFAULT_PRESETS[0]);
  const [state, setState] = useState<EmulationState>(INITIAL_STATE);
  const [windowMode, setWindowMode] = useState<WindowMode>('visible');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [autoStop, setAutoStop] = useState<boolean>(true);
  const [soundAlert, setSoundAlert] = useState<boolean>(true);

  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>({ isDiscordRunning: false });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const prevCompletedRef = useRef(false);

  // Load presets and check Discord status on mount
  useEffect(() => {
    const initData = async () => {
      if (window.electronAPI) {
        try {
          const loadedPresets = await window.electronAPI.getPresets();
          if (loadedPresets && loadedPresets.length > 0) {
            setPresets(loadedPresets);
            setSelectedPreset(loadedPresets[0]);
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

        // Celebration trigger when completed
        if (updatedState.isCompleted && !prevCompletedRef.current) {
          if (updatedState.soundAlert) {
            sounds.playComplete();
          }

          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#5865F2', '#34d399', '#ffffff'],
          });
        }
        prevCompletedRef.current = updatedState.isCompleted;
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

  const handleStart = async () => {
    if (soundAlert) {
      sounds.playStart();
    }

    if (window.electronAPI) {
      const res = await window.electronAPI.startEmulation({
        preset: selectedPreset,
        windowMode,
        durationMinutes,
        autoStop,
        soundAlert,
      });

      if (!res.success) {
        console.error('[XQuest] Start error:', res.error);
      }
    } else {
      // Mock mode for web preview
      setState({
        ...state,
        isRunning: true,
        activePreset: selectedPreset,
        pid: 9999,
        startTime: Date.now(),
        targetDurationSeconds: durationMinutes * 60,
        elapsedSeconds: 0,
        windowMode,
        isCompleted: false,
      });
    }
  };

  const handleStop = async () => {
    if (soundAlert) {
      sounds.playStop();
    }

    if (window.electronAPI) {
      await window.electronAPI.stopEmulation();
    } else {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        activePreset: null,
        pid: null,
        isCompleted: false,
      }));
    }
  };

  const handleOpenWindow = async () => {
    if (window.electronAPI) {
      await window.electronAPI.openStubWindow();
    }
  };

  const handleSaveCustomPreset = async (newPreset: QuestPreset) => {
    const updated = [newPreset, ...presets];
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
        {/* Hero Active Emulation Section */}
        <ActiveEmulationCard
          state={state}
          selectedPreset={selectedPreset}
          windowMode={windowMode}
          onWindowModeChange={setWindowMode}
          durationMinutes={durationMinutes}
          onDurationChange={setDurationMinutes}
          autoStop={autoStop}
          onAutoStopChange={setAutoStop}
          soundAlert={soundAlert}
          onSoundAlertChange={setSoundAlert}
          onStart={handleStart}
          onStop={handleStop}
          onOpenWindow={handleOpenWindow}
        />

        {/* Presets & Custom Games Library */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Каталог квестов и игр
              </h2>
              <p className="text-xs text-muted-foreground">
                Выберите целевую игру для мгновенной эмуляции в один клик
              </p>
            </div>
          </div>

          <PresetsGrid
            presets={presets}
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onDeleteCustomPreset={handleDeleteCustomPreset}
            isEmulationRunning={state.isRunning}
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
