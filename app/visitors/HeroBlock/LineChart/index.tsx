'use client';

import {useChartContext} from '../../ChartContext';
import {useT, useLocale} from '../../LocaleContext';
import {useLineChartDimensions} from './hooks/useLineChartDimensions';
import {useLinePaths} from './hooks/useLinePaths';
import {useXTicks} from './hooks/useXTicks';
import {useLineTooltip} from './hooks/useLineTooltip';
import {LineChartHeader} from './LineChartHeader';
import {YGridLines} from './YGridLines';
import {XAxis} from './XAxis';
import {PulseMarker} from './PulseMarker';
import {LineTooltip} from './LineTooltip';

export function LineChart() {
  const {rangeData, activeFilter, loading, appliedFrom, appliedTo, forecastPoints} = useChartContext();
  const t = useT();
  const locale = useLocale();
  const {containerRef, isMobile, W, H, PAD_L, PAD_R, PAD_T, iw, ih} = useLineChartDimensions();

  const isToday = activeFilter === 'today';
  const {data, minT, maxT, spanMs, xFor, yFor, realPath, projPath, lastReal, showPulse} = useLinePaths({
    rangeData,
    forecastPoints,
    isToday,
    locale,
    PAD_L,
    iw,
    PAD_T,
    ih
  });
  const {ticks, isMultiDay} = useXTicks({spanMs, minT, maxT, isMobile, locale, PAD_L, iw});
  const {tooltip, handleMouseMove, hide} = useLineTooltip({data, xFor, yFor, W, PAD_L, PAD_R});

  const titlePeriod = isToday ? t.today.toLowerCase() : `${appliedFrom} — ${appliedTo}`;

  return (
    <section
      ref={containerRef}
      className="border border-on-surface bg-surface mb-6 md:mb-8"
      style={{padding: isMobile ? 12 : 18}}
    >
      <LineChartHeader titlePeriod={titlePeriod} isToday={isToday} />

      {data.length === 0 ? (
        <p className="text-center py-16 font-mono text-[11px]">{loading ? t.loading : t.noPeriodData}</p>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{display: 'block'}}
            onMouseMove={handleMouseMove}
            onMouseLeave={hide}
          >
            <YGridLines yFor={yFor} PAD_L={PAD_L} W={W} PAD_R={PAD_R} />
            <XAxis ticks={ticks} axisY={PAD_T + ih} isMultiDay={isMultiDay} />

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

            {showPulse && lastReal && <PulseMarker cx={xFor(lastReal.time)} cy={yFor(lastReal.visitors!)} />}
          </svg>

          {tooltip && <LineTooltip tooltip={tooltip} W={W} H={H} />}
        </div>
      )}
    </section>
  );
}
