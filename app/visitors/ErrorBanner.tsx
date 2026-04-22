'use client';

import {useChartContext} from './ChartContext';
import {useT} from './LocaleContext';

export function ErrorBanner() {
  const {error, dismissError} = useChartContext();
  const t = useT();
  if (!error) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-on-surface p-4">
      <p className="text-sm text-on-surface">{error.message}</p>
      <div className="flex shrink-0 items-center gap-3">
        {error.retry && (
          <button onClick={error.retry} className="text-sm font-medium text-on-surface underline underline-offset-2">
            {t.retry}
          </button>
        )}
        <button onClick={dismissError} aria-label={t.closeError} className="text-on-surface leading-none text-base">
          ✕
        </button>
      </div>
    </div>
  );
}
