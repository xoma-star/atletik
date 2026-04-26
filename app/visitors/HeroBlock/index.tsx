'use client';

import {useChartContext} from '../ChartContext';
import {useT} from '../LocaleContext';
import {statusFor} from '@/lib/visitors';
import {ForecastChart} from './ForecastChart';

export function HeroBlock() {
  const {current, forecastPoints, capacity} = useChartContext();
  const t = useT();

  const status = current != null ? statusFor(current, capacity) : null;
  const statusLabel = status
    ? ({free: t.statusFree, moderate: t.statusModerate, busy: t.statusBusy, peak: t.statusPeak} as const)[status]
    : null;
  const pct = current != null ? Math.round((current / capacity) * 100) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-7 md:gap-10 mb-9 md:mb-14">
      <div>
        <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase opacity-60 mb-3">
          {t.nowInGym} · {t.capacityLabel} {capacity}
        </div>
        <div className="flex items-baseline gap-3.5 md:gap-6" style={{lineHeight: 0.85}}>
          <div
            className="text-[120px] md:text-[260px] font-sans font-light tabular-nums"
            style={{letterSpacing: '-0.05em'}}
          >
            {current ?? '—'}
          </div>
          {current != null && (
            <div className="flex flex-col gap-1 md:gap-1.5 pb-2 md:pb-[22px]">
              <div className="flex items-center gap-2.5">
                <span
                  className="rounded-full bg-on-surface flex-shrink-0 w-2 h-2 md:w-2.5 md:h-2.5"
                  style={{boxShadow: '0 0 0 3px var(--surface), 0 0 0 4px var(--on-surface)'}}
                />
                <span className="font-mono text-[11px] md:text-[13px] uppercase tracking-[0.1em]">{statusLabel}</span>
              </div>
              <div className="font-mono text-[11px] md:text-[12px] opacity-60">
                {pct}% {t.fillPct}
              </div>
            </div>
          )}
        </div>
      </div>

      {forecastPoints.length > 0 && <ForecastChart points={forecastPoints} capacity={capacity} />}
    </div>
  );
}
