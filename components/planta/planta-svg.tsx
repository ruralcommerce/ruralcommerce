/** Metres → SVG. Origin at back-left of the 4.0 × 5.5 m room. */
export const M = 100;
export const OX = 96;
export const OY = 72;

export function sx(metres: number) {
  return OX + metres * M;
}

export function sy(metres: number) {
  return OY + metres * M;
}

export function DimH({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  const a = sx(x1);
  const b = sx(x2);
  const yy = sy(y);
  const mid = (a + b) / 2;
  return (
    <g fill="#071F5E" stroke="#071F5E" strokeWidth="1">
      <line x1={a} y1={yy - 6} x2={a} y2={yy + 6} />
      <line x1={b} y1={yy - 6} x2={b} y2={yy + 6} />
      <line x1={a} y1={yy} x2={b} y2={yy} />
      <text x={mid} y={yy - 8} textAnchor="middle" stroke="none" fontSize="11" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

export function DimV({
  x,
  y1,
  y2,
  label,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
}) {
  const xx = sx(x);
  const a = sy(y1);
  const b = sy(y2);
  const mid = (a + b) / 2;
  return (
    <g fill="#071F5E" stroke="#071F5E" strokeWidth="1">
      <line x1={xx - 6} y1={a} x2={xx + 6} y2={a} />
      <line x1={xx - 6} y1={b} x2={xx + 6} y2={b} />
      <line x1={xx} y1={a} x2={xx} y2={b} />
      <text
        x={xx - 10}
        y={mid}
        textAnchor="middle"
        stroke="none"
        fontSize="11"
        fontWeight="700"
        transform={`rotate(-90 ${xx - 10} ${mid})`}
      >
        {label}
      </text>
    </g>
  );
}

export function RoomOutline() {
  return (
    <rect
      x={sx(0)}
      y={sy(0)}
      width={4 * M}
      height={5.5 * M}
      fill="#fffdf8"
      stroke="#071F5E"
      strokeWidth="4"
    />
  );
}

export function DoorsAndWindow() {
  return (
    <g>
      {/* Back door to acopio — right */}
      <path d={`M ${sx(3.15)} ${sy(0)} A 70 70 0 0 1 ${sx(3.85)} ${sy(0.7)}`} fill="none" stroke="#071F5E" strokeWidth="1.5" />
      <line x1={sx(3.15)} y1={sy(0)} x2={sx(3.85)} y2={sy(0.05)} stroke="#071F5E" strokeWidth="3" />
      {/* Front door — right */}
      <path d={`M ${sx(3.15)} ${sy(5.5)} A 70 70 0 0 0 ${sx(3.85)} ${sy(4.8)}`} fill="none" stroke="#071F5E" strokeWidth="1.5" />
      <line x1={sx(3.15)} y1={sy(5.5)} x2={sx(3.85)} y2={sy(5.45)} stroke="#071F5E" strokeWidth="3" />
      {/* Front window — left */}
      <rect x={sx(0.45)} y={sy(5.42)} width={1.6 * M} height={8} fill="#c5d4e8" stroke="#071F5E" strokeWidth="1.5" />
    </g>
  );
}
