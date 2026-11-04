import React, { useEffect } from 'react';
import { X, Tv, Gamepad, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface StreamGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreamGuideModal: React.FC<StreamGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#0a0f1d] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative transform transition-all animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Гайд по выполнению квестов</h3>
              <p className="text-xs text-muted-foreground">Как закрывать любые квесты Discord без скачивания игр</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть гайд"
            className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs text-slate-300">
          {/* Section 1: Play 15 min quests */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
              <Gamepad className="w-4 h-4" />
              <span>Квесты типа «Играть 15 минут»</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
              <li>Откройте вкладку <b>«Квесты»</b> в Discord (Настройки пользователя → Квесты) и примите нужный квест.</li>
              <li>В XQuest выберите целевую игру (или введите её <code className="text-sky-300 font-mono">.exe</code>).</li>
              <li>Нажмите <b>«Запустить эмуляцию»</b>.</li>
              <li>Discord автоматически обнаружит запущенный процесс и начнет отсчёт 15 минут.</li>
              <li>По окончании таймера заберите награду (Орбсы / промокод / дроп) в Discord.</li>
            </ol>
          </div>

          {/* Section 2: Stream 15 min quests */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Tv className="w-4 h-4" />
              <span>Квесты типа «Стримить игру 15 минут другу»</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
              <li>В XQuest включите режим <b>«Окно стрима»</b> и запустите эмуляцию.</li>
              <li>Появится легкое темное окно с заголовком игры.</li>
              <li>Зайдите в любой голосовой канал Discord (можно на свой личный сервер с другом или со вторым аккаунтом).</li>
              <li>Нажмите кнопку <b>«Демонстрация экрана»</b> в Discord.</li>
              <li>В окне выбора перейдите во вкладку <b>«Приложения»</b> и выберите окно нашей игры.</li>
              <li>Держите стрим включенным 15 минут — Discord засчитает выполнение!</li>
            </ol>
          </div>

          {/* Section 3: Browser Quests */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <Globe className="w-4 h-4" />
              <span>Квесты для браузеров (Opera GX, Chrome)</span>
            </div>
            <p className="leading-relaxed">
              Некоторые квесты дают Discord Nitro или декор за использование партнёрских браузеров. Достаточно выбрать <b>Opera GX</b> в списке и нажать запуск — эмулятор создаст процесс <code className="text-emerald-300 font-mono">opera.exe</code>, и Discord засчитает время.
            </p>
          </div>

          {/* Safe Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-500/[0.06] border border-sky-500/20 text-sky-200">
            <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>100% безопасность:</b> XQuest не модифицирует файлы Discord и не использует запрещённый self-botting с токенами. Приложение создает подлинный фоновый процесс Windows, который Discord распознаёт штатным детектором игр.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-sky-950 transition-all active:scale-[0.97]"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
