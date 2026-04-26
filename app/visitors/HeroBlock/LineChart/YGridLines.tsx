import {CAPACITY} from '@/lib/visitors';

const Y_TICKS = [0, Math.round(CAPACITY / 4), Math.round(CAPACITY / 2), Math.round((3 * CAPACITY) / 4), CAPACITY];

type Props = {
  /** Функция пересчёта количества посетителей в Y-координату SVG. */
  yFor: (v: number) => number;
  /** Отступ слева в SVG-единицах. */
  PAD_L: number;
  /** Полная ширина SVG-вьюпорта. */
  W: number;
  /** Отступ справа в SVG-единицах. */
  PAD_R: number;
};

export function YGridLines({yFor, PAD_L, W, PAD_R}: Props) {
  return (
    <>
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
          <text x={PAD_L - 8} y={yFor(v) + 3} textAnchor="end" fontSize="10" fill="var(--on-surface)" opacity="0.7">
            {v}
          </text>
        </g>
      ))}
    </>
  );
}
