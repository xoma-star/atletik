'use client';

import {useT} from '../LocaleContext';
import type {TooltipState} from './hooks/useTooltip';

type Props = {
  /** Данные активной точки, над которой показывается подсказка. */
  tooltip: NonNullable<TooltipState>;
  /** Полная ширина SVG-вьюпорта — используется для перевода SVG-координат в CSS-проценты. */
  W: number;
  /** Полная высота SVG-вьюпорта — используется для перевода SVG-координат в CSS-проценты. */
  H: number;
};

export function ChartTooltip({tooltip, W, H}: Props) {
  const t = useT();
  return (
    <div
      className="absolute pointer-events-none border border-on-surface bg-surface font-mono text-[11px] whitespace-nowrap"
      style={{
        left: `${(tooltip.svgX / W) * 100}%`,
        top: `${(tooltip.svgY / H) * 100}%`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
        padding: '8px 12px'
      }}
    >
      <div className="opacity-70">{String(tooltip.hour).padStart(2, '0')}:00</div>
      <div>
        {t.visitors}: {tooltip.avg}
      </div>
    </div>
  );
}
