import React, { useState, useEffect } from 'react';
import { QuestPreset } from '../types';
import { X, Plus, Terminal } from 'lucide-react';

interface CustomProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: QuestPreset) => void;
}

export const CustomProcessModal: React.FC<CustomProcessModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [executable, setExecutable] = useState('');
  const [windowTitle, setWindowTitle] = useState('');
  const [category, setCategory] = useState<'game' | 'browser' | 'app'>('game');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !executable.trim()) return;

    let cleanExe = executable.trim();
    if (!cleanExe.toLowerCase().endsWith('.exe')) {
      cleanExe += '.exe';
    }

    const newPreset: QuestPreset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      executable: cleanExe,
      windowTitle: windowTitle.trim() || name.trim(),
      category,
      description: description.trim() || `Пользовательский процесс ${cleanExe}`,
      isCustom: true,
    };

    onSave(newPreset);
    setName('');
    setExecutable('');
    setWindowTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#0a0f1d] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Добавить процесс</h3>
              <p className="text-xs text-muted-foreground">Эмулировать любую игру или программу</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть диалог"
            className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Название игры или программы <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Black Myth: Wukong"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!windowTitle) setWindowTitle(e.target.value);
              }}
              spellCheck={false}
              className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Имя исполняемого файла (.exe) <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="b1.exe или GameClient.exe"
              value={executable}
              onChange={(e) => setExecutable(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white font-mono placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Точное имя файла, которое Discord ищет в списке процессов
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Заголовок окна (для трансляции в Discord)
            </label>
            <input
              type="text"
              placeholder="Как окно отображается в Discord при стриме"
              value={windowTitle}
              onChange={(e) => setWindowTitle(e.target.value)}
              spellCheck={false}
              className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'game' | 'browser' | 'app')}
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
              >
                <option value="game">Игра</option>
                <option value="browser">Браузер</option>
                <option value="app">Приложение</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Примечание
              </label>
              <input
                type="text"
                placeholder="Задание квеста"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-xl text-xs text-white placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-sky-950 transition-all active:scale-[0.97] shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Сохранить и выбрать</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
