'use client';

import {useMemo} from 'react';

export type XTickData = {
  /** Unix timestamp в миллисекундах. */
  ts: number;
  /** X-координата тика в SVG-единицах. */
  x: number;
  /** Готовая подпись для отображения на оси. */
  label: string;
};

type Params = {
  /** Общий временной диапазон данных в ms. */
  spanMs: number;
  /** Минимальный timestamp диапазона в ms. */
  minT: number;
  /** Максимальный timestamp диапазона в ms. */
  maxT: number;
  /** `true`, если ширина контейнера меньше 640 px — увеличивает шаг тиков. */
  isMobile: boolean;
  /** Текущая локаль для форматирования дат при многодневном диапазоне. */
  locale: string;
  /** Отступ слева в SVG-единицах. */
  PAD_L: number;
  /** Внутренняя ширина области графика. */
  iw: number;
};

export type XTicksResult = {
  /** Массив тиков с позициями и подписями. */
  ticks: XTickData[];
  /** `true`, если диапазон охватывает более одного дня. */
  isMultiDay: boolean;
};

export function useXTicks({spanMs, minT, maxT, isMobile, locale, PAD_L, iw}: Params): XTicksResult {
  return useMemo(() => {
    const DAY_MS = 86_400_000;
    const HOUR_MS = 3_600_000;
    const isMultiDay = spanMs / DAY_MS > 1.5;

    const rawTicks: number[] = [];
    if (spanMs > 0) {
      if (isMultiDay) {
        const d = new Date(minT);
        d.setHours(0, 0, 0, 0);
        while (d.getTime() <= maxT) {
          rawTicks.push(d.getTime());
          d.setDate(d.getDate() + 1);
        }
      } else {
        const step = isMobile ? 3 : 2;
        const startH = Math.ceil(minT / HOUR_MS) * HOUR_MS;
        for (let ts = startH; ts <= maxT; ts += step * HOUR_MS) rawTicks.push(ts);
      }
    }

    const ticks: XTickData[] = rawTicks.map((ts) => {
      const d = new Date(ts);
      const label = isMultiDay
        ? d.toLocaleDateString(locale, {day: 'numeric', month: 'short'})
        : String(d.getHours()).padStart(2, '0');
      const x = PAD_L + ((ts - minT) / Math.max(spanMs, 1)) * iw;
      return {ts, x, label};
    });

    return {ticks, isMultiDay};
  }, [spanMs, minT, maxT, isMobile, locale, PAD_L, iw]);
}
