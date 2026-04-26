'use client';

import {useT} from '../LocaleContext';
import type {ForecastPoint} from '@/lib/visitors';

type Props = {
  /** Массив точек прогноза — отображаются первые 5. */
  points: ForecastPoint[];
  /** Вместимость зала — используется для расчёта высоты столбцов в процентах. */
  capacity: number;
};

export function ForecastChart({points, capacity}: Props) {
  const t = useT();
  return (
    <div className="md:min-w-[260px]">
      <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase opacity-60 mb-2.5 md:mb-[14px] text-left md:text-right">
        {t.forecast}
      </div>
      <div className="grid grid-cols-5 gap-1.5 border border-on-surface p-2 md:p-3 bg-surface">
        {points.slice(0, 5).map((p, i) => (
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
  );
}
