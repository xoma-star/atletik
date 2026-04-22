'use client';

import {createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode} from 'react';
import {MAX_DAYS, QUICK_FILTERS, QuickFilter, toDateInput, addDays, tzOffset, RangePoint, HourlyPoint} from './utils';

type ChartContextValue = {
  from: string;
  to: string;
  maxTo: string;
  activeFilter: string;
  rangeData: RangePoint[];
  hourlyData: HourlyPoint[];
  loading: boolean;
  error: string | null;
  dismissError: () => void;
  handleFromChange: (v: string) => void;
  handleToChange: (v: string) => void;
  handleApply: () => void;
  handleQuickFilter: (f: QuickFilter) => void;
};

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error('useChartContext вызван вне ChartProvider');
  return ctx;
}

// ─── хук с логикой ────────────────────────────────────────────────────────────

type InitialData = {
  rangeData: RangePoint[];
  hourlyData: HourlyPoint[];
};

function useVisitorChart({rangeData: initialRange, hourlyData: initialHourly}: InitialData): ChartContextValue {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInput(d);
  });
  const [to, setTo] = useState(() => toDateInput(new Date()));
  const [activeFilter, setActiveFilter] = useState('Неделя');

  const [rangeData, setRangeData] = useState<RangePoint[]>(initialRange);
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>(initialHourly);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRange = useCallback(async (f: string, t: string) => {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHourly = useCallback(async () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dow = new Date().getDay();
    try {
      const res = await fetch(`/api/stats/hourly-avg?dow=${dow}&tz=${encodeURIComponent(tz)}`);
      if (res.ok) setHourlyData((await res.json()).data ?? []);
    } catch (e) {
      console.error('hourly-avg:', e);
    }
  }, []);

  // После гидрации тихо обновляем часовой график с timezone пользователя
  useEffect(() => {
    fetchHourly();
  }, [fetchHourly]);

  const maxTo = useMemo(() => addDays(from, MAX_DAYS), [from]);

  const dismissError = useCallback(() => setError(null), []);

  const handleFromChange = useCallback((v: string) => {
    setFrom(v);
    setActiveFilter('');
    setTo((prev) => (prev > addDays(v, MAX_DAYS) ? addDays(v, MAX_DAYS) : prev));
  }, []);

  const handleToChange = useCallback((v: string) => {
    setTo(v);
    setActiveFilter('');
  }, []);

  const handleApply = useCallback(() => {
    setActiveFilter('');
    fetchRange(from, to);
  }, [fetchRange, from, to]);

  const handleQuickFilter = useCallback(
    (f: QuickFilter) => {
      const range = f.range();
      setFrom(range.from);
      setTo(range.to);
      setActiveFilter(f.label);
      fetchRange(range.from, range.to);
    },
    [fetchRange]
  );

  return {
    from,
    to,
    maxTo,
    activeFilter,
    rangeData,
    hourlyData,
    loading,
    error,
    dismissError,
    handleFromChange,
    handleToChange,
    handleApply,
    handleQuickFilter
  };
}

// ─── провайдер ────────────────────────────────────────────────────────────────

export function ChartProvider({children, initialData}: {children: ReactNode; initialData: InitialData}) {
  const value = useVisitorChart(initialData);
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}
