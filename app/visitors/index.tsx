'use client';

import {ChartProvider} from './ChartContext';
import {LocaleProvider} from './LocaleContext';
import {Header} from './Header';
import {HeroBlock} from './HeroBlock';
import {FilterBar} from './FilterBar';
import {ErrorBanner} from './ErrorBanner';
import {LineChart} from './HeroBlock/LineChart';
import {BarChart} from './BarChart';
import type {RangePoint, HourlyPoint} from '@/lib/visitors';
import type {Locale, Translations} from '@/lib/i18n';

type Props = {
  initialRangeData: RangePoint[];
  initialHourlyData: HourlyPoint[];
  initialError: string | null;
  initialCurrent: number | null;
  initialLastUpdated: string | null;
  locale: Locale;
  t: Translations;
};

export function VisitorsWidget({
  initialRangeData,
  initialHourlyData,
  initialError,
  initialCurrent,
  initialLastUpdated,
  locale,
  t
}: Props) {
  return (
    <LocaleProvider locale={locale} t={t}>
      <ChartProvider
        initialData={{
          rangeData: initialRangeData,
          hourlyData: initialHourlyData,
          initialError,
          initialCurrent,
          initialLastUpdated
        }}
      >
        <div className="pt-8 px-5 pb-10 md:pt-14 md:px-16 md:pb-16">
          <Header />
          <HeroBlock />
          <FilterBar />
          <ErrorBanner />
          <LineChart />
          <BarChart />
        </div>
      </ChartProvider>
    </LocaleProvider>
  );
}
