import {getDb} from '@/lib/db';

export type StatsPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

export const CAPACITY = 140;

export type ForecastPoint = {
  label: string;
  val: number;
  now?: boolean;
};

export function computeForecast(current: number, now = new Date()): ForecastPoint[] {
  const base = new Date(now);
  base.setSeconds(0, 0);
  base.setMinutes(Math.floor(base.getMinutes() / 15) * 15);
  return Array.from({length: 5}, (_, i) => {
    const t = new Date(base.getTime() + i * 15 * 60 * 1000);
    const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    const val = Math.max(0, Math.min(CAPACITY, Math.round(current - i * 2)));
    return {label, val, ...(i === 0 ? {now: true} : {})};
  });
}

export async function getForecastFromTrend(tz = 'UTC'): Promise<ForecastPoint[]> {
  const sql = getDb();

  // Текущее значение
  const latestRow = await sql`
    SELECT visitor_count FROM visitor_stats ORDER BY recorded_at DESC LIMIT 1
  `;
  if (latestRow.length === 0) return [];
  const current = latestRow[0].visitor_count as number;

  // День недели и текущее время в запрошенном часовом поясе
  const now = new Date();
  const localStr = now.toLocaleString('en-US', {
    timeZone: tz,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  });
  // Парсим вручную, чтобы не тащить библиотеки: используем Intl
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(now);
  const localHour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const localMinute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);

  // Средние по часам для дня недели
  const avgRows = await sql`
    SELECT
      EXTRACT(HOUR FROM recorded_at AT TIME ZONE ${tz})::int AS hour,
      ROUND(AVG(visitor_count))::int AS avg_visitors
    FROM visitor_stats
    WHERE EXTRACT(DOW FROM recorded_at AT TIME ZONE ${tz}) = EXTRACT(DOW FROM NOW() AT TIME ZONE ${tz})
    GROUP BY hour
    ORDER BY hour
  `;

  if (avgRows.length === 0) return [];

  const avgs: Record<number, number> = {};
  for (const row of avgRows) avgs[row.hour as number] = row.avg_visitors as number;

  // Линейная интерполяция между часами
  const interpAvg = (h: number, m: number): number => {
    const a0 = avgs[h];
    if (a0 === undefined) return current;
    if (m === 0) return a0;
    const a1 = avgs[h + 1] ?? a0;
    return a0 + (a1 - a0) * (m / 60);
  };

  // Смещение: сдвигаем кривую средних так, чтобы она начиналась с текущего значения
  const baseMin = Math.floor(localMinute / 15) * 15;
  const baseAvg = interpAvg(localHour, baseMin);
  const offset = Math.round(current - baseAvg);

  // Генерируем точки от текущего момента до полуночи (шаг 15 мин)
  const points: ForecastPoint[] = [];
  let h = localHour;
  let m = baseMin;
  let first = true;
  while (h < 24) {
    const avg = interpAvg(h, m);
    const val = Math.max(0, Math.min(CAPACITY, Math.round(avg + offset)));
    const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    points.push({label, val, ...(first ? {now: true} : {})});
    first = false;
    m += 15;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }

  return points;
}

const intervals: Record<StatsPeriod, string> = {
  '1h': '1 hour',
  '6h': '6 hours',
  '24h': '24 hours',
  '7d': '7 days',
  '30d': '30 days'
};

export async function getStats(period: StatsPeriod = '24h') {
  const sql = getDb();
  const interval = intervals[period];

  const rows = await sql`
    SELECT visitor_count, recorded_at
    FROM visitor_stats
    WHERE recorded_at > NOW() - CAST(${interval} AS INTERVAL)
    ORDER BY recorded_at ASC
  `;

  const latest = await sql`
    SELECT visitor_count, recorded_at
    FROM visitor_stats
    ORDER BY recorded_at DESC
    LIMIT 1
  `;

  return {
    current: (latest[0]?.visitor_count as number) ?? null,
    lastUpdated: (latest[0]?.recorded_at as string) ?? null,
    period,
    data: rows.map((r) => ({
      visitors: r.visitor_count as number,
      time: r.recorded_at as string
    }))
  };
}

export async function getStatsByRange(from: string, to: string) {
  const sql = getDb();

  const rows = await sql`
    SELECT visitor_count, recorded_at
    FROM visitor_stats
    WHERE recorded_at >= ${from}::timestamptz
      AND recorded_at <= ${to}::timestamptz
    ORDER BY recorded_at ASC
  `;

  return rows.map((r) => ({
    visitors: r.visitor_count as number,
    time: r.recorded_at as string
  }));
}

export async function getHourlyAvgByDayOfWeek(dayOfWeek: number, tz = 'UTC') {
  const sql = getDb();

  const rows = await sql`
    SELECT
      EXTRACT(HOUR FROM recorded_at AT TIME ZONE ${tz})::int AS hour,
      ROUND(AVG(visitor_count))::int AS avg_visitors
    FROM visitor_stats
    WHERE EXTRACT(DOW FROM recorded_at AT TIME ZONE ${tz}) = ${dayOfWeek}
    GROUP BY hour
    ORDER BY hour
  `;

  return rows.map((r) => ({
    hour: r.hour as number,
    avg: r.avg_visitors as number
  }));
}
