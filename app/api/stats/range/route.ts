import {NextResponse} from 'next/server';
import {getStatsByRange} from '@/lib/stats';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({error: 'Missing required params: from, to'}, {status: 400});
  }

  // сравниваем только даты без времени, чтобы 22.03–22.04 = ровно 31 день
  const diffDays =
    (new Date(to.slice(0, 10)).getTime() - new Date(from.slice(0, 10)).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 31) {
    return NextResponse.json({error: 'Диапазон не может превышать 31 день'}, {status: 400});
  }

  try {
    const data = await getStatsByRange(from, to);
    return NextResponse.json({data});
  } catch (error) {
    console.error('Stats range error:', error);
    return NextResponse.json({error: error instanceof Error ? error.message : String(error)}, {status: 500});
  }
}
