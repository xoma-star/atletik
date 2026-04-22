'use client';

import {ChartProvider} from './ChartContext';
import {LocaleProvider} from './LocaleContext';
import {FilterBar} from './FilterBar';
import {ErrorBanner} from './ErrorBanner';
import {LineChart} from './LineChart';
import {BarChart} from './BarChart';
import type {RangePoint, HourlyPoint} from './utils';
import type {Locale, Translations} from '@/lib/i18n';

type Props = {
  initialRangeData: RangePoint[];
  initialHourlyData: HourlyPoint[];
  initialError: string | null;
  locale: Locale;
  t: Translations;
};

export function VisitorsWidget({initialRangeData, initialHourlyData, initialError, locale, t}: Props) {
  return (
    <LocaleProvider locale={locale} t={t}>
      <ChartProvider initialData={{rangeData: initialRangeData, hourlyData: initialHourlyData, initialError}}>
        <div className="flex flex-col gap-8">
          <FilterBar />
          <ErrorBanner />
          <LineChart />
          <BarChart />
        </div>
      </ChartProvider>
    </LocaleProvider>
  );
}
