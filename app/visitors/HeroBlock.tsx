'use client';

import {useChartContext} from './ChartContext';
import {useT} from './LocaleContext';
import {statusFor} from './utils';

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
      {/* Левая часть: цифра + статус */}
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

      {/* Правая часть: прогноз */}
      {forecastPoints.length > 0 && (
        <div className="md:min-w-[260px]">
          <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase opacity-60 mb-2.5 md:mb-[14px] text-left md:text-right">
            {t.forecast}
          </div>
          <div className="grid grid-cols-5 gap-1.5 border border-on-surface p-2 md:p-3 bg-surface">
            {forecastPoints.slice(0, 5).map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-[54px] md:h-[80px] flex items-end">
                  <div
                    className="w-full border border-on-surface"
                    style={{
                      height: `${Math.round((p.val / capacity) * 100)}%`,
                      background: p.now ? 'var(--on-surface)' : 'transparent'
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[9px] md:text-[10px]"
                  style={{fontWeight: p.now ? 600 : 400, opacity: p.now ? 1 : 0.6}}
                >
                  {p.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums" style={{fontWeight: p.now ? 700 : 500}}>
                  {p.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
