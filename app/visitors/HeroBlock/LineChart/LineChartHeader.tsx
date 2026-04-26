'use client';

import {useT} from '../../LocaleContext';

type Props = {
  /** Строка периода для заголовка (например, «сегодня» или «01.01 — 31.01»). */
  titlePeriod: string;
  /** `true`, если отображается сегодняшний день — показывает легенду реальной и прогнозной линий. */
  isToday: boolean;
};

export function LineChartHeader({titlePeriod, isToday}: Props) {
  const t = useT();
  return (
    <div className="flex justify-between items-baseline mb-3 gap-3 flex-wrap font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase">
      <span>линия · {titlePeriod}</span>
      {isToday && (
        <span className="opacity-60">
          — {t.realLine} · - - - {t.projLine}
        </span>
      )}
    </div>
  );
}
