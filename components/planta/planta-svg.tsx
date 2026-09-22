import {
  PLANTA_D,
  PLANTA_W,
  PLANTA_WALL_M,
  plantaDoors,
  plantaWindows,
} from '@/lib/planta-planos';

/** Metres → SVG. Origin at back-left of the 4.0 × 5.5 m room. */
export const M = 100;
export const OX = 96;
export const OY = 72;

export type EnvelopeLabels = {
  door: string;
  doorService: string;
  window: string;
  windowSide: string;
};

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

function Wall({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return <rect x={sx(x)} y={sy(y)} width={w * M} height={h * M} fill="#071F5E" />;
}

/** Masonry envelope with door and window openings cut out of the wall. */
export function RoomOutline() {
  const t = PLANTA_WALL_M;
  const p1 = plantaDoors.front;
  const p2 = plantaDoors.back;
  const v1 = plantaWindows.front;
  const v2 = plantaWindows.side;
  return (
    <g>
      <rect x={sx(0)} y={sy(0)} width={PLANTA_W * M} height={PLANTA_D * M} fill="#fffdf8" />
      <Wall x={-t} y={-t} w={p2.x0 + t} h={t} />
      <Wall x={p2.x1} y={-t} w={PLANTA_W + t - p2.x1} h={t} />
      <Wall x={-t} y={PLANTA_D} w={v1.x0 + t} h={t} />
      <Wall x={v1.x1} y={PLANTA_D} w={p1.x0 - v1.x1} h={t} />
      <Wall x={p1.x1} y={PLANTA_D} w={PLANTA_W + t - p1.x1} h={t} />
      <Wall x={-t} y={0} w={t} h={v2.y0} />
      <Wall x={-t} y={v2.y1} w={t} h={PLANTA_D - v2.y1} />
      <Wall x={PLANTA_W} y={0} w={t} h={PLANTA_D} />
    </g>
  );
}

function WindowInWall({
  x,
  y,
  w,
  h,
  mesh,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  mesh?: boolean;
}) {
  return (
    <g>
      <rect
        x={sx(x)}
        y={sy(y)}
        width={w * M}
        height={h * M}
        fill={mesh ? 'url(#planta-malla)' : '#c5d4e8'}
        stroke="#071F5E"
        strokeWidth="1.6"
      />
      {w >= h ? (
        <>
          <line x1={sx(x + w / 3)} y1={sy(y)} x2={sx(x + w / 3)} y2={sy(y + h)} stroke="#071F5E" strokeWidth="1" />
          <line x1={sx(x + (2 * w) / 3)} y1={sy(y)} x2={sx(x + (2 * w) / 3)} y2={sy(y + h)} stroke="#071F5E" strokeWidth="1" />
        </>
      ) : (
        <>
          <line x1={sx(x)} y1={sy(y + h / 3)} x2={sx(x + w)} y2={sy(y + h / 3)} stroke="#071F5E" strokeWidth="1" />
          <line x1={sx(x)} y1={sy(y + (2 * h) / 3)} x2={sx(x + w)} y2={sy(y + (2 * h) / 3)} stroke="#071F5E" strokeWidth="1" />
        </>
      )}
    </g>
  );
}

function DoorSwing({
  hingeX,
  hingeY,
  leafX,
  leafY,
  endX,
  endY,
  sweep,
}: {
  hingeX: number;
  hingeY: number;
  leafX: number;
  leafY: number;
  endX: number;
  endY: number;
  sweep: 0 | 1;
}) {
  const r = Math.hypot((leafX - hingeX) * M, (leafY - hingeY) * M);
  return (
    <g>
      <path
        d={`M ${sx(leafX)} ${sy(leafY)} A ${r} ${r} 0 0 ${sweep} ${sx(endX)} ${sy(endY)}`}
        fill="rgba(7,31,94,0.1)"
        stroke="#071F5E"
        strokeWidth="1.4"
        strokeDasharray="4 3"
      />
      <line x1={sx(hingeX)} y1={sy(hingeY)} x2={sx(endX)} y2={sy(endY)} stroke="#071F5E" strokeWidth="5" strokeLinecap="square" />
      <circle cx={sx(hingeX)} cy={sy(hingeY)} r="3.5" fill="#071F5E" />
    </g>
  );
}

export function DoorsAndWindow({
  door,
  doorService,
  window,
  windowSide,
}: EnvelopeLabels) {
  const t = PLANTA_WALL_M;
  const p1 = plantaDoors.front;
  const p2 = plantaDoors.back;
  const v1 = plantaWindows.front;
  const v2 = plantaWindows.side;
  const p1w = p1.x1 - p1.x0;
  const p2w = p2.x1 - p2.x0;
  return (
    <g>
      <defs>
        <pattern id="planta-malla" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 7 L7 0" stroke="#071F5E" strokeWidth="0.8" />
        </pattern>
      </defs>
      <WindowInWall x={v1.x0} y={PLANTA_D} w={v1.x1 - v1.x0} h={t} />
      <WindowInWall x={-t} y={v2.y0} w={t} h={v2.y1 - v2.y0} mesh />
      <DoorSwing
        hingeX={p1.x1}
        hingeY={PLANTA_D}
        leafX={p1.x0}
        leafY={PLANTA_D}
        endX={p1.x1}
        endY={PLANTA_D - p1w}
        sweep={1}
      />
      <DoorSwing
        hingeX={p2.x0}
        hingeY={0}
        leafX={p2.x1}
        leafY={0}
        endX={p2.x0}
        endY={p2w}
        sweep={1}
      />
      <text x={sx((p1.x0 + p1.x1) / 2)} y={sy(PLANTA_D + t) + 16} textAnchor="middle" fill="#071F5E" fontSize="10" fontWeight="700">
        {p1.id} {door}
      </text>
      <text x={sx((p2.x0 + p2.x1) / 2)} y={sy(-t) - 8} textAnchor="middle" fill="#071F5E" fontSize="10" fontWeight="700">
        {p2.id} {doorService}
      </text>
      <text x={sx((v1.x0 + v1.x1) / 2)} y={sy(PLANTA_D + t) + 16} textAnchor="middle" fill="#071F5E" fontSize="10" fontWeight="700">
        {v1.id} {window}
      </text>
      <text
        x={sx(0.2)}
        y={sy((v2.y0 + v2.y1) / 2)}
        textAnchor="middle"
        fill="#071F5E"
        fontSize="10"
        fontWeight="700"
        transform={`rotate(-90 ${sx(0.2)} ${sy((v2.y0 + v2.y1) / 2)})`}
      >
        {v2.id} {windowSide}
      </text>
    </g>
  );
}

export function PlantaEnvelope(labels: EnvelopeLabels) {
  return (
    <g>
      <RoomOutline />
      <DoorsAndWindow {...labels} />
    </g>
  );
}
