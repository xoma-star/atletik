'use client';

import {useRef, useState, useEffect, useMemo} from 'react';
import {useChartContext} from './ChartContext';
import {useT, useLocale} from './LocaleContext';
import {OPEN_HOUR, CAPACITY, fmtDateTime} from './utils';

type LinePoint = {time: string; label: string; visitors: number | null};
type TooltipState = {svgX: number; svgY: number; label: string; val: number} | null;

function buildLineData(rangeData: {visitors: number; time: string}[], locale: string | undefined): LinePoint[] {
  return rangeData
    .filter((p) => new Date(p.time).getHours() >= OPEN_HOUR)
    .map((p) => ({time: p.time, label: fmtDateTime(p.time, locale), visitors: p.visitors}));
}

const yTicks = [0, Math.round(CAPACITY / 4), Math.round(CAPACITY / 2), Math.round((3 * CAPACITY) / 4), CAPACITY];

export function LineChart() {
  const {rangeData, activeFilter, loading, appliedFrom, appliedTo, forecastPoints} = useChartContext();
  const t = useT();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(960);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isMobile = cw < 640;
  const W = isMobile ? 640 : 1000;
  const H = isMobile ? 220 : 280;
  const PAD_L = isMobile ? 36 : 48;
  const PAD_R = isMobile ? 10 : 16;
  const PAD_T = 16,
    PAD_B = 36;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;

  const data = useMemo(
    () => buildLineData(rangeData, locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeData, locale]
  );

  const isToday = activeFilter === 'today';

  // Build forecast time points from API data
  const forecastTimedPoints = useMemo(() => {
    if (!isToday || forecastPoints.length === 0) return [];
    const today = new Date();
    return forecastPoints.map((p) => {
      const [h, m] = p.label.split(':').map(Number);
      const d = new Date(today);
      d.setHours(h, m, 0, 0);
      return {time: d.toISOString(), val: p.val};
    });
  }, [isToday, forecastPoints]);

  // Time range spans real data + forecast points
  const dataTimes = data.map((p) => new Date(p.time).getTime());
  const forecastTimes = forecastTimedPoints.map((p) => new Date(p.time).getTime());
  const allTimes = [...dataTimes, ...forecastTimes].sort((a, b) => a - b);
  const minT = allTimes[0] ?? 0;
  const maxT = allTimes[allTimes.length - 1] ?? 1;
  const spanMs = maxT - minT;

  const xFor = (timeStr: string) => {
    const t = new Date(timeStr).getTime();
    return PAD_L + ((t - minT) / Math.max(spanMs, 1)) * iw;
  };
  const yFor = (v: number) => PAD_T + ih - (v / CAPACITY) * ih;

  // Real line path
  const realPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.time).toFixed(1)} ${yFor(p.visitors!).toFixed(1)}`)
    .join(' ');

  const lastReal = data[data.length - 1] ?? null;

  // Projected path from forecast API points
  const projPath = useMemo(() => {
    if (!isToday || !lastReal || forecastTimedPoints.length === 0) return '';
    const lastRealMs = new Date(lastReal.time).getTime();
    const futurePoints = forecastTimedPoints.filter((p) => new Date(p.time).getTime() >= lastRealMs);
    if (futurePoints.length === 0) return '';
    const points = [
      {time: lastReal.time, val: lastReal.visitors!},
      ...futurePoints.filter((p) => new Date(p.time).getTime() > lastRealMs)
    ];
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.time).toFixed(1)} ${yFor(p.val).toFixed(1)}`)
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, lastReal, forecastTimedPoints, minT, maxT, PAD_L, iw, PAD_T, ih]);

  const showPulse = projPath.length > 0;

  // X ticks
  const hourMs = 3_600_000;
  const dayMs = 86_400_000;
  const spanDays = spanMs / dayMs;
  const isMultiDay = spanDays > 1.5;

  const xTicks: number[] = [];
  if (spanMs > 0) {
    if (isMultiDay) {
      const d = new Date(minT);
      d.setHours(0, 0, 0, 0);
      while (d.getTime() <= maxT) {
        xTicks.push(d.getTime());
        d.setDate(d.getDate() + 1);
      }
    } else {
      const step = isMobile ? 3 : 2;
      const startH = Math.ceil(minT / hourMs) * hourMs;
      for (let ts = startH; ts <= maxT; ts += step * hourMs) xTicks.push(ts);
    }
  }

  const fmtXTick = (ts: number) => {
    const d = new Date(ts);
    if (isMultiDay) return d.toLocaleDateString(locale, {day: 'numeric', month: 'short'});
    return String(d.getHours()).padStart(2, '0');
  };

  const mono = 'var(--font-geist-mono), monospace';
  const sectionPad = isMobile ? 12 : 18;
  const titlePeriod = isToday ? t.today.toLowerCase() : `${appliedFrom} — ${appliedTo}`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    if (svgX < PAD_L || svgX > W - PAD_R) {
      setTooltip(null);
      return;
    }
    let nearest: LinePoint | null = null;
    let minDist = Infinity;
    for (const p of data) {
      const dist = Math.abs(xFor(p.time) - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
    if (nearest)
      setTooltip({
        svgX: xFor(nearest.time),
        svgY: yFor(nearest.visitors!),
        label: nearest.label,
        val: nearest.visitors!
      });
  };

  return (
    <section
      ref={containerRef}
      className="border border-on-surface bg-surface mb-6 md:mb-8"
      style={{padding: sectionPad}}
    >
      <div className="flex justify-between items-baseline mb-3 gap-3 flex-wrap font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase">
        <span>линия · {titlePeriod}</span>
        {isToday && (
          <span className="opacity-60">
            — {t.realLine} · - - - {t.projLine}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-center py-16 font-mono text-[11px]">{loading ? t.loading : t.noPeriodData}</p>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{display: 'block'}}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
          >
            {yTicks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={yFor(v)}
                  y2={yFor(v)}
                  stroke="var(--on-surface)"
                  strokeWidth="0.4"
                  strokeDasharray="2 3"
                  opacity="0.5"
                />
                <text
                  x={PAD_L - 8}
                  y={yFor(v) + 3}
                  textAnchor="end"
                  fontFamily={mono}
                  fontSize="10"
                  fill="var(--on-surface)"
                  opacity="0.7"
                >
                  {v}
                </text>
              </g>
            ))}

            {xTicks.map((ts) => {
              const x = PAD_L + ((ts - minT) / Math.max(spanMs, 1)) * iw;
              return (
                <g key={ts}>
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD_T + ih}
                    y2={PAD_T + ih + 4}
                    stroke="var(--on-surface)"
                    strokeWidth="0.6"
                  />
                  <text
                    x={x}
                    y={PAD_T + ih + 18}
                    textAnchor="middle"
                    fontFamily={mono}
                    fontSize="10"
                    fill="var(--on-surface)"
                    opacity="0.7"
                    style={{fontSize: isMultiDay ? 8 : 10}}
                  >
                    {fmtXTick(ts)}
                  </text>
                </g>
              );
            })}

            {realPath && <path d={realPath} fill="none" stroke="var(--on-surface)" strokeWidth="1.5" />}
            {projPath && (
              <path
                d={projPath}
                fill="none"
                stroke="var(--on-surface)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.7"
              />
            )}

            {showPulse && lastReal && (
              <>
                <circle
                  cx={xFor(lastReal.time)}
                  cy={yFor(lastReal.visitors!)}
                  r="5"
                  fill="var(--on-surface)"
                  opacity="0.25"
                >
                  <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={xFor(lastReal.time)} cy={yFor(lastReal.visitors!)} r="3.5" fill="var(--on-surface)" />
              </>
            )}
          </svg>

          {tooltip && (
            <div
              className="absolute pointer-events-none border border-on-surface bg-surface font-mono text-[11px] whitespace-nowrap"
              style={{
                left: `${(tooltip.svgX / W) * 100}%`,
                top: `${(tooltip.svgY / H) * 100}%`,
                transform: 'translate(-50%, -100%) translateY(-8px)',
                padding: '8px 12px'
              }}
            >
              <div className="opacity-70">{tooltip.label}</div>
              <div>
                {t.visitors}: {tooltip.val}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
