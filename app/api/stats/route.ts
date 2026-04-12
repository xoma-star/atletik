import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Период: 1h, 6h, 24h, 7d, 30d (по умолчанию 24h)
  const period = searchParams.get("period") || "24h";

  const intervals: Record<string, string> = {
    "1h": "1 hour",
    "6h": "6 hours",
    "24h": "24 hours",
    "7d": "7 days",
    "30d": "30 days",
  };

  const interval = intervals[period] ?? "24 hours";

  try {
    const sql = getDb();

    const rows = await sql`
      SELECT
        visitor_count,
        recorded_at
      FROM visitor_stats
      WHERE recorded_at > NOW() - CAST(${interval} AS INTERVAL)
      ORDER BY recorded_at ASC
    `;

    // Текущее значение (последняя запись)
    const latest = await sql`
      SELECT visitor_count, recorded_at
      FROM visitor_stats
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      current: latest[0]?.visitor_count ?? null,
      lastUpdated: latest[0]?.recorded_at ?? null,
      period,
      data: rows.map((r) => ({
        visitors: r.visitor_count,
        time: r.recorded_at,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
