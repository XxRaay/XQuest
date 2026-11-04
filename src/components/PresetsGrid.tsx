import React, { useState } from 'react';
import { QuestPreset, QuestCategory } from '../types';
import { Gamepad2, Globe, LayoutGrid, Plus, Search, Trash2, Check, Sparkles } from 'lucide-react';

interface PresetsGridProps {
  presets: QuestPreset[];
  selectedPreset: QuestPreset;
  onSelectPreset: (preset: QuestPreset) => void;
  onOpenCustomModal: () => void;
  onDeleteCustomPreset: (id: string) => void;
  isEmulationRunning: boolean;
}

export const PresetsGrid: React.FC<PresetsGridProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
  onOpenCustomModal,
  onDeleteCustomPreset,
  isEmulationRunning,
}) => {
  const [activeCategory, setActiveCategory] = useState<QuestCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = presets.filter((item) => {
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
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.06] rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Все квесты' },
            { id: 'game', label: 'Игры' },
            { id: 'browser', label: 'Браузеры' },
            { id: 'custom', label: 'Пользовательские' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as QuestCategory)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-muted-foreground hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск игры или .exe..."
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-9 pr-3 py-1.5 bg-black/30 border border-white/[0.08] rounded-xl text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-all"
          />
        </div>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* "+ Add Custom Preset" Card */}
        <button
          type="button"
          onClick={onOpenCustomModal}
          disabled={isEmulationRunning}
          className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/[0.12] hover:border-sky-400/50 bg-white/[0.01] hover:bg-sky-500/[0.03] text-muted-foreground hover:text-sky-300 transition-all group min-h-[140px] active:scale-[0.98] disabled:opacity-50"
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

        {/* Existing Presets */}
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => !isEmulationRunning && onSelectPreset(preset)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-sky-500/[0.08] border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-sky-400/30'
                  : 'bg-card/70 border-white/[0.07] hover:border-white/[0.18] hover:bg-card/90'
              } ${isEmulationRunning ? 'cursor-not-allowed opacity-80' : 'active:scale-[0.98]'}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(preset.category)}
                    <h3 className="font-semibold text-sm text-white tracking-tight line-clamp-1">
                      {preset.name}
                    </h3>
                  </div>

                  {preset.isCustom ? (
                    <button
                      type="button"
                      disabled={isEmulationRunning}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomPreset(preset.id);
                      }}
                      title="Удалить пользовательский процесс"
                      className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground border border-white/[0.05]">
                      {preset.category}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                  {preset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                <code className="text-[10px] font-mono text-sky-300 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-500/20">
                  {preset.executable}
                </code>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400">
                    <Check className="w-3 h-3" />
                    Выбрано
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground/80 hover:text-slate-200">
                    Выбрать
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
