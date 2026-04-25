'use client';

import {useRef, useState, useEffect} from 'react';
import {useChartContext} from './ChartContext';
import {useT, useLocale} from './LocaleContext';
import {OPEN_HOUR} from './utils';

const EPOCH_SUNDAY = new Date(2021, 0, 3);

function getDayLabel(dow: number, locale: string, format: 'short' | 'long'): string {
  const d = new Date(EPOCH_SUNDAY);
  d.setDate(d.getDate() + dow);
  return new Intl.DateTimeFormat(locale, {weekday: format}).format(d);
}

const WEEK_FIRST_DAY: Partial<Record<string, number>> = {ru: 1};

function getWeekDays(locale: string): number[] {
  const first = WEEK_FIRST_DAY[locale] ?? 0;
  return Array.from({length: 7}, (_, i) => (first + i) % 7);
}

type TooltipState = {svgX: number; svgY: number; hour: number; avg: number} | null;

const Y_TICKS = [0, 25, 50, 75, 100];

export function BarChart() {
  const {hourlyData, selectedDow, handleDowChange} = useChartContext();
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
  const H = isMobile ? 200 : 220;
  const PAD_L = isMobile ? 36 : 48;
  const PAD_R = isMobile ? 10 : 16;
  const PAD_T = 16,
    PAD_B = 36;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;

  const data = hourlyData.filter((p) => p.hour >= OPEN_HOUR);
  const n = data.length;
  const step = n > 0 ? iw / n : iw;
  const bw = step * 0.55;
  const yFor = (v: number) => PAD_T + ih - (v / 100) * ih;

  const sectionPad = isMobile ? 12 : 18;
  const mono = 'var(--font-geist-mono), monospace';
  const weekDays = getWeekDays(locale);
  const todayDow = new Date().getDay();

  return (
    <section ref={containerRef} className="border border-on-surface bg-surface" style={{padding: sectionPad}}>
      <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
        <div className="font-mono text-[10px] md:text-[11px] tracking-[0.08em] uppercase">
          {t.avgLoad} · <span className="opacity-60">({getDayLabel(selectedDow, locale, 'long')})</span>
        </div>
        <div className="flex border border-on-surface">
          {weekDays.map((dow, i) => (
            <button
              key={dow}
              onClick={() => handleDowChange(dow)}
              aria-current={dow === todayDow ? 'date' : undefined}
              className={`font-mono text-[10px] uppercase cursor-pointer border-none ${
                selectedDow === dow ? 'bg-on-surface text-surface' : 'bg-transparent text-on-surface'
              }`}
              style={{
                padding: isMobile ? '4px 7px' : '5px 10px',
                borderLeft: i === 0 ? 'none' : '1px solid var(--on-surface)'
              }}
            >
              {getDayLabel(dow, locale, 'short')}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center py-16 font-mono text-[11px]">{t.noData}</p>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display: 'block'}} onMouseLeave={() => setTooltip(null)}>
            {Y_TICKS.map((v) => (
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

            {data.map((p, i) => {
              const cx = PAD_L + step * i + step / 2;
              const barH = Math.max(0, PAD_T + ih - yFor(p.avg));
              const y = yFor(p.avg);
              return (
                <g key={p.hour} onMouseEnter={() => setTooltip({svgX: cx, svgY: y, hour: p.hour, avg: p.avg})}>
                  <rect x={cx - bw / 2} y={y} width={bw} height={barH} fill="var(--on-surface)" />
                  <text
                    x={cx}
                    y={PAD_T + ih + 18}
                    textAnchor="middle"
                    fontFamily={mono}
                    fontSize="10"
                    fill="var(--on-surface)"
                    opacity="0.7"
                  >
                    {String(p.hour).padStart(2, '0')}
                  </text>
                </g>
              );
            })}
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
              <div className="opacity-70">{String(tooltip.hour).padStart(2, '0')}:00</div>
              <div>
                {t.visitors}: {tooltip.avg}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
