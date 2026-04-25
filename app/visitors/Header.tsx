'use client';

import {useChartContext} from './ChartContext';
import {useLocale, useT} from './LocaleContext';

export function Header() {
  const {lastUpdated} = useChartContext();
  const locale = useLocale();
  const t = useT();

  const now = new Date();
  const weekday = now.toLocaleDateString(locale, {weekday: 'long'});
  const dateStr = now.toLocaleDateString(locale, {day: 'numeric', month: 'short'});

  const updatedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})
    : null;

  return (
    <header className="flex justify-end items-start border-b border-on-surface pb-[18px] mb-10 font-mono tracking-[0.08em] uppercase flex-wrap gap-3">
      <div className="flex gap-3 md:gap-7">
        <span className="text-[10px] md:text-[11px]">
          {weekday} · {dateStr}
        </span>
        {updatedTime && (
          <span className="text-[10px] md:text-[11px]">
            {t.updatedAt} {updatedTime}
          </span>
        )}
      </div>
    </header>
  );
}
