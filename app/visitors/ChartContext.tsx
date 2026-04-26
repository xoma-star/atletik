'use client';

import {createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode} from 'react';
import {
  MAX_DAYS,
  QUICK_FILTERS,
  CAPACITY,
  QuickFilter,
  FilterKey,
  ForecastPoint,
  toDateInput,
  addDays,
  tzOffset,
  buildForecast,
  RangePoint,
  HourlyPoint
} from '@/lib/visitors';

type ErrorState = {
  /** Текст ошибки для отображения пользователю. */
  message: string;
  /** Колбэк повтора запроса, или `null` если повтор невозможен. */
  retry: (() => void) | null;
} | null;

type ChartContextValue = {
  /** Начальная дата выбранного диапазона (YYYY-MM-DD). */
  from: string;
  /** Конечная дата выбранного диапазона (YYYY-MM-DD). */
  to: string;
  /** Максимально допустимая конечная дата (`from + MAX_DAYS` или сегодня). */
  maxTo: string;
  /** Начальная дата последнего применённого диапазона. */
  appliedFrom: string;
  /** Конечная дата последнего применённого диапазона. */
  appliedTo: string;
  /** Активный быстрый фильтр или `''` если выбран ручной диапазон. */
  activeFilter: FilterKey | '';
  /** Фильтр, нажатый пользователем, до завершения загрузки. */
  pendingFilter: FilterKey | '';
  /** Данные линейного графика за выбранный период. */
  rangeData: RangePoint[];
  /** Данные столбчатого графика — средняя загрузка по часам для выбранного дня недели. */
  hourlyData: HourlyPoint[];
  /** Выбранный день недели для столбчатого графика (0 = воскресенье … 6 = суббота). */
  selectedDow: number;
  /** `true` во время выполнения запроса к API. */
  loading: boolean;
  /** Текущая ошибка с возможностью повтора, или `null`. */
  error: ErrorState;
  /** Текущее количество посетителей в зале, или `null` если данные недоступны. */
  current: number | null;
  /** ISO-строка времени последнего обновления данных, или `null`. */
  lastUpdated: string | null;
  /** Точки прогноза загрузности зала на ближайшее время. */
  forecastPoints: ForecastPoint[];
  /** Максимальная вместимость зала (константа CAPACITY). */
  capacity: number;
  /** Сбрасывает текущую ошибку. */
  dismissError: () => void;
  /** Обновляет начальную дату и корректирует конечную, если она выходит за MAX_DAYS. */
  handleFromChange: (v: string) => void;
  /** Обновляет конечную дату диапазона. */
  handleToChange: (v: string) => void;
  /** Загружает данные для текущего диапазона `from–to`. */
  handleApply: () => void;
  /** Выбирает быстрый фильтр и загружает данные для его диапазона. */
  handleQuickFilter: (f: QuickFilter) => void;
  /** Переключает день недели и загружает усреднённые данные для него. */
  handleDowChange: (dow: number) => void;
};

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error('useChartContext вызван вне ChartProvider');
  return ctx;
}

type InitialData = {
  /** Начальные данные линейного графика (передаются с сервера через SSR). */
  rangeData: RangePoint[];
  /** Начальные данные столбчатого графика (передаются с сервера через SSR). */
  hourlyData: HourlyPoint[];
  /** Ошибка первоначальной загрузки, или `null`. */
  initialError?: string | null;
  /** Текущее количество посетителей на момент SSR, или `null`. */
  initialCurrent?: number | null;
  /** Время последнего обновления на момент SSR, или `null`. */
  initialLastUpdated?: string | null;
};

function useVisitorChart({
  rangeData: initialRange,
  hourlyData: initialHourly,
  initialError,
  initialCurrent,
  initialLastUpdated
}: InitialData): ChartContextValue {
  const [from, setFrom] = useState(() => toDateInput(new Date()));
  const [to, setTo] = useState(() => toDateInput(new Date()));
  const [activeFilter, setActiveFilter] = useState<FilterKey | ''>('today');
  const [pendingFilter, setPendingFilter] = useState<FilterKey | ''>('today');
  const [appliedFrom, setAppliedFrom] = useState(() => toDateInput(new Date()));
  const [appliedTo, setAppliedTo] = useState(() => toDateInput(new Date()));

  const [rangeData, setRangeData] = useState<RangePoint[]>(initialRange);
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>(initialHourly);
  const [selectedDow, setSelectedDow] = useState(() => new Date().getDay());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(
    initialError ? {message: initialError, retry: () => window.location.reload()} : null
  );

  const [current, setCurrent] = useState<number | null>(initialCurrent ?? null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLastUpdated ?? null);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>(() =>
    initialCurrent != null ? buildForecast(initialCurrent) : []
  );

  const fetchRange = useCallback(async (f: string, t: string, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);
    try {
      const tz = tzOffset();
      const res = await fetch(
        `/api/stats/range` +
          `?from=${encodeURIComponent(`${f}T00:00:00${tz}`)}` +
          `&to=${encodeURIComponent(`${t}T23:59:59${tz}`)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Неизвестная ошибка');
      setRangeData(json.data ?? []);
      onSuccess?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError({message, retry: () => fetchRange(f, t, onSuccess)});
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHourly = useCallback(async (dow: number) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const res = await fetch(`/api/stats/hourly-avg?dow=${dow}&tz=${encodeURIComponent(tz)}`);
      if (res.ok) setHourlyData((await res.json()).data ?? []);
    } catch (e) {
      console.error('hourly-avg:', e);
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const json = await res.json();
      const newCurrent: number | null = json.current ?? null;
      setCurrent(newCurrent);
      setLastUpdated(json.lastUpdated ?? null);
      if (newCurrent != null) {
        const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
        const fRes = await fetch(`/api/stats/forecast?tz=${tz}`);
        if (fRes.ok) {
          const fJson = await fRes.json();
          setForecastPoints(fJson.forecast ?? buildForecast(newCurrent));
        } else {
          setForecastPoints(buildForecast(newCurrent));
        }
      }
    } catch (e) {
      console.error('current poll:', e);
    }
  }, []);

  useEffect(() => {
    const todayStr = toDateInput(new Date());
    fetchRange(todayStr, todayStr);
    fetchHourly(new Date().getDay());
    fetchCurrent();
    const id = setInterval(fetchCurrent, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDowChange = useCallback(
    (dow: number) => {
      setSelectedDow(dow);
      fetchHourly(dow);
    },
    [fetchHourly]
  );

  const maxTo = useMemo(() => {
    const todayStr = toDateInput(new Date());
    const absolute = addDays(from, MAX_DAYS);
    return absolute < todayStr ? absolute : todayStr;
  }, [from]);

  const dismissError = useCallback(() => setError(null), []);

  const handleFromChange = useCallback((v: string) => {
    setFrom(v);
    setTo((prev) => (prev > addDays(v, MAX_DAYS) ? addDays(v, MAX_DAYS) : prev));
  }, []);

  const handleToChange = useCallback((v: string) => {
    setTo(v);
  }, []);

  const handleApply = useCallback(() => {
    const f = from;
    const t = to;
    fetchRange(f, t, () => {
      setActiveFilter('');
      setPendingFilter('');
      setAppliedFrom(f);
      setAppliedTo(t);
    });
  }, [fetchRange, from, to]);

  const handleQuickFilter = useCallback(
    (f: QuickFilter) => {
      const range = f.range();
      setFrom(range.from);
      setTo(range.to);
      setPendingFilter(f.key);
      fetchRange(range.from, range.to, () => {
        setActiveFilter(f.key);
        setAppliedFrom(range.from);
        setAppliedTo(range.to);
      });
    },
    [fetchRange]
  );

  return {
    from,
    to,
    maxTo,
    appliedFrom,
    appliedTo,
    activeFilter,
    pendingFilter,
    rangeData,
    hourlyData,
    selectedDow,
    loading,
    error,
    current,
    lastUpdated,
    forecastPoints,
    capacity: CAPACITY,
    dismissError,
    handleFromChange,
    handleToChange,
    handleApply,
    handleQuickFilter,
    handleDowChange
  };
}

export function ChartProvider({children, initialData}: {children: ReactNode; initialData: InitialData}) {
  const value = useVisitorChart(initialData);
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}
