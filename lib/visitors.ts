export type RangePoint = {visitors: number; time: string};
export type HourlyPoint = {hour: number; avg: number};
export type ForecastPoint = {label: string; val: number; now?: boolean};
export type StatusKey = 'free' | 'moderate' | 'busy' | 'peak';

export const CAPACITY = 140;
export const MAX_DAYS = 31;
export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 23;

export type FilterKey = 'today' | 'week' | 'month';

export function statusFor(current: number, capacity: number): StatusKey {
  const pct = current / capacity;
  if (pct < 0.35) return 'free';
  if (pct < 0.65) return 'moderate';
  if (pct < 0.85) return 'busy';
  return 'peak';
}

export function buildForecast(current: number, now = new Date()): ForecastPoint[] {
  const base = new Date(now);
  base.setSeconds(0, 0);
  base.setMinutes(Math.floor(base.getMinutes() / 15) * 15);

  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const points: ForecastPoint[] = [];
  const t = new Date(base);
  let first = true;
  while (t < midnight) {
    const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    points.push({label, val: current, ...(first ? {now: true} : {})});
    first = false;
    t.setTime(t.getTime() + 15 * 60 * 1000);
  }
  return points;
}

export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

export function tzOffset(): string {
  const off = -new Date().getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

export function fmtDateTime(iso: string, locale?: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function fmtHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export const QUICK_FILTERS: {key: FilterKey; range: () => {from: string; to: string}}[] = [
  {
    key: 'today',
    range: () => {
      const t = toDateInput(new Date());
      return {from: t, to: t};
    }
  },
  {
    key: 'week',
    range: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      return {from: toDateInput(from), to: toDateInput(to)};
    }
  },
  {
    key: 'month',
    range: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - MAX_DAYS);
      return {from: toDateInput(from), to: toDateInput(to)};
    }
  }
];

export type QuickFilter = (typeof QUICK_FILTERS)[number];

export const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface)',
  border: '1px solid var(--on-surface)',
  borderRadius: 0,
  fontFamily: 'var(--font-geist-mono), monospace',
  fontSize: 11,
  padding: '8px 12px'
} as const;

export const TOOLTIP_LABEL_STYLE = {color: 'var(--on-surface)'} as const;
export const TOOLTIP_ITEM_STYLE = {color: 'var(--on-surface)'} as const;
