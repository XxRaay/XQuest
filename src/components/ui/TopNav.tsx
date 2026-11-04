import React from 'react';
import { Logo } from './logo';
import { DiscordStatus } from '../../types';
import { HelpCircle, Minus, Square, X, RefreshCw } from 'lucide-react';

interface TopNavProps {
  discordStatus: DiscordStatus;
  onRefreshDiscord: () => void;
  onOpenGuide: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  discordStatus,
  onRefreshDiscord,
  onOpenGuide,
}) => {
  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  return (
    <header className="h-14 border-b border-white/[0.08] bg-background/80 backdrop-blur-md px-4 flex items-center justify-between select-none drag-region">
      {/* Brand mark & title */}
      <div className="flex items-center gap-3 no-drag">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-sky-400" />
          <span className="font-semibold text-foreground tracking-tight text-base">XQuest</span>
        </div>
        <span className="text-[10px] font-medium tracking-wider uppercase bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full">
          Эмулятор квестов Discord
        </span>
      </div>

      {/* Center Discord detection status badge */}
      <div className="flex items-center gap-2 no-drag">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border transition-colors ${
            discordStatus.isDiscordRunning
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              discordStatus.isDiscordRunning
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-medium">
            {discordStatus.isDiscordRunning ? 'Discord запущен' : 'Discord не обнаружен'}
          </span>
          <button
            type="button"
            onClick={onRefreshDiscord}
            aria-label="Проверить статус Discord"
            title="Проверить статус Discord"
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded ml-0.5 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right actions: Stream Guide CTA and Window Controls */}
      <div className="flex items-center gap-2 no-drag">
        <button
          type="button"
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-md transition-all active:scale-[0.97]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Гайд по квестам</span>
        </button>

        {/* Frameless window control buttons */}
        <div className="flex items-center ml-2 border-l border-white/[0.08] pl-2 gap-0.5">
          <button
            type="button"
            onClick={handleMinimize}
            aria-label="Свернуть окно"
            className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            aria-label="Развернуть окно"
            className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Закрыть окно"
            className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
