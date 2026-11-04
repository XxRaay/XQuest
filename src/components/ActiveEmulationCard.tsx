import React from 'react';
import { QuestPreset, WindowMode, EmulationState } from '../types';
import { Play, Square, ExternalLink, Volume2, VolumeX, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface ActiveEmulationCardProps {
  state: EmulationState;
  selectedPreset: QuestPreset;
  windowMode: WindowMode;
  onWindowModeChange: (mode: WindowMode) => void;
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  autoStop: boolean;
  onAutoStopChange: (val: boolean) => void;
  soundAlert: boolean;
  onSoundAlertChange: (val: boolean) => void;
  onStart: () => void;
  onStop: () => void;
  onOpenWindow: () => void;
}

export const ActiveEmulationCard: React.FC<ActiveEmulationCardProps> = ({
  state,
  selectedPreset,
  windowMode,
  onWindowModeChange,
  durationMinutes,
  onDurationChange,
  autoStop,
  onAutoStopChange,
  soundAlert,
  onSoundAlertChange,
  onStart,
  onStop,
  onOpenWindow,
}) => {
  const isRunning = state.isRunning;
  const targetSeconds = isRunning ? state.targetDurationSeconds : durationMinutes * 60;
  const elapsedSeconds = state.elapsedSeconds;
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

  const progressPercent = targetSeconds > 0
    ? Math.min(100, (elapsedSeconds / targetSeconds) * 100)
    : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const presetToDisplay = isRunning && state.activePreset ? state.activePreset : selectedPreset;

  // SVG Circular progress math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative rounded-2xl bg-card border border-card-border p-6 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Soft atmospheric gradient glow behind timer */}
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Game & Process Information */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isRunning
                  ? 'bg-sky-500/15 border-sky-400/30 text-sky-300'
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning
                    ? 'bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]'
                    : 'bg-slate-400'
                }`}
              />
              {isRunning ? 'Эмуляция активна' : 'Готово к запуску'}
            </span>

            {state.isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                15 минут засчитаны!
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {presetToDisplay.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>Исполняемый файл:</span>
              <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-sky-300 font-mono text-[11px] border border-white/[0.08]">
                {presetToDisplay.executable}
              </code>
            </p>
          </div>

          {presetToDisplay.rewardHint && (
            <div className="text-xs px-3 py-2 rounded-lg bg-discord-blurple/10 border border-discord-blurple/25 text-indigo-200">
              <span className="text-sky-300 font-medium">Награда за квест:</span>{' '}
              {presetToDisplay.rewardHint}
            </div>
          )}

          {/* Low Resource Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>0.0% CPU • ~4 МБ ОЗУ • Полная безопасность</span>
          </div>
        </div>

        {/* Center Column: Radial Countdown Timer */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#5865F2" />
                </linearGradient>
              </defs>
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="7"
                className="text-white/[0.07]"
                fill="none"
              />
              {/* Animated Progress ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#timerGrad)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
                {isRunning ? formatTime(remainingSeconds) : formatTime(durationMinutes * 60)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {isRunning ? (remainingSeconds === 0 ? 'Квест выполнен' : 'Осталось') : 'Длительность'}
              </span>
              {isRunning && (
                <span className="text-[10px] text-sky-400/80 font-mono mt-0.5">
                  Прошло: {formatTime(elapsedSeconds)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Launch Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Window Mode Selection */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Режим отображения окна
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => onWindowModeChange('visible')}
                className={`py-1.5 px-2 text-[11px] font-medium rounded transition-all ${
                  windowMode === 'visible'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-200'
                }`}
                title="Окно можно транслировать в голосовом канале Discord для квестов на стрим"
              >
                Окно стрима
              </button>
              <button
                type="button"
                disabled={isRunning}
                onClick={() => onWindowModeChange('minimized')}
                className={`py-1.5 px-2 text-[11px] font-medium rounded transition-all ${
                  windowMode === 'minimized'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-200'
                }`}
              >
                Свёрнуто
              </button>
              <button
                type="button"
                disabled={isRunning}
                onClick={() => onWindowModeChange('hidden')}
                className={`py-1.5 px-2 text-[11px] font-medium rounded transition-all ${
                  windowMode === 'hidden'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-200'
                }`}
              >
                В фоне
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Целевое время</span>
              <span className="text-[11px] text-sky-400 font-mono">{durationMinutes} мин</span>
            </label>
            <div className="flex gap-1.5">
              {[15, 10, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  disabled={isRunning}
                  onClick={() => onDurationChange(mins)}
                  className={`flex-1 py-1 text-xs rounded border transition-colors ${
                    durationMinutes === mins
                      ? 'bg-white/[0.1] border-sky-400/40 text-white font-medium'
                      : 'border-white/[0.06] text-muted-foreground hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {mins === 15 ? '15 м (квест)' : `${mins} м`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preferences: Sound and Auto-stop */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => onSoundAlertChange(!soundAlert)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {soundAlert ? (
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span>Звуковой сигнал</span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={autoStop}
                onChange={(e) => onAutoStopChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Авто-остановка</span>
            </label>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={onStart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-sky-950 shadow-[0_0_24px_rgba(56,189,248,0.35)] transition-all active:scale-[0.97]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Запустить эмуляцию</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onStop}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all active:scale-[0.97]"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Остановить</span>
                </button>

                {windowMode === 'visible' && (
                  <button
                    type="button"
                    onClick={onOpenWindow}
                    title="Показать окно игры для демонстрации экрана"
                    className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-all active:scale-[0.97]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
