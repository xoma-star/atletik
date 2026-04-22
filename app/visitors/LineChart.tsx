'use client';

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
  type TooltipPayloadEntry,
  type DotItemDotProps
} from 'recharts';
import {useChartContext} from './ChartContext';
import {useT, useLocale} from './LocaleContext';
import {
  fmtDateTime,
  toDateInput,
  OPEN_HOUR,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE
} from './utils';
import type {Translations} from '@/lib/i18n';

type LinePoint = {
  time: string;
  label: string;
  visitors: number | null;
  projected: number | null;
};

function LineTooltip({active, payload, label, t}: TooltipContentProps & {t: Translations}) {
  if (!active || !payload?.length) return null;
  const real = payload.find((p: TooltipPayloadEntry) => p.dataKey === 'visitors' && p.value != null);
  const proj = payload.find((p: TooltipPayloadEntry) => p.dataKey === 'projected' && p.value != null);
  const item = real ?? proj;
  if (!item) return null;
  return (
    <div style={{...TOOLTIP_CONTENT_STYLE, padding: '10px 14px'}}>
      <p style={TOOLTIP_LABEL_STYLE}>{label}</p>
      <p style={TOOLTIP_ITEM_STYLE}>
        {t.visitors}: {item.value}
      </p>
    </div>
  );
}

const INTERVAL_MS = 15 * 60 * 1000;

function buildLineData(
  rangeData: {visitors: number; time: string}[],
  to: string,
  activeFilter: string,
  locale: string | undefined
): LinePoint[] {
  const filtered: LinePoint[] = rangeData
    .filter((p) => new Date(p.time).getHours() >= OPEN_HOUR)
    .map((p) => ({
      time: p.time,
      label: fmtDateTime(p.time, locale),
      visitors: p.visitors,
      projected: null
    }));

  const today = toDateInput(new Date());
  const shouldProject = (activeFilter === 'today' || to === today) && filtered.length > 0;

  if (!shouldProject) return filtered;

  const lastPoint = filtered[filtered.length - 1];
  const lastVisitors = lastPoint.visitors ?? 0;
  const lastTime = new Date(lastPoint.time);

  const [year, month, day] = to.split('-').map(Number);
  const midnight = new Date(year, month - 1, day + 1, 0, 0, 0);

  if (lastTime >= midnight) return filtered;

  const projected: LinePoint[] = [];
  const cur = new Date(lastTime.getTime() + INTERVAL_MS);

  while (cur < midnight) {
    projected.push({
      time: cur.toISOString(),
      label: fmtDateTime(cur.toISOString(), locale),
      visitors: null,
      projected: lastVisitors
    });
    cur.setTime(cur.getTime() + INTERVAL_MS);
  }

  projected.push({
    time: midnight.toISOString(),
    label: fmtDateTime(midnight.toISOString(), locale),
    visitors: null,
    projected: lastVisitors
  });

  if (projected.length === 0) return filtered;

  return [...filtered.slice(0, -1), {...lastPoint, projected: lastVisitors}, ...projected];
}

function PulsingDot({cx, cy}: {cx: number; cy: number}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="var(--on-surface)" opacity={0.3}>
        <animate attributeName="r" values="5;13;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={4} fill="var(--on-surface)" />
    </g>
  );
}

export function LineChart() {
  const {rangeData, activeFilter, to, loading} = useChartContext();
  const t = useT();
  const locale = useLocale();

  const data = buildLineData(rangeData, to, activeFilter, locale);
  const lastRealIdx = data.reduce((acc, p, i) => (p.visitors !== null ? i : acc), -1);

  const renderDot = ({cx, cy, index}: DotItemDotProps) => {
    if (index !== lastRealIdx || cx == null || cy == null) return <g key={index} />;
    return <PulsingDot key={index} cx={cx as number} cy={cy as number} />;
  };

  return (
    <section aria-label={t.visitors} className="rounded-xl p-4 border border-on-surface">
      {data.length === 0 ? (
        <p className="text-center py-16 text-sm text-on-surface">{loading ? t.loading : t.noPeriodData}</p>
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
            <Tooltip content={(props) => <LineTooltip {...props} t={t} />} />
            <Line
              type="monotone"
              dataKey="visitors"
              name={t.visitors}
              stroke="var(--on-surface)"
              strokeWidth={2}
              dot={renderDot}
              activeDot={{r: 4}}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="linear"
              dataKey="projected"
              name=""
              stroke="var(--on-surface)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </ReLineChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
