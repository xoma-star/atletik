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
} from './utils';

type ErrorState = {message: string; retry: (() => void) | null} | null;

type ChartContextValue = {
  from: string;
  to: string;
  maxTo: string;
  appliedFrom: string;
  appliedTo: string;
  activeFilter: FilterKey | '';
  pendingFilter: FilterKey | '';
  rangeData: RangePoint[];
  hourlyData: HourlyPoint[];
  selectedDow: number;
  loading: boolean;
  error: ErrorState;
  current: number | null;
  lastUpdated: string | null;
  forecastPoints: ForecastPoint[];
  capacity: number;
  dismissError: () => void;
  handleFromChange: (v: string) => void;
  handleToChange: (v: string) => void;
  handleApply: () => void;
  handleQuickFilter: (f: QuickFilter) => void;
  handleDowChange: (dow: number) => void;
};

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error('useChartContext вызван вне ChartProvider');
  return ctx;
}

type InitialData = {
  rangeData: RangePoint[];
  hourlyData: HourlyPoint[];
  initialError?: string | null;
  initialCurrent?: number | null;
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
