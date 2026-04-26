'use client';

import {useT} from '../../LocaleContext';
import type {LineTooltipState} from './hooks/useLineTooltip';

type Props = {
  /** Данные активной точки, над которой показывается подсказка. */
  tooltip: NonNullable<LineTooltipState>;
  /** Полная ширина SVG-вьюпорта — для перевода SVG-координат в CSS-проценты. */
  W: number;
  /** Полная высота SVG-вьюпорта — для перевода SVG-координат в CSS-проценты. */
  H: number;
};

export function LineTooltip({tooltip, W, H}: Props) {
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
      <div className="opacity-70">{tooltip.label}</div>
      <div>
        {t.visitors}: {tooltip.val}
      </div>
    </div>
  );
}
