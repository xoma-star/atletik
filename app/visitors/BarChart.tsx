'use client';

import {BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {useChartContext} from './ChartContext';
import {useT, useLocale} from './LocaleContext';
import {fmtHour, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_ITEM_STYLE} from './utils';

export function BarChart() {
  const {hourlyData} = useChartContext();
  const t = useT();
  const locale = useLocale();

  const data = hourlyData.map((p) => ({...p, label: fmtHour(p.hour)}));
  const today = new Intl.DateTimeFormat(locale, {weekday: 'long'}).format(new Date());

  return (
    <section className="rounded-xl p-4 border border-on-surface">
      <h2 className="text-base font-semibold mb-4 text-on-surface">
        {t.avgLoadToday} <span className="text-sm font-normal">({today})</span>
      </h2>
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
