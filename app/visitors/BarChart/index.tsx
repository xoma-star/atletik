'use client';

import {useChartContext} from '../ChartContext';
import {useT} from '../LocaleContext';
import {OPEN_HOUR, CAPACITY} from '@/lib/visitors';
import {useChartDimensions} from './hooks/useChartDimensions';
import {useTooltip} from './hooks/useTooltip';
import {DayPicker} from './DayPicker';
import {ChartLabel} from './ChartLabel';
import {ChartBar} from './ChartBar';
import {ChartTooltip} from './ChartTooltip';

const Y_TICKS = [0, 35, 70, 105, 140];

export function BarChart() {
  const {hourlyData, selectedDow, handleDowChange} = useChartContext();
  const t = useT();
  const {containerRef, isMobile, W, H, PAD_L, PAD_R, PAD_T, ih} = useChartDimensions();
  const {tooltip, show, hide} = useTooltip();

  const data = hourlyData.filter((p) => p.hour >= OPEN_HOUR);
  const n = data.length;
  const step = n > 0 ? (W - PAD_L - PAD_R) / n : W - PAD_L - PAD_R;
  const bw = step * 0.55;
  const yFor = (v: number) => PAD_T + ih - (v / CAPACITY) * ih;

  return (
    <section ref={containerRef} className="border border-on-surface bg-surface" style={{padding: isMobile ? 12 : 18}}>
      <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
        <ChartLabel selectedDow={selectedDow} />
        <DayPicker
          selectedDow={selectedDow}
          todayDow={new Date().getDay()}
          isMobile={isMobile}
          onSelect={handleDowChange}
        />
      </div>

      {data.length === 0 ? (
        <p className="text-center py-16 font-mono text-[11px]">{t.noData}</p>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display: 'block'}} onMouseLeave={hide}>
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
              const y = yFor(p.avg);
              return (
                <ChartBar
                  key={p.hour}
                  hour={p.hour}
                  cx={cx}
                  bw={bw}
                  y={y}
                  barH={Math.max(0, PAD_T + ih - y)}
                  labelY={PAD_T + ih + 18}
                  onMouseEnter={() => show({svgX: cx, svgY: y, hour: p.hour, avg: p.avg})}
                />
              );
            })}
          </svg>

          {tooltip && <ChartTooltip tooltip={tooltip} W={W} H={H} />}
        </div>
      )}
    </section>
  );
}
