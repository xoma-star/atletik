'use client';

import {QUICK_FILTERS, toDateInput} from '@/lib/visitors';
import {useChartContext} from './ChartContext';
import {useT} from './LocaleContext';

export function FilterBar() {
  const {from, to, maxTo, pendingFilter, loading, handleFromChange, handleToChange, handleApply, handleQuickFilter} =
    useChartContext();
  const t = useT();
  const today = toDateInput(new Date());

  return (
    <div className="flex flex-col md:flex-row flex-wrap md:items-end gap-3 md:gap-4 mb-6">
      {/* Быстрые фильтры */}
      <div className="flex border border-on-surface md:w-auto w-full">
        {QUICK_FILTERS.map((f, i) => (
          <button
            key={f.key}
            onClick={() => handleQuickFilter(f)}
            className={`flex-1 md:flex-initial font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase cursor-pointer border-none ${
              pendingFilter === f.key ? 'bg-on-surface text-surface' : 'bg-transparent text-on-surface'
            }`}
            style={{
              padding: '8px 18px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--on-surface)'
            }}
          >
            {t[f.key]}
          </button>
        ))}
      </div>

      {/* Вертикальный разделитель (только desktop) */}
      <div className="hidden md:block w-px h-7 bg-on-surface opacity-40 self-end mb-1" />

      {/* Поля дат + кнопка применить */}
      <div className="flex flex-col md:flex-row md:items-end gap-2.5 md:gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.08em] uppercase opacity-70">{t.dateFrom}</span>
          <input
            type="date"
            className="gp-date"
            value={from}
            max={today}
            onChange={(e) => handleFromChange(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.08em] uppercase opacity-70">{t.dateTo}</span>
          <input
            type="date"
            className="gp-date"
            value={to}
            min={from}
            max={maxTo}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </label>
        <button
          onClick={handleApply}
          disabled={loading}
          className="self-stretch md:self-auto font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase border border-on-surface bg-on-surface text-surface cursor-pointer disabled:opacity-50"
          style={{padding: '8px 18px'}}
        >
          {loading ? t.applying : t.apply}
        </button>
      </div>
    </div>
  );
}
