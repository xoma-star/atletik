'use client';

import {ChartProvider} from './ChartContext';
import {FilterBar} from './FilterBar';
import {ErrorBanner} from './ErrorBanner';
import {LineChart} from './LineChart';
import {BarChart} from './BarChart';
import type {RangePoint, HourlyPoint} from './utils';

type Props = {
  initialRangeData: RangePoint[];
  initialHourlyData: HourlyPoint[];
};

export function VisitorsWidget({initialRangeData, initialHourlyData}: Props) {
  return (
    <ChartProvider initialData={{rangeData: initialRangeData, hourlyData: initialHourlyData}}>
      <div className="flex flex-col gap-8">
        <FilterBar />
        <ErrorBanner />
        <LineChart />
        <BarChart />
      </div>
    </ChartProvider>
  );
}
