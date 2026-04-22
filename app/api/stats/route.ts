import {NextResponse} from 'next/server';
import {getStats, StatsPeriod} from '@/lib/stats';

const VALID_PERIODS = new Set<StatsPeriod>(['1h', '6h', '24h', '7d', '30d']);

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const raw = searchParams.get('period') ?? '24h';
  const period: StatsPeriod = VALID_PERIODS.has(raw as StatsPeriod) ? (raw as StatsPeriod) : '24h';

  try {
    const stats = await getStats(period);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({error: error instanceof Error ? error.message : String(error)}, {status: 500});
  }
}
