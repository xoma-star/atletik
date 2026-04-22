import {getDb} from '@/lib/db';

export type StatsPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

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
