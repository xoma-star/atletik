import { getDb } from "@/lib/db";

export type StatsPeriod = "1h" | "6h" | "24h" | "7d" | "30d";

const intervals: Record<StatsPeriod, string> = {
  "1h": "1 hour",
  "6h": "6 hours",
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

export async function getStats(period: StatsPeriod = "24h") {
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
      time: r.recorded_at as string,
    })),
  };
}
