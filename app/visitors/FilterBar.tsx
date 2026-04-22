'use client';

import {QUICK_FILTERS} from './utils';
import {useChartContext} from './ChartContext';

export function FilterBar() {
  const {from, to, maxTo, activeFilter, loading, handleFromChange, handleToChange, handleApply, handleQuickFilter} =
    useChartContext();

  const activeStyle = {background: 'var(--on-surface)', color: 'var(--surface)'};
  const inactiveStyle = {background: 'var(--surface)', color: 'var(--on-surface)'};

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Быстрые фильтры */}
      <div className="flex gap-1">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => handleQuickFilter(f)}
            className="rounded-md px-3 py-1.5 text-sm font-medium border border-on-surface transition-colors"
            style={activeFilter === f.label ? activeStyle : inactiveStyle}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="hidden sm:block self-stretch w-px bg-on-surface" />

      {/* Диапазон дат */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-on-surface">
          С
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => handleFromChange(e.target.value)}
            className="rounded-md border border-on-surface bg-surface text-on-surface px-3 py-1.5 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-on-surface">
          По
          <input
            type="date"
            value={to}
            min={from}
            max={maxTo}
            onChange={(e) => handleToChange(e.target.value)}
            className="rounded-md border border-on-surface bg-surface text-on-surface px-3 py-1.5 text-sm outline-none"
          />
        </label>
        <button
          onClick={handleApply}
          disabled={loading}
          className="rounded-md px-4 py-1.5 text-sm font-medium bg-on-surface text-surface disabled:opacity-50"
        >
          {loading ? 'Загрузка…' : 'Применить'}
        </button>
      </div>
    </div>
  );
}
