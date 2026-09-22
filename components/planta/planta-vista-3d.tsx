import {
  equipos3d,
  PLANTA_D,
  PLANTA_DOOR_H,
  PLANTA_W,
  PLANTA_WALL_H,
  PLANTA_WIN_HEAD,
  PLANTA_WIN_SILL,
  plantaDoors,
  plantaWindows,
  zonaColors,
  zonaRects,
  type Equipo3D,
  type ZonaId,
} from '@/lib/planta-planos';

const OX = 392;
const OY = 72;
const KX = 52;
const KY = 26;
const KZ = 46;

function iso(x: number, y: number, z = 0) {
  return { x: OX + (x - y) * KX, y: OY + (x + y) * KY - z * KZ };
}

function pts(list: { x: number; y: number }[]) {
  return list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function Quad({
  a,
  b,
  c,
  d,
  fill,
  opacity = 1,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  c: { x: number; y: number };
  d: { x: number; y: number };
  fill: string;
  opacity?: number;
}) {
  return <polygon points={pts([a, b, c, d])} fill={fill} stroke="#071F5E" strokeWidth="1" opacity={opacity} />;
}

function BackWallBand({
  x0,
  x1,
  z0,
  z1,
  fill,
}: {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  fill: string;
}) {
  return (
    <Quad
      a={iso(x0, 0, z0)}
      b={iso(x1, 0, z0)}
      c={iso(x1, 0, z1)}
      d={iso(x0, 0, z1)}
      fill={fill}
    />
  );
}

function LeftWallBand({
  y0,
  y1,
  z0,
  z1,
  fill,
}: {
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  fill: string;
}) {
  return (
    <Quad
      a={iso(0, y0, z0)}
      b={iso(0, y1, z0)}
      c={iso(0, y1, z1)}
      d={iso(0, y0, z1)}
      fill={fill}
    />
  );
}

function FrontWallBand({
  x0,
  x1,
  z0,
  z1,
  fill,
  opacity = 0.22,
}: {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <Quad
      a={iso(x0, PLANTA_D, z0)}
      b={iso(x1, PLANTA_D, z0)}
      c={iso(x1, PLANTA_D, z1)}
      d={iso(x0, PLANTA_D, z1)}
      fill={fill}
      opacity={opacity}
    />
  );
}

function FloorTile({
  x,
  y,
  w,
  h,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}) {
  const a = iso(x, y, 0);
  const b = iso(x + w, y, 0);
  const c = iso(x + w, y + h, 0);
  const d = iso(x, y + h, 0);
  return <polygon points={pts([a, b, c, d])} fill={fill} stroke="#071F5E" strokeWidth="0.8" />;
}

function Box3D({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top,
  south,
  east,
  stroke = '#071F5E',
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  top: string;
  south: string;
  east: string;
  stroke?: string;
}) {
  const A = iso(x, y, z + h);
  const B = iso(x + w, y, z + h);
  const C = iso(x + w, y + d, z + h);
  const D = iso(x, y + d, z + h);
  const F = iso(x + w, y, z);
  const G = iso(x + w, y + d, z);
  const H = iso(x, y + d, z);
  return (
    <g>
      <polygon points={pts([B, F, G, C])} fill={east} stroke={stroke} strokeWidth="1.1" />
      <polygon points={pts([D, C, G, H])} fill={south} stroke={stroke} strokeWidth="1.1" />
      <polygon points={pts([A, B, C, D])} fill={top} stroke={stroke} strokeWidth="1.1" />
    </g>
  );
}

function Equipo3DView({
  item,
  selected,
  onClick,
}: {
  item: Equipo3D;
  selected: boolean;
  onClick: () => void;
}) {
  const stroke = selected ? '#009179' : '#071F5E';
  const top =
    item.id === 'fogon'
      ? '#3a3a3a'
      : item.id === 'dehydrator'
        ? '#fff3b0'
        : item.id === 'pila' || item.id === 'pila-ext' || item.id === 'lavamanos'
          ? '#e8f0f4'
          : item.id === 'tanque'
            ? '#b7ddd4'
            : '#dfe6ee';
  const south = item.id === 'tablero' ? '#071F5E' : '#c5d0da';
  const east = item.id === 'tablero' ? '#0b2a7a' : '#aebac6';

  if (item.id === 'tanque') {
    const c0 = iso(item.x + item.w / 2, item.y + item.d / 2, 0);
    const c1 = iso(item.x + item.w / 2, item.y + item.d / 2, item.h);
    return (
      <g className="planta-zone-btn" onClick={onClick} role="button" tabIndex={0}>
        <ellipse cx={c0.x} cy={c0.y} rx="28" ry="14" fill="#8fbfb4" stroke={stroke} />
        <rect x={c1.x - 28} y={c1.y} width="56" height={c0.y - c1.y} fill="#b7ddd4" stroke={stroke} />
        <ellipse cx={c1.x} cy={c1.y} rx="28" ry="14" fill="#d7ebe4" stroke={stroke} />
      </g>
    );
  }

  return (
    <g className="planta-zone-btn" onClick={onClick} role="button" tabIndex={0}>
      <Box3D
        x={item.x}
        y={item.y}
        w={item.w}
        d={item.d}
        h={item.h}
        top={top}
        south={south}
        east={east}
        stroke={stroke}
      />
      {item.id === 'fogon'
        ? [0.28, 0.72].flatMap((tx) =>
            [0.3, 0.7].map((ty) => {
              const p = iso(item.x + item.w * tx, item.y + item.d * ty, item.h + 0.02);
              return <circle key={`${tx}-${ty}`} cx={p.x} cy={p.y} r="5" fill="none" stroke="#f2c94c" strokeWidth="1.6" />;
            }),
          )
        : null}
      {item.id === 'dehydrator'
        ? [0.25, 0.45, 0.65, 0.85].map((t) => {
            const a = iso(item.x, item.y + item.d, item.h * t);
            const b = iso(item.x + item.w, item.y + item.d, item.h * t);
            return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#071F5E" strokeWidth="1" />;
          })
        : null}
      {item.id === 'pila' || item.id === 'pila-ext'
        ? [0.3, 0.7].map((t) => {
            const p = iso(item.x + item.w * t, item.y + item.d * 0.5, item.h);
            return <ellipse key={t} cx={p.x} cy={p.y} rx="10" ry="6" fill="#c5d4e8" stroke="#071F5E" />;
          })
        : null}
      {item.id === 'molino'
        ? (() => {
            const peak = iso(item.x + item.w / 2, item.y + item.d / 2, item.h + 0.35);
            const l = iso(item.x + 0.08, item.y + 0.08, item.h);
            const r = iso(item.x + item.w - 0.08, item.y + item.d - 0.08, item.h);
            return <polygon points={`${peak.x},${peak.y} ${l.x},${l.y} ${r.x},${r.y}`} fill="#fff" stroke="#071F5E" />;
          })()
        : null}
    </g>
  );
}

export function PlantaVista3D({
  title,
  labels,
  selected,
  onSelect,
  openings,
}: {
  title: string;
  labels: Record<string, string>;
  selected: string;
  onSelect: (id: string) => void;
  openings?: { door: string; doorService: string; window: string; windowSide: string };
}) {
  const sorted = [...equipos3d].sort((a, b) => a.y + a.x - (b.y + b.x));
  const p1 = plantaDoors.front;
  const p2 = plantaDoors.back;
  const v1 = plantaWindows.front;
  const v2 = plantaWindows.side;
  const wall = '#f4f1ea';
  const wallSide = '#ebe6dc';
  const screenL = iso(0, 3.1, 0);
  const screenR = iso(4, 3.1, 0);
  const screenLT = iso(0, 3.1, 1.2);
  const screenRT = iso(4, 3.1, 1.2);
  const p2Label = iso((p2.x0 + p2.x1) / 2, 0.08, PLANTA_DOOR_H + 0.12);
  const p1Label = iso((p1.x0 + p1.x1) / 2, PLANTA_D - 0.08, PLANTA_DOOR_H + 0.12);
  const v1Label = iso((v1.x0 + v1.x1) / 2, PLANTA_D - 0.08, PLANTA_WIN_HEAD + 0.12);
  const v2Label = iso(0.08, (v2.y0 + v2.y1) / 2, PLANTA_WIN_HEAD + 0.12);

  return (
    <svg viewBox="0 0 760 640" role="img" aria-label={title}>
      <rect width="760" height="640" fill="#e8eef2" />
      <text x="24" y="28" fill="#071F5E" fontSize="13" fontWeight="700">
        {title} · 4,0 × 5,5 m
      </text>
      <polygon
        points={pts([iso(0, 0, 0), iso(PLANTA_W, 0, 0), iso(PLANTA_W, PLANTA_D, 0), iso(0, PLANTA_D, 0)])}
        fill="#d7d3c6"
        stroke="#071F5E"
      />
      {(Object.keys(zonaRects) as ZonaId[]).map((id) => {
        const r = zonaRects[id];
        return <FloorTile key={id} x={r.x} y={r.y} w={r.w} h={r.h} fill={`${zonaColors[id]}44`} />;
      })}
      <BackWallBand x0={0} x1={p2.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
      <BackWallBand x0={p2.x0} x1={p2.x1} z0={PLANTA_DOOR_H} z1={PLANTA_WALL_H} fill={wall} />
      <BackWallBand x0={p2.x1} x1={PLANTA_W} z0={0} z1={PLANTA_WALL_H} fill={wall} />
      <LeftWallBand y0={0} y1={v2.y0} z0={0} z1={PLANTA_WALL_H} fill={wallSide} />
      <LeftWallBand y0={v2.y0} y1={v2.y1} z0={0} z1={PLANTA_WIN_SILL} fill={wallSide} />
      <LeftWallBand y0={v2.y0} y1={v2.y1} z0={PLANTA_WIN_HEAD} z1={PLANTA_WALL_H} fill={wallSide} />
      <LeftWallBand y0={v2.y1} y1={PLANTA_D} z0={0} z1={PLANTA_WALL_H} fill={wallSide} />
      <Quad
        a={iso(0, v2.y0, PLANTA_WIN_SILL)}
        b={iso(0, v2.y1, PLANTA_WIN_SILL)}
        c={iso(0, v2.y1, PLANTA_WIN_HEAD)}
        d={iso(0, v2.y0, PLANTA_WIN_HEAD)}
        fill="#9ec5e8"
        opacity={0.72}
      />
      <FrontWallBand x0={0} x1={v1.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
      <FrontWallBand x0={v1.x0} x1={v1.x1} z0={0} z1={PLANTA_WIN_SILL} fill={wall} />
      <FrontWallBand x0={v1.x0} x1={v1.x1} z0={PLANTA_WIN_HEAD} z1={PLANTA_WALL_H} fill={wall} />
      <FrontWallBand x0={v1.x1} x1={p1.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
      <FrontWallBand x0={p1.x0} x1={p1.x1} z0={PLANTA_DOOR_H} z1={PLANTA_WALL_H} fill={wall} />
      <FrontWallBand x0={p1.x1} x1={PLANTA_W} z0={0} z1={PLANTA_WALL_H} fill={wall} />
      <Quad
        a={iso(v1.x0, PLANTA_D, PLANTA_WIN_SILL)}
        b={iso(v1.x1, PLANTA_D, PLANTA_WIN_SILL)}
        c={iso(v1.x1, PLANTA_D, PLANTA_WIN_HEAD)}
        d={iso(v1.x0, PLANTA_D, PLANTA_WIN_HEAD)}
        fill="#9ec5e8"
        opacity={0.55}
      />
      <Box3D
        x={p2.x0}
        y={0}
        w={0.06}
        d={p2.x1 - p2.x0}
        h={PLANTA_DOOR_H}
        top="#6b4f32"
        south="#8a6844"
        east="#5c422b"
      />
      <Box3D
        x={p1.x1 - 0.06}
        y={PLANTA_D - (p1.x1 - p1.x0)}
        w={0.06}
        d={p1.x1 - p1.x0}
        h={PLANTA_DOOR_H}
        top="#6b4f32"
        south="#8a6844"
        east="#5c422b"
      />
      <polygon
        points={pts([screenL, screenR, screenRT, screenLT])}
        fill="rgba(7,31,94,0.18)"
        stroke="#071F5E"
        strokeDasharray="6 4"
      />
      {sorted.map((item) => (
        <Equipo3DView key={item.id} item={item} selected={selected === item.id} onClick={() => onSelect(item.id)} />
      ))}
      {sorted
        .filter((item) => selected === item.id)
        .map((item) => {
          const p = iso(item.x + item.w / 2, item.y + item.d / 2, item.h + 0.18);
          return (
            <text key={`l-${item.id}`} x={p.x} y={p.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
              {labels[item.id]}
            </text>
          );
        })}
      <text x={p2Label.x} y={p2Label.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
        {p2.id} {openings?.doorService ?? ''}
      </text>
      <text x={p1Label.x} y={p1Label.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
        {p1.id} {openings?.door ?? ''}
      </text>
      <text x={v1Label.x} y={v1Label.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
        {v1.id} {openings?.window ?? ''}
      </text>
      <text x={v2Label.x} y={v2Label.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
        {v2.id} {openings?.windowSide ?? ''}
      </text>
    </svg>
  );
}
