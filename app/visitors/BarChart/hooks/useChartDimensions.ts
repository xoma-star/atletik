'use client';

import {useRef, useState, useEffect} from 'react';

export type ChartDimensions = {
  /** Ref, который нужно повесить на корневой элемент-контейнер для отслеживания его ширины. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** `true`, если ширина контейнера меньше 640 px. */
  isMobile: boolean;
  /** Полная ширина SVG-вьюпорта в логических единицах. */
  W: number;
  /** Полная высота SVG-вьюпорта в логических единицах. */
  H: number;
  /** Отступ слева — резервируется под подписи оси Y. */
  PAD_L: number;
  /** Отступ справа. */
  PAD_R: number;
  /** Отступ сверху. */
  PAD_T: number;
  /** Отступ снизу — резервируется под подписи оси X. */
  PAD_B: number;
  /** Внутренняя ширина области построения графика (`W − PAD_L − PAD_R`). */
  iw: number;
  /** Внутренняя высота области построения графика (`H − PAD_T − PAD_B`). */
  ih: number;
};

export function useChartDimensions(): ChartDimensions {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(960);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isMobile = cw < 640;
  const W = isMobile ? 640 : 1000;
  const H = isMobile ? 200 : 220;
  const PAD_L = isMobile ? 36 : 48;
  const PAD_R = isMobile ? 10 : 16;
  const PAD_T = 16;
  const PAD_B = 36;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;

  return {containerRef, isMobile, W, H, PAD_L, PAD_R, PAD_T, PAD_B, iw, ih};
}
