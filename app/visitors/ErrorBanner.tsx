'use client';

import {useChartContext} from './ChartContext';
import {useT} from './LocaleContext';

export function ErrorBanner() {
  const {error, dismissError} = useChartContext();
  const t = useT();
  if (!error) return null;

  return (
    <div className="flex items-start justify-between gap-3 border border-on-surface p-3 md:p-4 font-mono text-[11px] mb-6">
      <p>{error.message}</p>
      <div className="flex items-center gap-3 flex-shrink-0">
        {error.retry && (
          <button onClick={error.retry} className="underline underline-offset-2 cursor-pointer">
            {t.retry}
          </button>
        )}
        <button onClick={dismissError} aria-label={t.closeError} className="text-[13px] leading-none cursor-pointer">
          ✕
        </button>
      </div>
    </div>
  );
}
