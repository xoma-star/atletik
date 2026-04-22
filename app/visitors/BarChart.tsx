'use client';

import {BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {useChartContext} from './ChartContext';
import {useT, useLocale} from './LocaleContext';
import {fmtHour, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_ITEM_STYLE} from './utils';

// Воскресенье = 0, понедельник = 1, ... — стандарт JS
// Берём 7 дат, начиная с воскресенья 2021-01-03
const EPOCH_SUNDAY = new Date(2021, 0, 3);

function getDayLabel(dow: number, locale: string, format: 'short' | 'long'): string {
  const d = new Date(EPOCH_SUNDAY);
  d.setDate(d.getDate() + dow);
  return new Intl.DateTimeFormat(locale, {weekday: format}).format(d);
}

// Первый день недели по локали (0 = вс, 1 = пн)
const WEEK_FIRST_DAY: Partial<Record<string, number>> = {ru: 1};

function getWeekDays(locale: string): number[] {
  const first = WEEK_FIRST_DAY[locale] ?? 0;
  return Array.from({length: 7}, (_, i) => (first + i) % 7);
}

export function BarChart() {
  const {hourlyData, selectedDow, handleDowChange} = useChartContext();
  const t = useT();
  const locale = useLocale();

  const data = hourlyData.map((p) => ({...p, label: fmtHour(p.hour)}));
  const todayDow = new Date().getDay();

  const activeStyle = {background: 'var(--on-surface)', color: 'var(--surface)'};
  const inactiveStyle = {background: 'var(--surface)', color: 'var(--on-surface)'};

  return (
    <section className="rounded-xl p-4 border border-on-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-on-surface">
          {t.avgLoad} <span className="text-sm font-normal">({getDayLabel(selectedDow, locale, 'long')})</span>
        </h2>
        <div className="flex gap-1">
          {getWeekDays(locale).map((i) => (
            <button
              key={i}
              onClick={() => handleDowChange(i)}
              className="rounded-md px-2 py-1 text-xs font-medium border border-on-surface transition-colors"
              style={selectedDow === i ? activeStyle : inactiveStyle}
              aria-current={i === todayDow ? 'date' : undefined}
            >
              {getDayLabel(i, locale, 'short')}
            </button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-center py-16 text-sm text-on-surface">{t.noData}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ReBarChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--on-surface)" strokeWidth={0.4} vertical={false} />
            <XAxis dataKey="label" tick={{fill: 'var(--on-surface)', fontSize: 11}} tickLine={false} />
            <YAxis tick={{fill: 'var(--on-surface)', fontSize: 11}} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Bar
              dataKey="avg"
              name={t.visitors}
              fill="var(--on-surface)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </ReBarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
