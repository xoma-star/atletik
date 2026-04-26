'use client';

import {useMemo} from 'react';
import {OPEN_HOUR, CAPACITY, fmtDateTime} from '@/lib/visitors';
import type {RangePoint, ForecastPoint} from '@/lib/visitors';

export type LinePoint = {
  /** ISO-строка времени точки данных. */
  time: string;
  /** Отформатированная строка для отображения в тултипе. */
  label: string;
  /** Количество посетителей, или `null` если данные отсутствуют. */
  visitors: number | null;
};

type Params = {
  /** Сырые данные диапазона из API. */
  rangeData: RangePoint[];
  /** Точки прогноза из контекста. */
  forecastPoints: ForecastPoint[];
  /** `true`, если активный фильтр — «сегодня». */
  isToday: boolean;
  /** Текущая локаль для форматирования меток. */
  locale: string;
  /** Отступ слева в SVG-единицах. */
  PAD_L: number;
  /** Внутренняя ширина области графика. */
  iw: number;
  /** Отступ сверху в SVG-единицах. */
  PAD_T: number;
  /** Внутренняя высота области графика. */
  ih: number;
};

export type LinePaths = {
  /** Обработанные точки линейного графика. */
  data: LinePoint[];
  /** Минимальный timestamp в ms по всем точкам (реальные + прогноз). */
  minT: number;
  /** Максимальный timestamp в ms по всем точкам. */
  maxT: number;
  /** Общий временной диапазон в ms. */
  spanMs: number;
  /** Переводит ISO-строку времени в X-координату SVG. */
  xFor: (timeStr: string) => number;
  /** Переводит количество посетителей в Y-координату SVG. */
  yFor: (v: number) => number;
  /** SVG `d`-строка реальной линии. */
  realPath: string;
  /** SVG `d`-строка пунктирного прогноза, или пустая строка если прогноза нет. */
  projPath: string;
  /** Последняя точка реальных данных. */
  lastReal: LinePoint | null;
  /** `true`, если есть прогнозный путь и нужно отрисовать пульсирующую точку. */
  showPulse: boolean;
};

export function useLinePaths({rangeData, forecastPoints, isToday, locale, PAD_L, iw, PAD_T, ih}: Params): LinePaths {
  return useMemo(() => {
    const data: LinePoint[] = rangeData
      .filter((p) => new Date(p.time).getHours() >= OPEN_HOUR)
      .map((p) => ({time: p.time, label: fmtDateTime(p.time, locale), visitors: p.visitors}));

    const forecastTimedPoints =
      isToday && forecastPoints.length > 0
        ? forecastPoints.map((p) => {
            const [h, m] = p.label.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return {time: d.toISOString(), val: p.val};
          })
        : [];

    const allTimes = [
      ...data.map((p) => new Date(p.time).getTime()),
      ...forecastTimedPoints.map((p) => new Date(p.time).getTime())
    ].sort((a, b) => a - b);

    const minT = allTimes[0] ?? 0;
    const maxT = allTimes[allTimes.length - 1] ?? 1;
    const spanMs = maxT - minT;

    const xFor = (timeStr: string) => PAD_L + ((new Date(timeStr).getTime() - minT) / Math.max(spanMs, 1)) * iw;
    const yFor = (v: number) => PAD_T + ih - (v / CAPACITY) * ih;

    const realPath = data
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.time).toFixed(1)} ${yFor(p.visitors!).toFixed(1)}`)
      .join(' ');

    const lastReal = data[data.length - 1] ?? null;

    let projPath = '';
    if (isToday && lastReal && forecastTimedPoints.length > 0) {
      const lastRealMs = new Date(lastReal.time).getTime();
      const future = forecastTimedPoints.filter((p) => new Date(p.time).getTime() > lastRealMs);
      if (future.length > 0) {
        projPath = [{time: lastReal.time, val: lastReal.visitors!}, ...future]
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.time).toFixed(1)} ${yFor(p.val).toFixed(1)}`)
          .join(' ');
      }
    }

    return {data, minT, maxT, spanMs, xFor, yFor, realPath, projPath, lastReal, showPulse: projPath.length > 0};
  }, [rangeData, forecastPoints, isToday, locale, PAD_L, iw, PAD_T, ih]);
}
