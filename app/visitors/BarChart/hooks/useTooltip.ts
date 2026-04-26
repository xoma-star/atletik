'use client';

import {useState} from 'react';

export type TooltipState = {
  /** X-координата точки в SVG-единицах — используется для позиционирования подсказки. */
  svgX: number;
  /** Y-координата точки в SVG-единицах — используется для позиционирования подсказки. */
  svgY: number;
  /** Час, которому соответствует столбец (0–23). */
  hour: number;
  /** Среднее количество посетителей за этот час. */
  avg: number;
} | null;

export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const show = (state: NonNullable<TooltipState>) => setTooltip(state);
  const hide = () => setTooltip(null);
  return {tooltip, show, hide};
}
