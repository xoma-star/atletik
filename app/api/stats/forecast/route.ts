import {NextResponse} from 'next/server';
import {getForecastFromTrend} from '@/lib/stats';

export async function GET(request: Request) {
  const tz = new URL(request.url).searchParams.get('tz') ?? 'UTC';
  try {
    const forecast = await getForecastFromTrend(tz);
    return NextResponse.json({forecast});
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json({error: error instanceof Error ? error.message : String(error)}, {status: 500});
  }
}
