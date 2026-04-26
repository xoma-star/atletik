'use client';

import {useLocale} from '../LocaleContext';
import {getDayLabel, getWeekDays} from './dayUtils';

type Props = {
  /** Выбранный день недели (0 = воскресенье … 6 = суббота). */
  selectedDow: number;
  /** День недели текущего дня — получает атрибут `aria-current="date"`. */
  todayDow: number;
  /** Если `true`, уменьшаются отступы кнопок под узкий экран. */
  isMobile: boolean;
  /** Вызывается при клике на день; передаёт номер дня недели. */
  onSelect: (dow: number) => void;
};

export function DayPicker({selectedDow, todayDow, isMobile, onSelect}: Props) {
  const locale = useLocale();
  const weekDays = getWeekDays(locale);

  return (
    <div className="flex border border-on-surface">
      {weekDays.map((dow, i) => (
        <button
          key={dow}
          onClick={() => onSelect(dow)}
          aria-current={dow === todayDow ? 'date' : undefined}
          className={`font-mono text-[10px] uppercase cursor-pointer border-none ${
            selectedDow === dow ? 'bg-on-surface text-surface' : 'bg-transparent text-on-surface'
          }`}
          style={{
            padding: isMobile ? '4px 7px' : '5px 10px',
            borderLeft: i === 0 ? 'none' : '1px solid var(--on-surface)'
          }}
        >
          {getDayLabel(dow, locale, 'short')}
        </button>
      ))}
    </div>
  );
}
