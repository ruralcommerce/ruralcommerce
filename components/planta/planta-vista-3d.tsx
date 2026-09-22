'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  equipos3d,
  getPlanoLocale,
  PLANTA_D,
  PLANTA_DOOR_H,
  PLANTA_W,
  PLANTA_WALL_H,
  PLANTA_WIN_HEAD,
  PLANTA_WIN_SILL,
  plantaDoors,
  plantaWindows,
  vista3dCopy,
  zonaColors,
  zonaRects,
  type Equipo3D,
  type TransformTechnique,
  type ZonaId,
} from '@/lib/planta-planos';

const OX = 380;
const OY = 300;
const KX = 52;
const KY = 26;
const KZ = 46;
const CX = PLANTA_W / 2;
const CY = PLANTA_D / 2;
const DEFAULT_YAW = 0.28;
const TRANSFORM_IDS = new Set(['dehydrator', 'molino', 'fogon', 'extractor']);

type Point = { x: number; y: number };
type Project = (x: number, y: number, z?: number) => Point;

const ProjectCtx = createContext<Project>((x, y) => ({ x, y }));

function useProject() {
  return useContext(ProjectCtx);
}

function makeProject(yaw: number, zoom: number, panX: number, panY: number): Project {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return (x, y, z = 0) => {
    const dx = x - CX;
    const dy = y - CY;
    const xr = dx * cos - dy * sin;
    const yr = dx * sin + dy * cos;
    return {
      x: OX + panX + (xr - yr) * KX * zoom,
      y: OY + panY + (xr + yr) * KY * zoom - z * KZ * zoom,
    };
  };
}

function pts(list: Point[]) {
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
  a: Point;
  b: Point;
  c: Point;
  d: Point;
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
  opacity = 1,
}: {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  fill: string;
  opacity?: number;
}) {
  const project = useProject();
  return (
    <Quad
      a={project(x0, 0, z0)}
      b={project(x1, 0, z0)}
      c={project(x1, 0, z1)}
      d={project(x0, 0, z1)}
      fill={fill}
      opacity={opacity}
    />
  );
}

function LeftWallBand({
  y0,
  y1,
  z0,
  z1,
  fill,
  opacity = 1,
}: {
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  fill: string;
  opacity?: number;
}) {
  const project = useProject();
  return (
    <Quad
      a={project(0, y0, z0)}
      b={project(0, y1, z0)}
      c={project(0, y1, z1)}
      d={project(0, y0, z1)}
      fill={fill}
      opacity={opacity}
    />
  );
}

function FrontWallBand({
  x0,
  x1,
  z0,
  z1,
  fill,
  opacity = 0.2,
}: {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  fill: string;
  opacity?: number;
}) {
  const project = useProject();
  return (
    <Quad
      a={project(x0, PLANTA_D, z0)}
      b={project(x1, PLANTA_D, z0)}
      c={project(x1, PLANTA_D, z1)}
      d={project(x0, PLANTA_D, z1)}
      fill={fill}
      opacity={opacity}
    />
  );
}

function RightWallBand({
  y0,
  y1,
  z0,
  z1,
  fill,
  opacity = 0.18,
}: {
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  fill: string;
  opacity?: number;
}) {
  const project = useProject();
  return (
    <Quad
      a={project(PLANTA_W, y0, z0)}
      b={project(PLANTA_W, y1, z0)}
      c={project(PLANTA_W, y1, z1)}
      d={project(PLANTA_W, y0, z1)}
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
  const project = useProject();
  const a = project(x, y, 0);
  const b = project(x + w, y, 0);
  const c = project(x + w, y + h, 0);
  const d = project(x, y + h, 0);
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
  opacity = 1,
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
  opacity?: number;
}) {
  const project = useProject();
  const A = project(x, y, z + h);
  const B = project(x + w, y, z + h);
  const C = project(x + w, y + d, z + h);
  const D = project(x, y + d, z + h);
  const F = project(x + w, y, z);
  const G = project(x + w, y + d, z);
  const H = project(x, y + d, z);
  return (
    <g opacity={opacity}>
      <polygon points={pts([B, F, G, C])} fill={east} stroke={stroke} strokeWidth="1.1" />
      <polygon points={pts([D, C, G, H])} fill={south} stroke={stroke} strokeWidth="1.1" />
      <polygon points={pts([A, B, C, D])} fill={top} stroke={stroke} strokeWidth="1.1" />
    </g>
  );
}

function EquipHitSurface({
  item,
  onSelect,
}: {
  item: Equipo3D;
  onSelect: () => void;
}) {
  const project = useProject();
  const a = project(item.x, item.y, 0);
  const b = project(item.x + item.w, item.y, 0);
  const c = project(item.x + item.w, item.y + item.d, 0);
  const d = project(item.x, item.y + item.d, 0);
  const topA = project(item.x, item.y, item.h);
  const topB = project(item.x + item.w, item.y, item.h);
  const topC = project(item.x + item.w, item.y + item.d, item.h);
  const topD = project(item.x, item.y + item.d, item.h);
  return (
    <g
      className="planta-equip-hit"
      role="button"
      tabIndex={0}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <polygon points={pts([a, b, c, d])} fill="transparent" stroke="none" />
      <polygon points={pts([topA, topB, topC, topD])} fill="transparent" stroke="none" />
      <polygon points={pts([b, topB, topC, c])} fill="transparent" stroke="none" />
      <polygon points={pts([d, topD, topC, c])} fill="transparent" stroke="none" />
    </g>
  );
}

function Equipo3DView({
  item,
  selected,
  onClick,
  dimmed = false,
}: {
  item: Equipo3D;
  selected: boolean;
  onClick: () => void;
  dimmed?: boolean;
}) {
  const project = useProject();
  const stroke = selected ? '#009179' : '#071F5E';
  const opacity = dimmed && !selected ? 0.28 : 1;
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
    const c0 = project(item.x + item.w / 2, item.y + item.d / 2, 0);
    const c1 = project(item.x + item.w / 2, item.y + item.d / 2, item.h);
    const rim = project(item.x + item.w, item.y + item.d / 2, item.h);
    const rx = Math.max(10, Math.hypot(rim.x - c1.x, rim.y - c1.y));
    const ry = Math.max(6, rx * 0.48);
    return (
      <g className="planta-zone-btn" opacity={opacity}>
        <ellipse cx={c0.x} cy={c0.y} rx={rx} ry={ry} fill="#8fbfb4" stroke={stroke} />
        <rect x={c1.x - rx} y={c1.y} width={rx * 2} height={Math.max(8, c0.y - c1.y)} fill="#b7ddd4" stroke={stroke} />
        <ellipse cx={c1.x} cy={c1.y} rx={rx} ry={ry} fill="#d7ebe4" stroke={stroke} />
        <EquipHitSurface item={item} onSelect={onClick} />
      </g>
    );
  }

  return (
    <g className="planta-zone-btn" opacity={opacity}>
      <Box3D x={item.x} y={item.y} w={item.w} d={item.d} h={item.h} top={top} south={south} east={east} stroke={stroke} />
      {item.id === 'fogon'
        ? [0.28, 0.72].flatMap((tx) =>
            [0.3, 0.7].map((ty) => {
              const p = project(item.x + item.w * tx, item.y + item.d * ty, item.h + 0.02);
              return <circle key={`${tx}-${ty}`} cx={p.x} cy={p.y} r="5" fill="none" stroke="#f2c94c" strokeWidth="1.6" />;
            }),
          )
        : null}
      {item.id === 'dehydrator'
        ? [0.25, 0.45, 0.65, 0.85].map((t) => {
            const a = project(item.x, item.y + item.d, item.h * t);
            const b = project(item.x + item.w, item.y + item.d, item.h * t);
            return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#071F5E" strokeWidth="1" />;
          })
        : null}
      {item.id === 'pila' || item.id === 'pila-ext'
        ? [0.3, 0.7].map((t) => {
            const p = project(item.x + item.w * t, item.y + item.d * 0.5, item.h);
            return <ellipse key={t} cx={p.x} cy={p.y} rx="10" ry="6" fill="#c5d4e8" stroke="#071F5E" />;
          })
        : null}
      {item.id === 'molino'
        ? (() => {
            const peak = project(item.x + item.w / 2, item.y + item.d / 2, item.h + 0.35);
            const l = project(item.x + 0.08, item.y + 0.08, item.h);
            const r = project(item.x + item.w - 0.08, item.y + item.d - 0.08, item.h);
            return <polygon points={`${peak.x},${peak.y} ${l.x},${l.y} ${r.x},${r.y}`} fill="#fff" stroke="#071F5E" />;
          })()
        : null}
      <EquipHitSurface item={item} onSelect={onClick} />
    </g>
  );
}

function isDimmed(item: Equipo3D, technique: TransformTechnique) {
  if (technique === 'all') return false;
  if (!TRANSFORM_IDS.has(item.id)) return false;
  if (item.id === 'extractor') return technique !== 'fogon';
  return item.id !== technique;
}

export function PlantaVista3D({
  title,
  labels,
  selected,
  onSelect,
  openings,
  locale,
}: {
  title: string;
  labels: Record<string, string>;
  selected: string;
  onSelect: (id: string) => void;
  openings?: { door: string; doorService: string; window: string; windowSide: string };
  locale: string;
}) {
  const copy = vista3dCopy[getPlanoLocale(locale)];
  const [yaw, setYaw] = useState(DEFAULT_YAW);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [technique, setTechnique] = useState<TransformTechnique>('all');
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    yaw: number;
    panX: number;
    panY: number;
    pan: boolean;
  } | null>(null);

  const project = useMemo(() => makeProject(yaw, zoom, panX, panY), [yaw, zoom, panX, panY]);
  const sorted = [...equipos3d].sort((a, b) => a.y + a.x - (b.y + b.x));

  const reset = useCallback(() => {
    setYaw(DEFAULT_YAW);
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const target = event.target as Element | null;
    if (target?.closest?.('.planta-equip-hit')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      yaw,
      panX,
      panY,
      pan: event.shiftKey || event.button === 1 || event.button === 2,
    };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (start.pan) {
      setPanX(start.panX + dx);
      setPanY(start.panY + dy);
      return;
    }
    setYaw(start.yaw + dx * 0.008);
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    drag.current = null;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onNativeWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      setZoom((current) => Math.min(1.85, Math.max(0.62, current * (event.deltaY > 0 ? 0.92 : 1.08))));
    };
    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', onNativeWheel);
  }, []);

  const p1 = plantaDoors.front;
  const p2 = plantaDoors.back;
  const v1 = plantaWindows.front;
  const v2 = plantaWindows.side;
  const wall = '#f4f1ea';
  const wallSide = '#ebe6dc';
  const aisle = project(2.85, 3.2, 0.02);
  const p2Label = project((p2.x0 + p2.x1) / 2, 0.08, PLANTA_DOOR_H + 0.12);
  const p1Label = project((p1.x0 + p1.x1) / 2, PLANTA_D - 0.08, PLANTA_DOOR_H + 0.12);
  const v1Label = project((v1.x0 + v1.x1) / 2, PLANTA_D - 0.08, PLANTA_WIN_HEAD + 0.12);
  const v2Label = project(0.08, (v2.y0 + v2.y1) / 2, PLANTA_WIN_HEAD + 0.12);

  return (
    <div className="planta-3d">
      <div className="planta-3d-toolbar">
        <div className="planta-zone-chips">
          {(
            [
              ['all', copy.all],
              ['dehydrator', copy.dry],
              ['molino', copy.mill],
              ['fogon', copy.cook],
            ] as Array<[TransformTechnique, string]>
          ).map(([id, label]) => (
            <button key={id} type="button" className={technique === id ? 'is-active' : undefined} onClick={() => setTechnique(id)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="planta-3d-reset" onClick={reset}>
          {copy.reset}
        </button>
        <span className="planta-3d-hint">{copy.hint}</span>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 760 640"
        role="img"
        aria-label={title}
        className={dragging ? 'is-dragging' : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(event) => event.preventDefault()}
      >
        <ProjectCtx.Provider value={project}>
          <rect width="760" height="640" fill="#e8eef2" />
          <polygon
            points={pts([project(0, 0, 0), project(PLANTA_W, 0, 0), project(PLANTA_W, PLANTA_D, 0), project(0, PLANTA_D, 0)])}
            fill="#d7d3c6"
            stroke="#071F5E"
          />
          {(Object.keys(zonaRects) as ZonaId[]).map((id) => {
            const r = zonaRects[id];
            return <FloorTile key={id} x={r.x} y={r.y} w={r.w} h={r.h} fill={`${zonaColors[id]}44`} />;
          })}
          <FloorTile x={2.4} y={1.15} w={1.45} h={3.4} fill="rgba(255,255,255,0.35)" />
          <text x={aisle.x} y={aisle.y} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
            {copy.aisle}
          </text>
          <BackWallBand x0={0} x1={p2.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <BackWallBand x0={p2.x0} x1={p2.x1} z0={PLANTA_DOOR_H} z1={PLANTA_WALL_H} fill={wall} />
          <BackWallBand x0={p2.x1} x1={PLANTA_W} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <LeftWallBand y0={0} y1={v2.y0} z0={0} z1={PLANTA_WALL_H} fill={wallSide} />
          <LeftWallBand y0={v2.y0} y1={v2.y1} z0={0} z1={PLANTA_WIN_SILL} fill={wallSide} />
          <LeftWallBand y0={v2.y0} y1={v2.y1} z0={PLANTA_WIN_HEAD} z1={PLANTA_WALL_H} fill={wallSide} />
          <LeftWallBand y0={v2.y1} y1={PLANTA_D} z0={0} z1={PLANTA_WALL_H} fill={wallSide} />
          <Quad
            a={project(0, v2.y0, PLANTA_WIN_SILL)}
            b={project(0, v2.y1, PLANTA_WIN_SILL)}
            c={project(0, v2.y1, PLANTA_WIN_HEAD)}
            d={project(0, v2.y0, PLANTA_WIN_HEAD)}
            fill="#9ec5e8"
            opacity={0.72}
          />
          <RightWallBand y0={0} y1={PLANTA_D} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <FrontWallBand x0={0} x1={v1.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <FrontWallBand x0={v1.x0} x1={v1.x1} z0={0} z1={PLANTA_WIN_SILL} fill={wall} />
          <FrontWallBand x0={v1.x0} x1={v1.x1} z0={PLANTA_WIN_HEAD} z1={PLANTA_WALL_H} fill={wall} />
          <FrontWallBand x0={v1.x1} x1={p1.x0} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <FrontWallBand x0={p1.x0} x1={p1.x1} z0={PLANTA_DOOR_H} z1={PLANTA_WALL_H} fill={wall} />
          <FrontWallBand x0={p1.x1} x1={PLANTA_W} z0={0} z1={PLANTA_WALL_H} fill={wall} />
          <Quad
            a={project(v1.x0, PLANTA_D, PLANTA_WIN_SILL)}
            b={project(v1.x1, PLANTA_D, PLANTA_WIN_SILL)}
            c={project(v1.x1, PLANTA_D, PLANTA_WIN_HEAD)}
            d={project(v1.x0, PLANTA_D, PLANTA_WIN_HEAD)}
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
            points={pts([
              project(0, 3.1, 0),
              project(4, 3.1, 0),
              project(4, 3.1, 1.2),
              project(0, 3.1, 1.2),
            ])}
            fill="rgba(7,31,94,0.18)"
            stroke="#071F5E"
            strokeDasharray="6 4"
          />
          {sorted.map((item) => (
            <Equipo3DView
              key={item.id}
              item={item}
              selected={selected === item.id}
              dimmed={isDimmed(item, technique)}
              onClick={() => onSelect(item.id)}
            />
          ))}
          {sorted
            .filter((item) => selected === item.id)
            .map((item) => {
              const p = project(item.x + item.w / 2, item.y + item.d / 2, item.h + 0.18);
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
        </ProjectCtx.Provider>
      </svg>
    </div>
  );
}
