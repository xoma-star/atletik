import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { fetchVisitorCount } from "@/lib/fetcher";

function authorize(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.CRON_SECRET) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();

    // Создаём таблицу если ещё нет
    await initDb();

    // Получаем текущее кол-во посетителей
    const count = await fetchVisitorCount();

    // Сохраняем в БД
    await sql`
      INSERT INTO visitor_stats (visitor_count, recorded_at)
      VALUES (${count}, NOW())
    `;

    return NextResponse.json({
      ok: true,
      visitors: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
