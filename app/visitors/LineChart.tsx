'use client';

import {LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {useChartContext} from './ChartContext';
import {fmtDateTime, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_ITEM_STYLE} from './utils';

export function LineChart() {
  const {rangeData, loading} = useChartContext();

  const data = rangeData.map((p) => ({...p, label: fmtDateTime(p.time)}));

  return (
    <div className="rounded-xl p-4 border border-on-surface">
      {data.length === 0 ? (
        <p className="text-center py-16 text-sm text-on-surface">
          {loading ? 'Загрузка данных…' : 'Нет данных за выбранный период'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ReLineChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--on-surface)" strokeWidth={0.4} />
            <XAxis
              dataKey="label"
              tick={{fill: 'var(--on-surface)', fontSize: 11}}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis tick={{fill: 'var(--on-surface)', fontSize: 11}} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              name="Посетители"
              stroke="var(--on-surface)"
              strokeWidth={2}
              dot={false}
              activeDot={{r: 4}}
              isAnimationActive={false}
            />
          </ReLineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
