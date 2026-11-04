import React, { useState } from 'react';
import { QuestPreset, QuestCategory, ActiveProcessSession } from '../types';
import {
  Gamepad2,
  Globe,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  Play,
  Square,
  Check,
  Sparkles,
  Layers,
  Zap,
  CheckSquare,
  Square as SquareOutline
} from 'lucide-react';

interface PresetsGridProps {
  presets: QuestPreset[];
  activeSessions: ActiveProcessSession[];
  selectedPresetIds: string[];
  onToggleSelectPreset: (presetId: string) => void;
  onSelectAllPresets: (selectAll: boolean) => void;
  onStartSinglePreset: (preset: QuestPreset) => void;
  onStopSession: (sessionId: string) => void;
  onStartBatchSelected: () => void;
  onOpenCustomModal: () => void;
  onDeleteCustomPreset: (id: string) => void;
}

export const PresetsGrid: React.FC<PresetsGridProps> = ({
  presets,
  activeSessions,
  selectedPresetIds,
  onToggleSelectPreset,
  onSelectAllPresets,
  onStartSinglePreset,
  onStopSession,
  onStartBatchSelected,
  onOpenCustomModal,
  onDeleteCustomPreset,
}) => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory | 'running'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const runningPresetIds = new Set(activeSessions.map((s) => s.presetId || s.id));

  const filteredPresets = presets.filter((item) => {
    if (activeCategory === 'running') {
      return runningPresetIds.has(item.id);
    }
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'custom'
        ? item.isCustom
        : item.category === activeCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.executable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game':
        return <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />;
      case 'browser':
        return <Globe className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const selectedCount = selectedPresetIds.length;

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Все квесты' },
            { id: 'game', label: 'Игры' },
            { id: 'browser', label: 'Браузеры' },
            { id: 'custom', label: 'Свои процессы' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as QuestCategory)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-muted-foreground hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Running badge tab */}
          {activeSessions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory('running')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeCategory === 'running'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Запущено ({activeSessions.length})</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или .exe..."
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-all"
          />
        </div>
      </div>

      {/* Multi-Selection Action Banner (When items are checked) */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-black/60 border border-sky-500/30 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-white font-medium">
              Выбрано для одновременного запуска:{' '}
              <span className="text-sky-300 font-bold">{selectedCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectAllPresets(false)}
              className="text-xs text-muted-foreground hover:text-white px-2 py-1 transition-colors"
            >
              Снять выбор
            </button>
            <button
              type="button"
              onClick={onStartBatchSelected}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all active:scale-[0.97]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Запустить выбранные ({selectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* "+ Add Custom Process" Card */}
        <button
          type="button"
          onClick={onOpenCustomModal}
          className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/[0.12] hover:border-sky-400/50 bg-[#090d19]/40 hover:bg-sky-500/[0.04] text-muted-foreground hover:text-sky-300 transition-all group min-h-[160px] active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-sky-500/20 flex items-center justify-center mb-2 transition-colors">
            <Plus className="w-5 h-5 text-slate-300 group-hover:text-sky-400 transition-colors" />
          </div>
          <span className="text-xs font-medium text-slate-200 group-hover:text-sky-300">
            Добавить свой процесс
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Любая игра или программа по имени .exe
          </span>
        </button>

        {/* Preset Cards */}
        {filteredPresets.map((preset) => {
          const isSelected = selectedPresetIds.includes(preset.id);
          const runningSession = activeSessions.find(
            (s) => s.presetId === preset.id || s.id === preset.id
          );
          const isRunning = Boolean(runningSession);
          const accent = preset.accentColor || '#38bdf8';

          return (
            <div
              key={preset.id}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-150 backdrop-blur-md overflow-hidden ${
                isRunning
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.12)] ring-1 ring-emerald-500/30'
                  : isSelected
                  ? 'bg-sky-950/25 border-sky-400/50 shadow-[0_0_18px_rgba(56,189,248,0.15)] ring-1 ring-sky-400/30'
                  : 'bg-[#0b101c]/75 border-white/[0.08] hover:border-white/[0.18] hover:bg-[#0d1424]/90'
              }`}
            >
              {/* Subtle top ambient glow strip */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                style={{
                  background: isRunning
                    ? '#10b981'
                    : isSelected
                    ? '#38bdf8'
                    : accent,
                }}
              />

              <div>
                {/* Header: Checkbox + Title + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5">
                    {/* Multi-selection Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleSelectPreset(preset.id)}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                        isSelected
                          ? 'bg-sky-500 border-sky-400 text-sky-950 shadow-sm'
                          : 'border-white/20 hover:border-sky-400 bg-black/30'
                      }`}
                      title={isSelected ? 'Снять выбор' : 'Выбрать для совместного запуска'}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(preset.category)}
                        <h3 className="font-semibold text-sm text-white tracking-tight line-clamp-1">
                          {preset.name}
                        </h3>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <code className="font-mono text-sky-300/90 text-[10px]">
                          {preset.executable}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  {isRunning ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Запущен
                    </span>
                  ) : preset.isCustom ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomPreset(preset.id);
                      }}
                      title="Удалить процесс"
                      className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                      {preset.category}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 mb-3">
                  {preset.description}
                </p>

                {/* Reward Hint Badge */}
                {preset.rewardHint && (
                  <div className="text-[11px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300 flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="line-clamp-1">{preset.rewardHint}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Controls on Card */}
              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleSelectPreset(preset.id)}
                  className="text-[11px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                >
                  {isSelected ? (
                    <span className="text-sky-300 font-medium">✓ В очереди</span>
                  ) : (
                    <span>+ Добавить в очередь</span>
                  )}
                </button>

                {/* Instant Launch / Stop Button */}
                {isRunning ? (
                  <button
                    type="button"
                    onClick={() => runningSession && onStopSession(runningSession.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all active:scale-[0.97]"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Остановить</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartSinglePreset(preset)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-sky-500 hover:text-sky-950 text-slate-200 border border-white/[0.1] hover:border-transparent transition-all active:scale-[0.97]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Запустить</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
