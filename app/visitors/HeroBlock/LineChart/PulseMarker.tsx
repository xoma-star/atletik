type Props = {
  /** X-координата центра пульсирующей точки в SVG-единицах. */
  cx: number;
  /** Y-координата центра пульсирующей точки в SVG-единицах. */
  cy: number;
};

export function PulseMarker({cx, cy}: Props) {
  return (
    <>
      <circle cx={cx} cy={cy} r="5" fill="var(--on-surface)" opacity="0.25">
        <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="3.5" fill="var(--on-surface)" />
    </>
  );
}
