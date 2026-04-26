type Props = {
  /** Час в формате 0–23, отображается подписью под столбцом. */
  hour: number;
  /** X-координата центра столбца в SVG-единицах. */
  cx: number;
  /** Ширина столбца в SVG-единицах. */
  bw: number;
  /** Y-координата верхней грани столбца (начало `<rect>`). */
  y: number;
  /** Высота столбца в SVG-единицах. */
  barH: number;
  /** Y-координата подписи часа под осью X. */
  labelY: number;
  /** Вызывается при наведении курсора на столбец. */
  onMouseEnter: () => void;
};

export function ChartBar({hour, cx, bw, y, barH, labelY, onMouseEnter}: Props) {
  return (
    <g onMouseEnter={onMouseEnter}>
      <rect x={cx - bw / 2} y={y} width={bw} height={barH} fill="var(--on-surface)" />
      <text x={cx} y={labelY} textAnchor="middle" fontSize="10" fill="var(--on-surface)" opacity="0.7">
        {String(hour).padStart(2, '0')}
      </text>
    </g>
  );
}
