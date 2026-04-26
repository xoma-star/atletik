'use client';

import {useState} from 'react';
import type {LinePoint} from './useLinePaths';

export type LineTooltipState = {
  /** X-координата точки в SVG-единицах. */
  svgX: number;
  /** Y-координата точки в SVG-единицах. */
  svgY: number;
  /** Отформатированная метка времени для подсказки. */
  label: string;
  /** Количество посетителей. */
  val: number;
} | null;

type Params = {
  /** Обработанные точки линейного графика. */
  data: LinePoint[];
  /** Переводит ISO-строку времени в X-координату SVG. */
  xFor: (timeStr: string) => number;
  /** Переводит количество посетителей в Y-координату SVG. */
  yFor: (v: number) => number;
  /** Полная ширина SVG-вьюпорта. */
  W: number;
  /** Отступ слева. */
  PAD_L: number;
  /** Отступ справа. */
  PAD_R: number;
};

export function useLineTooltip({data, xFor, yFor, W, PAD_L, PAD_R}: Params) {
  const [tooltip, setTooltip] = useState<LineTooltipState>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    if (svgX < PAD_L || svgX > W - PAD_R) {
      setTooltip(null);
      return;
    }
    let nearest: LinePoint | null = null;
    let minDist = Infinity;
    for (const p of data) {
      const dist = Math.abs(xFor(p.time) - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
    if (nearest)
      setTooltip({
        svgX: xFor(nearest.time),
        svgY: yFor(nearest.visitors!),
        label: nearest.label,
        val: nearest.visitors!
      });
  };

  const hide = () => setTooltip(null);

  return {tooltip, handleMouseMove, hide};
}
