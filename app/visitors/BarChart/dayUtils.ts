const EPOCH_SUNDAY = new Date(2021, 0, 3);

export function getDayLabel(dow: number, locale: string, format: 'short' | 'long'): string {
  const d = new Date(EPOCH_SUNDAY);
  d.setDate(d.getDate() + dow);
  return new Intl.DateTimeFormat(locale, {weekday: format}).format(d);
}

const WEEK_FIRST_DAY: Partial<Record<string, number>> = {ru: 1};

export function getWeekDays(locale: string): number[] {
  const first = WEEK_FIRST_DAY[locale] ?? 0;
  return Array.from({length: 7}, (_, i) => (first + i) % 7);
}
