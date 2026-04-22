'use client';

import {useChartContext} from './ChartContext';

export function ErrorBanner() {
  const {error, dismissError} = useChartContext();
  if (!error) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-on-surface p-4">
      <p className="text-sm text-on-surface">{error}</p>
      <button onClick={dismissError} aria-label="Закрыть" className="shrink-0 text-on-surface leading-none text-base">
        ✕
      </button>
    </div>
  );
}
