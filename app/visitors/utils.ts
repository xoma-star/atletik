export type RangePoint = {visitors: number; time: string};
export type HourlyPoint = {hour: number; avg: number};

export const MAX_DAYS = 31;

export type FilterKey = 'today' | 'week' | 'month';

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

// Recharts принимает только строки в inline-стилях; var() поддерживается браузером
export const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface)',
  border: '1px solid var(--on-surface)',
  borderRadius: 8,
  color: 'var(--on-surface)',
  fontSize: 12
} as const;

export const TOOLTIP_LABEL_STYLE = {color: 'var(--on-surface)'} as const;
export const TOOLTIP_ITEM_STYLE = {color: 'var(--on-surface)'} as const;
