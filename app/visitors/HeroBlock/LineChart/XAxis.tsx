import type {XTickData} from './hooks/useXTicks';

type Props = {
  /** Массив тиков с готовыми позициями и подписями. */
  ticks: XTickData[];
  /** Y-координата нижней границы области графика (`PAD_T + ih`). */
  axisY: number;
  /** `true`, если диапазон охватывает более одного дня — уменьшает размер шрифта подписей. */
  isMultiDay: boolean;
};

export function XAxis({ticks, axisY, isMultiDay}: Props) {
  return (
    <>
      {ticks.map(({ts, x, label}) => (
        <g key={ts}>
          <line x1={x} x2={x} y1={axisY} y2={axisY + 4} stroke="var(--on-surface)" strokeWidth="0.6" />
          <text
            x={x}
            y={axisY + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--on-surface)"
            opacity="0.7"
            style={{fontSize: isMultiDay ? 8 : 10}}
          >
            {label}
          </text>
        </g>
      ))}
    </>
  );
}
