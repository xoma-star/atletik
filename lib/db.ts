import {neon} from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

// Инициализация таблицы (вызывается один раз)
export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id SERIAL PRIMARY KEY,
      visitor_count INTEGER NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Индекс для быстрых запросов по дате
  await sql`
    CREATE INDEX IF NOT EXISTS idx_visitor_stats_recorded_at
    ON visitor_stats (recorded_at DESC)
  `;
}
