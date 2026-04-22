import {NextResponse} from 'next/server';
import {getHourlyAvgByDayOfWeek} from '@/lib/stats';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const rawDay = searchParams.get('dow');
  const tz = searchParams.get('tz') ?? 'UTC';
  const dow = rawDay !== null ? parseInt(rawDay, 10) : new Date().getDay();

  if (isNaN(dow) || dow < 0 || dow > 6) {
    return NextResponse.json({error: 'Invalid dow param (0=Sun … 6=Sat)'}, {status: 400});
  }

  try {
    const data = await getHourlyAvgByDayOfWeek(dow, tz);
    return NextResponse.json({dow, data});
  } catch (error) {
    console.error('Hourly avg error:', error);
    return NextResponse.json({error: error instanceof Error ? error.message : String(error)}, {status: 500});
  }
}
