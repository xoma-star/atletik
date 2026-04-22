import {getStats, getStatsByRange, getHourlyAvgByDayOfWeek} from '@/lib/stats';
import {VisitorsWidget} from './visitors';

export default async function Home() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{current, lastUpdated}, initialRangeData, initialHourlyData] = await Promise.all([
    getStats(),
    getStatsByRange(weekAgo.toISOString(), now.toISOString()),
    getHourlyAvgByDayOfWeek(now.getUTCDay()) // UTC — timezone уточнится на клиенте
  ]);

  const updatedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="min-h-screen px-6 py-10 md:px-12 md:py-14">
      <div className="mx-auto max-w-4xl flex flex-col gap-8">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold text-on-surface">Посетители</h1>
          <div className="flex items-baseline gap-3">
            {current !== null && <span className="text-3xl font-bold tabular-nums text-on-surface">{current}</span>}
            {updatedAt && <span className="text-sm text-on-surface">обновлено {updatedAt}</span>}
          </div>
        </header>

        <VisitorsWidget initialRangeData={initialRangeData} initialHourlyData={initialHourlyData} />
      </div>
    </div>
  );
}
