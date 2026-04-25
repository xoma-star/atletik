import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {getStats, getStatsByRange, getHourlyAvgByDayOfWeek} from '@/lib/stats';
import {detectLocale, getTranslations} from '@/lib/i18n';
import {VisitorsWidget} from './visitors';

export const metadata: Metadata = {
  title: 'Посетители',
  description: 'Текущая загруженность зала и статистика посещений по дням и часам'
};

export default async function Home() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const acceptLanguage = (await headers()).get('accept-language');
  const locale = detectLocale(acceptLanguage);
  const t = getTranslations(locale);

  let current: number | null = null;
  let lastUpdated: string | null = null;
  let initialRangeData: Awaited<ReturnType<typeof getStatsByRange>> = [];
  let initialHourlyData: Awaited<ReturnType<typeof getHourlyAvgByDayOfWeek>> = [];
  let initialError: string | null = null;

  try {
    const [stats, rangeData, hourlyData] = await Promise.all([
      getStats(),
      getStatsByRange(todayStart.toISOString(), now.toISOString()),
      getHourlyAvgByDayOfWeek(now.getUTCDay())
    ]);
    current = stats.current;
    lastUpdated = stats.lastUpdated;
    initialRangeData = rangeData;
    initialHourlyData = hourlyData;
  } catch (e) {
    initialError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen">
      <VisitorsWidget
        initialRangeData={initialRangeData}
        initialHourlyData={initialHourlyData}
        initialError={initialError}
        initialCurrent={current}
        initialLastUpdated={lastUpdated}
        locale={locale}
        t={t}
      />
    </main>
  );
}
