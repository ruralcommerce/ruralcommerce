'use client';

import { useState } from 'react';
import { EquipoSymbol } from '@/components/planta/planta-equipos-svg';
import { DimH, DimV, DoorsAndWindow, M, RoomOutline, sx, sy } from '@/components/planta/planta-svg';
import { PlantaVista3D } from '@/components/planta/planta-vista-3d';
import {
  circuitos,
  desagues,
  equipos3d,
  equipoFicha,
  equipoShort,
  getPlanoLocale,
  luces,
  nemaGloss,
  PLANTA_D,
  PLANTA_W,
  PLANTA_WALL_M,
  plantaDoors,
  plantaWindows,
  planoChrome,
  planoTabs,
  procesoSteps,
  separacionesList,
  tomaAltura,
  tomas,
  tomaUso,
  zonaArea,
  zonaColors,
  zonaCopyFull,
  zonaOrder,
  zonaRects,
  zonaShort,
  type PlanoTab,
  type ZonaId,
} from '@/lib/planta-planos';
import {
  aguaCopy,
  coopReview,
  loadLabels,
  materialesCopy,
  payLabels,
  solarCopy,
  solarLoads,
  solarSpec,
} from '@/lib/planta-servicios';

const TABS: PlanoTab[] = [
  'original',
  'distribucion',
  'procesos',
  'iso',
  'iso3d',
  'materiales',
  'tecnica',
  'agua',
  'energia',
];

function fillOf(id: ZonaId, active: boolean) {
  return `${zonaColors[id]}${active ? '55' : '28'}`;
}

function ZoneRect({
  id,
  active,
  onSelect,
  label,
  sub,
}: {
  id: ZonaId;
  active: boolean;
  onSelect: (id: ZonaId) => void;
  label: string;
  sub: string;
}) {
  const r = zonaRects[id];
  const cx = sx(r.x + r.w / 2);
  const cy = sy(r.y + r.h / 2);
  return (
    <g className="planta-zone-btn" onClick={() => onSelect(id)} role="button" tabIndex={0}>
      <rect
        x={sx(r.x)}
        y={sy(r.y)}
        width={r.w * M}
        height={r.h * M}
        fill={fillOf(id, active)}
        stroke={active ? zonaColors[id] : '#071F5E'}
        strokeWidth={active ? 3 : 1}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#071F5E" fontSize="12" fontWeight="700">
        {label}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#071F5E" fontSize="10">
        {sub}
      </text>
    </g>
  );
}

function RoomLabels({ back, front, acopio }: { back: string; front: string; acopio: string }) {
  return (
    <g fill="#071F5E" fontSize="11" fontWeight="700">
      <text x={sx(2)} y={22} textAnchor="middle">
        {back} · {acopio}
      </text>
      <text x={sx(2)} y={sy(6.48)} textAnchor="middle">
        {front}
      </text>
    </g>
  );
}

function TabIntro({ lead }: { lead?: string }) {
  if (!lead?.trim()) return null;
  return <p className="planta-tab-lead">{lead}</p>;
}

function EquipAside({
  selectId,
  eq,
  setEq,
  ficha,
  equipos,
  equipSelectLabel,
  sizeLabel,
  showSize,
}: {
  selectId: string;
  eq: string;
  setEq: (id: string) => void;
  ficha: Record<string, { name: string; spec: string }>;
  equipos: typeof equipos3d;
  equipSelectLabel: string;
  sizeLabel: string;
  showSize?: boolean;
}) {
  const active = ficha[eq];
  const item = equipos.find((e) => e.id === eq);
  return (
    <aside className="planta-plan-aside planta-card planta-plan-card">
      <label className="planta-equip-label" htmlFor={selectId}>
        {equipSelectLabel}
      </label>
      <select id={selectId} className="planta-equip-select" value={eq} onChange={(event) => setEq(event.target.value)}>
        {equipos.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {ficha[entry.id]?.name ?? entry.id}
          </option>
        ))}
      </select>
      {active ? (
        <>
          <h3 className="planta-aside-equip-name">{active.name}</h3>
          <p className="planta-aside-equip-spec">{active.spec}</p>
          {showSize && item ? (
            <p className="planta-aside-equip-size">
              <strong>{sizeLabel}.</strong> {item.w.toFixed(2)} × {item.d.toFixed(2)} m
            </p>
          ) : null}
        </>
      ) : null}
    </aside>
  );
}

function SketchEnvelope({
  x,
  y,
  w,
  h,
  door,
  doorService,
  window: windowLabel,
  windowSide,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  door: string;
  doorService: string;
  window: string;
  windowSide: string;
}) {
  const mx = (m: number) => x + (m / PLANTA_W) * w;
  const my = (m: number) => y + (m / PLANTA_D) * h;
  const tw = (PLANTA_WALL_M / PLANTA_W) * w;
  const th = (PLANTA_WALL_M / PLANTA_D) * h;
  const p1 = plantaDoors.front;
  const p2 = plantaDoors.back;
  const v1 = plantaWindows.front;
  const v2 = plantaWindows.side;
  const p1w = mx(p1.x1) - mx(p1.x0);
  const p2w = mx(p2.x1) - mx(p2.x0);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" />
      <rect x={x - tw} y={y - th} width={mx(p2.x0) - (x - tw)} height={th} fill="#111" />
      <rect x={mx(p2.x1)} y={y - th} width={x + w + tw - mx(p2.x1)} height={th} fill="#111" />
      <rect x={x - tw} y={y + h} width={mx(v1.x0) - (x - tw)} height={th} fill="#111" />
      <rect x={mx(v1.x1)} y={y + h} width={mx(p1.x0) - mx(v1.x1)} height={th} fill="#111" />
      <rect x={mx(p1.x1)} y={y + h} width={x + w + tw - mx(p1.x1)} height={th} fill="#111" />
      <rect x={x - tw} y={y} width={tw} height={my(v2.y0) - y} fill="#111" />
      <rect x={x - tw} y={my(v2.y1)} width={tw} height={y + h - my(v2.y1)} fill="#111" />
      <rect x={x + w} y={y} width={tw} height={h} fill="#111" />
      <rect x={mx(v1.x0)} y={y + h} width={mx(v1.x1) - mx(v1.x0)} height={th} fill="#c5d4e8" stroke="#111" />
      <line
        x1={mx(v1.x0 + (v1.x1 - v1.x0) / 3)}
        y1={y + h}
        x2={mx(v1.x0 + (v1.x1 - v1.x0) / 3)}
        y2={y + h + th}
        stroke="#111"
      />
      <line
        x1={mx(v1.x0 + (2 * (v1.x1 - v1.x0)) / 3)}
        y1={y + h}
        x2={mx(v1.x0 + (2 * (v1.x1 - v1.x0)) / 3)}
        y2={y + h + th}
        stroke="#111"
      />
      <rect x={x - tw} y={my(v2.y0)} width={tw} height={my(v2.y1) - my(v2.y0)} fill="#c5d4e8" stroke="#111" />
      <line x1={x - tw} y1={my(v2.y0 + (v2.y1 - v2.y0) / 3)} x2={x} y2={my(v2.y0 + (v2.y1 - v2.y0) / 3)} stroke="#111" />
      <line
        x1={x - tw}
        y1={my(v2.y0 + (2 * (v2.y1 - v2.y0)) / 3)}
        x2={x}
        y2={my(v2.y0 + (2 * (v2.y1 - v2.y0)) / 3)}
        stroke="#111"
      />
      <path
        d={`M ${mx(p1.x0)} ${y + h} A ${p1w} ${p1w} 0 0 1 ${mx(p1.x1)} ${y + h - p1w}`}
        fill="rgba(0,0,0,0.06)"
        stroke="#111"
        strokeDasharray="4 3"
      />
      <line x1={mx(p1.x1)} y1={y + h} x2={mx(p1.x1)} y2={y + h - p1w} stroke="#111" strokeWidth="3" />
      <path
        d={`M ${mx(p2.x1)} ${y} A ${p2w} ${p2w} 0 0 1 ${mx(p2.x0)} ${y + p2w}`}
        fill="rgba(0,0,0,0.06)"
        stroke="#111"
        strokeDasharray="4 3"
      />
      <line x1={mx(p2.x0)} y1={y} x2={mx(p2.x0)} y2={y + p2w} stroke="#111" strokeWidth="3" />
      <text x={mx((p1.x0 + p1.x1) / 2)} y={y + h + th + 16} textAnchor="middle" fill="#111" fontSize="11" fontWeight="700">
        {p1.id} {door}
      </text>
      <text x={mx((v1.x0 + v1.x1) / 2)} y={y + h + th + 16} textAnchor="middle" fill="#111" fontSize="11" fontWeight="700">
        {v1.id} {windowLabel}
      </text>
      <text x={mx((p2.x0 + p2.x1) / 2)} y={y - th - 8} textAnchor="middle" fill="#111" fontSize="11" fontWeight="700">
        {p2.id} {doorService}
      </text>
      <text
        x={x - tw - 8}
        y={(my(v2.y0) + my(v2.y1)) / 2}
        textAnchor="middle"
        fill="#111"
        fontSize="11"
        fontWeight="700"
        transform={`rotate(-90 ${x - tw - 8} ${(my(v2.y0) + my(v2.y1)) / 2})`}
      >
        {v2.id} {windowSide}
      </text>
    </g>
  );
}

function SheetHead({ code, title }: { code: string; title: string }) {
  return (
    <g>
      <rect x="430" y="8" width="314" height="44" rx="8" fill="#071F5E" />
      <text x="444" y="26" fill="#F2F2F2" fontSize="12" fontWeight="700">
        {code} · {title}
      </text>
      <text x="444" y="42" fill="#F2F2F2" fontSize="9">
        Copey de Dota · 4,0 × 5,5 m · 1:50
      </text>
    </g>
  );
}

function OriginalSketch({
  back,
  front,
  window,
  door,
  doorService,
  windowSide,
}: {
  back: string;
  front: string;
  window: string;
  door: string;
  doorService: string;
  windowSide: string;
}) {
  const x = 128;
  const y = 72;
  const w = 250;
  const h = 344;
  return (
    <svg viewBox="0 0 480 560" role="img" aria-label={`${back} 4,0 × 5,5 m`}>
      <rect width="480" height="560" fill="#fffdf8" />
      <text x="245" y="28" textAnchor="middle" fill="#111" fontSize="15" fontWeight="700">
        {back}
      </text>
      <line x1="78" y1={y} x2="78" y2={y + h} stroke="#111" />
      <polyline points={`70,${y} 86,${y}`} fill="none" stroke="#111" />
      <polyline points={`70,${y + h} 86,${y + h}`} fill="none" stroke="#111" />
      <text
        x="48"
        y={y + h / 2}
        textAnchor="middle"
        fill="#111"
        fontSize="14"
        fontWeight="700"
        transform={`rotate(-90 48 ${y + h / 2})`}
      >
        5.5 m
      </text>
      <SketchEnvelope
        x={x}
        y={y}
        w={w}
        h={h}
        door={door}
        doorService={doorService}
        window={window}
        windowSide={windowSide}
      />
      <rect x={x + 78} y={y + 10} width="40" height="30" rx="3" fill="none" stroke="#111" strokeWidth="2" />
      <circle cx={x + 98} cy={y + 24} r="6" fill="none" stroke="#111" strokeWidth="2" />
      <g transform={`translate(${x + w / 2} ${y + 112})`} stroke="#111" fill="none" strokeWidth="2">
        <circle r="12" />
        <line x1="-18" y1="0" x2="18" y2="0" />
        <line x1="0" y1="-18" x2="0" y2="18" />
      </g>
      <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle" fill="#111" fontSize="22" fontWeight="700">
        22 m²
      </text>
      <g transform={`translate(${x + w / 2} ${y + 236})`} stroke="#111" fill="none" strokeWidth="2">
        <circle r="12" />
        <line x1="-18" y1="0" x2="18" y2="0" />
        <line x1="0" y1="-18" x2="0" y2="18" />
      </g>
      <text x={x + w / 2} y={y + h + 52} textAnchor="middle" fill="#111" fontSize="14" fontWeight="700">
        4.0 m
      </text>
      <text x={x + w / 2} y={y + h + 78} textAnchor="middle" fill="#111" fontSize="15" fontWeight="700">
        {front}
      </text>
    </svg>
  );
}

function CoopProposal({
  back,
  front,
  door,
  doorService,
  window,
  windowSide,
}: {
  back: string;
  front: string;
  door: string;
  doorService: string;
  window: string;
  windowSide: string;
}) {
  const x = 118;
  const y = 64;
  const w = 250;
  const h = 344;
  return (
    <svg viewBox="0 0 480 560" role="img" aria-label="Propuesta cooperativa">
      <rect width="480" height="560" fill="#fff" />
      <text x="245" y="28" textAnchor="middle" fill="#111" fontSize="14" fontWeight="700">
        {back}
      </text>
      <SketchEnvelope
        x={x}
        y={y}
        w={w}
        h={h}
        door={door}
        doorService={doorService}
        window={window}
        windowSide={windowSide}
      />
      <rect x={x + 88} y={y - 36} width="36" height="22" fill="none" stroke="#111" />
      <text x={x + 106} y={y - 42} textAnchor="middle" fill="#111" fontSize="9">
        Pila exterior
      </text>
      <rect x={x + 88} y={y + 8} width="40" height="28" fill="none" stroke="#111" />
      <line x1={x} y1={y + 88} x2={x + w} y2={y + 88} stroke="#111" strokeDasharray="6 5" />
      <line x1={x} y1={y + 160} x2={x + w} y2={y + 160} stroke="#111" strokeDasharray="6 5" />
      <line x1={x} y1={y + 250} x2={x + w} y2={y + 250} stroke="#111" strokeDasharray="6 5" />
      <text x={x + w / 2} y={y + 58} textAnchor="middle" fill="#111" fontSize="12" fontWeight="700">
        Estación sucia
      </text>
      <text x={x + w / 2} y={y + 128} textAnchor="middle" fill="#111" fontSize="12" fontWeight="700">
        Producto húmedo
      </text>
      <rect x={x + 18} y={y + 175} width="70" height="58" fill="none" stroke="#c45c26" strokeWidth="2" />
      <text x={x + 53} y={y + 208} textAnchor="middle" fill="#c45c26" fontSize="9" fontWeight="700">
        Cocina 4Q
      </text>
      <text x={x + w / 2} y={y + 208} textAnchor="middle" fill="#111" fontSize="12" fontWeight="700">
        Seco
      </text>
      <rect x={x + 160} y={y + 175} width="70" height="58" fill="none" stroke="#111" />
      <text x={x + 20} y={y + 300} fill="#009179" fontSize="9" fontWeight="700">
        Gabachas
      </text>
      <rect x={x + 160} y={y + 270} width="36" height="28" fill="none" stroke="#009179" />
      <text x={x + 178} y={y + 318} textAnchor="middle" fill="#009179" fontSize="8">
        Lavamanos
      </text>
      <text x={x + w / 2} y={y + 338} textAnchor="middle" fill="#111" fontSize="12" fontWeight="700">
        Ingreso
      </text>
      <text x={x + w / 2} y={y + h + 52} textAnchor="middle" fill="#111" fontSize="13" fontWeight="700">
        4.0 m · {front}
      </text>
    </svg>
  );
}

function Receptacle({
  x,
  y,
  id,
  volts,
  gfci,
  nema,
}: {
  x: number;
  y: number;
  id: string;
  volts: 120 | 240;
  gfci: boolean;
  nema: string;
}) {
  const cx = sx(x);
  const cy = sy(y);
  const dark = volts === 240;
  return (
    <g>
      <rect
        x={cx - 16}
        y={cy - 12}
        width="32"
        height="24"
        rx="4"
        fill={dark ? '#071F5E' : '#fff'}
        stroke="#071F5E"
        strokeWidth="1.6"
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={dark ? '#fff' : '#071F5E'} fontSize="9" fontWeight="700">
        {id}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#071F5E" fontSize="8" fontWeight="700">
        {volts}V {nema}
        {gfci ? ' GFCI' : ''}
      </text>
    </g>
  );
}

function FloorShell({ title, code }: { title: string; code: string }) {
  return (
    <>
      <rect width="760" height="760" fill="#eef3f0" />
      <SheetHead code={code} title={title} />
      <RoomOutline />
    </>
  );
}

export function PlantaPlanos({ locale }: { locale: string }) {
  const loc = getPlanoLocale(locale);
  const chrome = planoChrome[loc];
  const aberturas = {
    door: chrome.door,
    doorService: chrome.doorService,
    window: chrome.window,
    windowSide: chrome.windowSide,
  };
  const tabs = planoTabs[loc];
  const zones = zonaCopyFull[loc];
  const steps = procesoSteps[loc];
  const seps = separacionesList[loc];
  const ficha = equipoFicha[loc];
  const shortEq = equipoShort[loc];
  const uso = tomaUso[loc];
  const gloss = nemaGloss[loc];
  const short = zonaShort[loc];
  const agua = aguaCopy[loc];
  const solar = solarCopy[loc];
  const loads = loadLabels[loc];
  const pay = payLabels[loc];
  const coop = coopReview[loc];
  const mat = materialesCopy[loc];

  const [tab, setTab] = useState<PlanoTab>('distribucion');
  const [zona, setZona] = useState<ZonaId>('preparacion');
  const [eq, setEq] = useState('dehydrator');
  const activeZone = zones[zona];
  return (
    <div className="planta-planos">
      <div className="planta-plan-tabs" role="tablist" aria-label={chrome.title}>
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-active' : undefined}
            onClick={() => setTab(id)}
          >
            {tabs[id]}
          </button>
        ))}
      </div>

      {tab === 'original' ? (
        <section>
          <h2 className="planta-plan-h2">{chrome.originalTitle}</h2>
          {chrome.originalLead ? <p className="planta-plan-note">{chrome.originalLead}</p> : null}
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <OriginalSketch
                back={chrome.back}
                front={chrome.front}
                window={chrome.window}
                door={chrome.door}
                doorService={chrome.doorService}
                windowSide={chrome.windowSide}
              />
            </div>
            <div className="planta-croquis planta-plan-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/croquis-cooperativa.jpg" alt={chrome.origCaption} />
            </div>
          </div>
          <ul className="planta-plan-list">
            {chrome.originalHow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="planta-plan-h3">{coop.title}</h3>
          <p className="planta-plan-note">{coop.lead}</p>
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <CoopProposal
                back={chrome.back}
                front={chrome.front}
                door={chrome.door}
                doorService={chrome.doorService}
                window={chrome.window}
                windowSide={chrome.windowSide}
              />
            </div>
            <div>
              <p className="planta-kicker">{coop.keepTitle}</p>
              <ul className="planta-plan-list">
                {coop.keep.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="planta-kicker" style={{ marginTop: '1rem' }}>
                {coop.dropTitle}
              </p>
              <ul className="planta-plan-list">
                {coop.drop.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'distribucion' ? (
        <section>
          <TabIntro lead={chrome.distLead} />
          <div className="planta-zone-chips">
            {zonaOrder.map((id) => (
              <button key={id} type="button" className={zona === id ? 'is-active' : undefined} onClick={() => setZona(id)}>
                {zones[id].name}
              </button>
            ))}
          </div>
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={chrome.distTitle}>
                <FloorShell code="A-01" title={chrome.distTitle} />
                {zonaOrder.map((id) => (
                  <ZoneRect
                    key={id}
                    id={id}
                    active={zona === id}
                    onSelect={setZona}
                    label={short[id]}
                    sub={`${zonaRects[id].w.toFixed(2)} × ${zonaRects[id].h.toFixed(2)} m · ${zonaArea(id).toFixed(2)} m²`}
                  />
                ))}
                <line x1={sx(0)} y1={sy(3.6)} x2={sx(4)} y2={sy(3.6)} stroke="#c9a227" strokeWidth="3" strokeDasharray="8 6" />
                <text x={sx(2)} y={sy(3.52)} textAnchor="middle" fill="#8a6d12" fontSize="10" fontWeight="700">
                  {chrome.screen} · {chrome.floorUp}
                </text>
                <DoorsAndWindow {...aberturas} />
                <rect x={sx(0.9)} y={sy(-0.55)} width={0.7 * M} height={0.4 * M} fill="#eef6f8" stroke="#071F5E" />
                <text x={sx(1.25)} y={sy(-0.18)} textAnchor="middle" fill="#071F5E" fontSize="9">
                  Pila ext.
                </text>
                <circle cx={sx(4.7)} cy={sy(4.05)} r="44" fill="#d7ebe4" stroke="#009179" />
                <text x={sx(4.7)} y={sy(4.08)} textAnchor="middle" fill="#071F5E" fontSize="9" fontWeight="700">
                  1 000 L
                </text>
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimV x={-0.42} y1={0} y2={1.2} label="1,20 m" />
                <DimV x={-0.42} y1={1.2} y2={2.25} label="1,05 m" />
                <DimV x={-0.42} y1={2.25} y2={3.6} label="1,35 m" />
                <DimV x={-0.42} y1={3.6} y2={4.55} label="0,95 m" />
                <DimV x={-0.42} y1={4.55} y2={5.5} label="0,95 m" />
                <DimV x={-0.88} y1={0} y2={5.5} label="5,50 m" />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
              </svg>
            </div>
            <aside className="planta-card planta-plan-card">
              {chrome.distHint ? <p className="planta-kicker">{chrome.distHint}</p> : null}
              <h3>{activeZone.name}</h3>
              <p>{activeZone.role}</p>
              <p>
                <strong>{chrome.where}.</strong> {activeZone.where}
              </p>
              <p>
                <strong>{chrome.yes}.</strong> {activeZone.do}
              </p>
              <p>
                <strong>{chrome.no}.</strong> {activeZone.dont}
              </p>
              <p>
                <strong>{chrome.sep}.</strong> {activeZone.sep}
              </p>
            </aside>
          </div>
          <h3 className="planta-plan-h3">{chrome.sepTitle}</h3>
          <ul className="planta-plan-list planta-plan-sep-list">
            {seps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'procesos' ? (
        <section>
          <TabIntro lead={chrome.procLead} />
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={chrome.procTitle}>
                <defs>
                  <marker id="planta-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0 0 L8 4 L0 8 z" fill="#071F5E" />
                  </marker>
                </defs>
                <FloorShell code="P-01" title={chrome.procTitle} />
                {zonaOrder.map((id) => (
                  <rect
                    key={id}
                    x={sx(zonaRects[id].x)}
                    y={sy(zonaRects[id].y)}
                    width={zonaRects[id].w * M}
                    height={zonaRects[id].h * M}
                    fill={fillOf(id, false)}
                    stroke="#071F5E"
                  />
                ))}
                <DoorsAndWindow {...aberturas} />
                <path
                  d={`M ${sx(3.0)} ${sy(0.6)} L ${sx(1.0)} ${sy(0.6)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                <path
                  d={`M ${sx(1.0)} ${sy(0.9)} L ${sx(2.0)} ${sy(1.7)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                <path
                  d={`M ${sx(2.0)} ${sy(1.95)} L ${sx(2.0)} ${sy(2.9)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                <path
                  d={`M ${sx(2.0)} ${sy(3.2)} L ${sx(1.15)} ${sy(4.05)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                <path
                  d={`M ${sx(1.45)} ${sy(4.05)} L ${sx(3.15)} ${sy(4.05)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                <path
                  d={`M ${sx(3.15)} ${sy(4.3)} L ${sx(3.2)} ${sy(5.1)}`}
                  fill="none"
                  stroke="#071F5E"
                  strokeWidth="2.4"
                  markerEnd="url(#planta-arrow)"
                />
                {[
                  { n: '01', x: 3.0, y: 0.6 },
                  { n: '02', x: 1.0, y: 0.6 },
                  { n: '03', x: 2.0, y: 1.7 },
                  { n: '04', x: 2.0, y: 2.9 },
                  { n: '05', x: 1.15, y: 4.05 },
                  { n: '06', x: 3.15, y: 4.05 },
                  { n: '07', x: 3.2, y: 5.1 },
                ].map((node) => (
                  <g key={node.n}>
                    <circle cx={sx(node.x)} cy={sy(node.y)} r="14" fill="#071F5E" />
                    <text x={sx(node.x)} y={sy(node.y) + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                      {node.n}
                    </text>
                  </g>
                ))}
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
                <DimV x={-0.55} y1={0} y2={5.5} label="5,50 m" />
              </svg>
            </div>
            <ol className="planta-plan-steps">
              {steps.map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {tab === 'tecnica' ? (
        <section>
          <TabIntro lead={chrome.tecLead} />
          <div className="planta-croquis">
            <svg viewBox="0 0 760 760" role="img" aria-label={chrome.tecTitle}>
              <FloorShell code="E-01" title={chrome.tecTitle} />
              {zonaOrder.map((id) => (
                <rect
                  key={id}
                  x={sx(zonaRects[id].x)}
                  y={sy(zonaRects[id].y)}
                  width={zonaRects[id].w * M}
                  height={zonaRects[id].h * M}
                  fill={fillOf(id, false)}
                  stroke="#b7c2ce"
                />
              ))}
              <DoorsAndWindow {...aberturas} />
              {luces.map((luz) => (
                <g key={luz.id}>
                  <circle cx={sx(luz.x)} cy={sy(luz.y)} r="11" fill="#fff8d6" stroke="#8a6d12" />
                  <line x1={sx(luz.x) - 7} y1={sy(luz.y) - 7} x2={sx(luz.x) + 7} y2={sy(luz.y) + 7} stroke="#8a6d12" />
                  <line x1={sx(luz.x) + 7} y1={sy(luz.y) - 7} x2={sx(luz.x) - 7} y2={sy(luz.y) + 7} stroke="#8a6d12" />
                  <text x={sx(luz.x)} y={sy(luz.y) + 24} textAnchor="middle" fill="#8a6d12" fontSize="9" fontWeight="700">
                    {luz.id}
                  </text>
                </g>
              ))}
              {desagues.map((drain) => (
                <g key={drain.id}>
                  <circle cx={sx(drain.x)} cy={sy(drain.y)} r="10" fill="#fff" stroke="#009179" strokeWidth="2" />
                  <line x1={sx(drain.x) - 7} y1={sy(drain.y)} x2={sx(drain.x) + 7} y2={sy(drain.y)} stroke="#009179" />
                  <line x1={sx(drain.x)} y1={sy(drain.y) - 7} x2={sx(drain.x)} y2={sy(drain.y) + 7} stroke="#009179" />
                  <text x={sx(drain.x) + 16} y={sy(drain.y) + 4} fill="#009179" fontSize="10" fontWeight="700">
                    {drain.id}
                  </text>
                </g>
              ))}
              {tomas.map((toma) => (
                <Receptacle
                  key={toma.id}
                  x={toma.x}
                  y={toma.y}
                  id={toma.id}
                  volts={toma.volts}
                  gfci={toma.gfci}
                  nema={toma.nema}
                />
              ))}
              <rect x={sx(3.5)} y={sy(4.65)} width="28" height="42" fill="#071F5E" />
              <text x={sx(3.64)} y={sy(5.18)} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">
                TAB
              </text>
              <path
                d={`M ${sx(3.64)} ${sy(4.65)} L ${sx(3.64)} ${sy(-0.08)} L ${sx(2)} ${sy(-0.08)}`}
                fill="none"
                stroke="#071F5E"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <text x={sx(2.4)} y={sy(-0.16)} fill="#071F5E" fontSize="9" fontWeight="700">
                C7 techo solar 3 kW
              </text>
              <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
              <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
              <DimV x={-0.55} y1={0} y2={5.5} label="5,50 m" />
            </svg>
          </div>
          <div className="planta-plan-table-wrap">
            <table className="planta-plan-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{chrome.nema}</th>
                  <th>{chrome.volts}</th>
                  <th>{chrome.amps}</th>
                  <th>{chrome.gfci}</th>
                  <th>{chrome.circuit}</th>
                  <th>{chrome.height}</th>
                  <th>{chrome.use}</th>
                </tr>
              </thead>
              <tbody>
                {tomas.map((toma) => (
                  <tr key={toma.id}>
                    <td>{toma.id}</td>
                    <td>{toma.nema}</td>
                    <td>{toma.volts}</td>
                    <td>{toma.amps}</td>
                    <td>{toma.gfci ? chrome.yes : chrome.no}</td>
                    <td>{toma.circuit}</td>
                    <td>{tomaAltura[toma.id]}</td>
                    <td>{uso[toma.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="planta-plan-table-wrap">
            <table className="planta-plan-table">
              <thead>
                <tr>
                  <th>{chrome.circuit}</th>
                  <th>{chrome.breaker}</th>
                  <th>{chrome.volts}</th>
                  <th>{chrome.load}</th>
                </tr>
              </thead>
              <tbody>
                {circuitos.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.breaker}</td>
                    <td>{c.volts}</td>
                    <td>{c.load}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="planta-plan-list">
            {gloss.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {chrome.tecDisclaimer ? <p className="planta-plan-disclaimer">{chrome.tecDisclaimer}</p> : null}
        </section>
      ) : null}

      {tab === 'agua' ? (
        <section>
          <TabIntro lead={agua.lead} />
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={agua.title}>
                <FloorShell code="H-01" title={agua.title} />
                {zonaOrder.map((id) => (
                  <rect
                    key={id}
                    x={sx(zonaRects[id].x)}
                    y={sy(zonaRects[id].y)}
                    width={zonaRects[id].w * M}
                    height={zonaRects[id].h * M}
                    fill={fillOf(id, false)}
                    stroke="#b7c2ce"
                  />
                ))}
                <DoorsAndWindow {...aberturas} />
                <line x1={sx(-0.12)} y1={sy(-0.12)} x2={sx(4.12)} y2={sy(-0.12)} stroke="#009179" strokeWidth="5" />
                <line x1={sx(-0.12)} y1={sy(-0.12)} x2={sx(-0.12)} y2={sy(5.62)} stroke="#009179" strokeWidth="5" />
                <line x1={sx(4.12)} y1={sy(-0.12)} x2={sx(4.12)} y2={sy(5.62)} stroke="#009179" strokeWidth="5" />
                <text x={sx(2)} y={sy(-0.28)} textAnchor="middle" fill="#009179" fontSize="10" fontWeight="700">
                  Canaleta
                </text>
                <rect x={sx(4.05)} y={sy(3.15)} width="18" height="28" fill="#c45c26" stroke="#071F5E" />
                <text x={sx(4.55)} y={sy(3.28)} fill="#c45c26" fontSize="9" fontWeight="700">
                  40 L
                </text>
                <circle cx={sx(4.7)} cy={sy(4.05)} r="48" fill="#d7ebe4" stroke="#009179" strokeWidth="2" />
                <text x={sx(4.7)} y={sy(4.02)} textAnchor="middle" fill="#071F5E" fontSize="10" fontWeight="700">
                  {agua.tank}
                </text>
                <path
                  d={`M ${sx(0.4)} ${sy(0.4)} L ${sx(0.4)} ${sy(4.7)} L ${sx(3.2)} ${sy(4.7)}`}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="3"
                />
                <path
                  d={`M ${sx(4.7)} ${sy(4.5)} L ${sx(4.7)} ${sy(5.2)} L ${sx(1.25)} ${sy(5.2)} L ${sx(1.25)} ${sy(-0.35)}`}
                  fill="none"
                  stroke="#009179"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
                <rect x={sx(3.7)} y={sy(5.55)} width="70" height="28" fill="#6b4f32" />
                <text x={sx(4.05)} y={sy(5.74)} textAnchor="middle" fill="#fff" fontSize="8">
                  Trampa
                </text>
                <text x={sx(0.55)} y={sy(4.55)} fill="#1d4ed8" fontSize="10" fontWeight="700">
                  {agua.potable}
                </text>
                <text x={sx(2.6)} y={sy(5.08)} fill="#009179" fontSize="10" fontWeight="700">
                  {agua.rain}
                </text>
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
              </svg>
            </div>
            <aside className="planta-card planta-plan-card planta-plan-aside">
              <p className="planta-aside-kicker">{agua.blueTitle}</p>
              <p>{agua.stepBlue}</p>
              <p>{agua.dual}</p>
              <p className="planta-aside-kicker">{agua.greenTitle}</p>
              <p>{agua.stepGreen}</p>
              <p>{agua.capture}</p>
              <p>{agua.treat}</p>
              <p className="planta-aside-kicker">{agua.outTitle}</p>
              <p>{agua.stepOut}</p>
              <p>{agua.residual}</p>
              <p className="planta-legal-ref">{agua.legal}</p>
            </aside>
          </div>
        </section>
      ) : null}

      {tab === 'energia' ? (
        <section>
          <TabIntro lead={solar.lead} />
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={solar.title}>
                <FloorShell code="S-01" title={solar.title} />
                <rect x={sx(0)} y={sy(0)} width={4 * M} height={5.5 * M} fill="#071F5E" opacity="0.88" />
                {[0, 1, 2].map((col) => (
                  <rect
                    key={col}
                    x={sx(0.28 + col * 1.24)}
                    y={sy(0.85)}
                    width={1.1 * M}
                    height={3.55 * M}
                    fill={col === 0 ? '#1e4d8c' : 'rgba(30,77,140,0.25)'}
                    stroke="#52ADAD"
                    strokeWidth="2"
                    strokeDasharray={col === 0 ? undefined : '8 6'}
                  />
                ))}
                <text x={sx(2)} y={sy(0.42)} textAnchor="middle" fill="#F2F2F2" fontSize="12" fontWeight="700">
                  {solar.roof}
                </text>
                <text x={sx(0.83)} y={sy(2.55)} textAnchor="middle" fill="#F2F2F2" fontSize="11" fontWeight="700">
                  {solar.phaseNow}
                </text>
                <text x={sx(0.83)} y={sy(2.85)} textAnchor="middle" fill="#F2F2F2" fontSize="12" fontWeight="700">
                  1 × {solarSpec.watts} W
                </text>
                <text x={sx(2.7)} y={sy(2.55)} textAnchor="middle" fill="#F2F2F2" fontSize="11" fontWeight="700">
                  {solar.phaseLater}
                </text>
                <text x={sx(2.7)} y={sy(2.85)} textAnchor="middle" fill="#F2F2F2" fontSize="11">
                  +2 × {solarSpec.watts} W
                </text>
                <DoorsAndWindow {...aberturas} />
                <rect x={sx(4.25)} y={sy(1.55)} width="190" height="175" rx="8" fill="#fff" stroke="#071F5E" />
                <text x={sx(5.2)} y={sy(1.85)} textAnchor="middle" fill="#071F5E" fontSize="12" fontWeight="700">
                  {solar.convertLabel}
                </text>
                <text x={sx(5.2)} y={sy(2.12)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {solar.motor}
                </text>
                <text x={sx(5.2)} y={sy(2.35)} textAnchor="middle" fill="#071F5E" fontSize="10">
                  DC → AC · TAB C7
                </text>
                <text x={sx(5.2)} y={sy(2.7)} textAnchor="middle" fill="#009179" fontSize="11" fontWeight="700">
                  {solar.storeLabel}
                </text>
                <text x={sx(5.2)} y={sy(2.95)} textAnchor="middle" fill="#071F5E" fontSize="10">
                  backup = ICE
                </text>
                <text x={sx(5.2)} y={sy(3.25)} textAnchor="middle" fill="#071F5E" fontSize="10">
                  ≈ US$ {solarSpec.budgetUsd}
                </text>
                <text x={sx(5.2)} y={sy(3.55)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  ~{solarSpec.kwhDayPhase1} kWh/día
                </text>
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
                <DimV x={-0.55} y1={0} y2={5.5} label="5,50 m" />
              </svg>
            </div>
            <aside className="planta-card planta-plan-card planta-plan-aside">
              <p>{solar.cleanGoal}</p>
              <p>{solar.compete}</p>
              <p>{solar.budgetOne}</p>
              <p>{solar.path}</p>
              <p>{solar.storage}</p>
              <p>{solar.inverter}</p>
              <p>{solar.ice}</p>
              <p>{solar.fit}</p>
              {solar.disclaimer ? <p className="planta-legal-ref">{solar.disclaimer}</p> : null}
            </aside>
          </div>
          <h3 className="planta-plan-h3">{solar.loadsTitle}</h3>
          <div className="planta-plan-table-wrap">
            <table className="planta-plan-table">
              <thead>
                <tr>
                  <th>{chrome.load}</th>
                  <th>W</th>
                  <th>h/día</th>
                  <th>kWh</th>
                  <th>{solar.payCol}</th>
                </tr>
              </thead>
              <tbody>
                {solarLoads.map((row) => (
                  <tr key={row.id}>
                    <td>{loads[row.id]}</td>
                    <td>{row.w}</td>
                    <td>{row.hDay}</td>
                    <td>{row.kwh}</td>
                    <td>{pay[row.pay]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'iso' ? (
        <section>
          <TabIntro lead={chrome.isoLead} />
          <div className="planta-plan-split planta-plan-split--viewer">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={chrome.isoTitle}>
                <FloorShell code="EQ-01" title={chrome.isoTitle} />
                {zonaOrder.map((id) => (
                  <rect
                    key={id}
                    x={sx(zonaRects[id].x)}
                    y={sy(zonaRects[id].y)}
                    width={zonaRects[id].w * M}
                    height={zonaRects[id].h * M}
                    fill={fillOf(id, false)}
                    stroke="#c5d0c8"
                  />
                ))}
                <DoorsAndWindow {...aberturas} />
                {equipos3d.map((item) => (
                  <EquipoSymbol
                    key={item.id}
                    item={item}
                    selected={eq === item.id}
                    label={shortEq[item.id]}
                    onClick={() => setEq(item.id)}
                  />
                ))}
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
                <DimV x={-0.55} y1={0} y2={5.5} label="5,50 m" />
              </svg>
            </div>
            <EquipAside
              selectId="planta-equip-iso"
              eq={eq}
              setEq={setEq}
              ficha={ficha}
              equipos={equipos3d}
              equipSelectLabel={chrome.equipSelect}
              sizeLabel={chrome.size}
              showSize
            />
          </div>
        </section>
      ) : null}

      {tab === 'iso3d' ? (
        <section>
          <TabIntro lead={chrome.iso3dLead} />
          <div className="planta-plan-split planta-plan-split--viewer">
            <div className="planta-croquis">
              <PlantaVista3D
                title={chrome.iso3dTitle}
                labels={shortEq}
                selected={eq}
                onSelect={setEq}
                openings={aberturas}
                locale={loc}
              />
            </div>
            <EquipAside
              selectId="planta-equip-3d"
              eq={eq}
              setEq={setEq}
              ficha={ficha}
              equipos={equipos3d}
              equipSelectLabel={chrome.equipSelect}
              sizeLabel={chrome.size}
            />
          </div>
        </section>
      ) : null}

      {tab === 'materiales' ? (
        <section>
          <div className="planta-plan-split">
            <div className="planta-croquis">
              <svg viewBox="0 0 760 760" role="img" aria-label={chrome.matTitle}>
                <FloorShell code="M-01" title={chrome.matTitle} />
                {zonaOrder.map((id) => (
                  <rect
                    key={id}
                    x={sx(zonaRects[id].x)}
                    y={sy(zonaRects[id].y)}
                    width={zonaRects[id].w * M}
                    height={zonaRects[id].h * M}
                    fill={id === 'envase' || id === 'almacen' ? '#efe8d4' : id === 'ingreso' ? '#e4dcc8' : '#cfd8d0'}
                    stroke="#071F5E"
                  />
                ))}
                <line x1={sx(2.05)} y1={sy(0)} x2={sx(2.05)} y2={sy(1.2)} stroke="#c45c26" strokeWidth="4" />
                <rect x={sx(0)} y={sy(3.52)} width={4 * M} height={0.16 * M} fill="#c9a227" />
                <line x1={sx(0)} y1={sy(3.6)} x2={sx(4)} y2={sy(3.6)} stroke="#071F5E" strokeWidth="3" strokeDasharray="7 5" />
                <DoorsAndWindow {...aberturas} />
                <text x={sx(1.0)} y={sy(0.65)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.lavado}
                </text>
                <text x={sx(3.0)} y={sy(0.65)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.recepcion}
                </text>
                <text x={sx(2)} y={sy(1.75)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.preparacion}
                </text>
                <text x={sx(2)} y={sy(2.95)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.transformacion}
                </text>
                <text x={sx(1.15)} y={sy(4.1)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.envase} · +1 cm
                </text>
                <text x={sx(3.15)} y={sy(4.1)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.almacen} · +1 cm
                </text>
                <text x={sx(2)} y={sy(5.05)} textAnchor="middle" fill="#071F5E" fontSize="11" fontWeight="700">
                  {short.ingreso}
                </text>
                <text x={sx(2.1)} y={sy(0.28)} fill="#c45c26" fontSize="9" fontWeight="700">
                  cinta
                </text>
                <text x={sx(2)} y={sy(3.48)} textAnchor="middle" fill="#8a6d12" fontSize="9" fontWeight="700">
                  {chrome.screen}
                </text>
                <RoomLabels back={chrome.back} front={chrome.front} acopio={chrome.acopio} />
                <DimH x1={0} x2={4} y={6.18} label="4,00 m" />
                <DimV x={-0.55} y1={0} y2={5.5} label="5,50 m" />
              </svg>
            </div>
            <aside className="planta-card planta-plan-card">
              <h3>{mat.floors.title}</h3>
              <ul className="planta-plan-list">
                {mat.floors.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>{mat.walls.title}</h3>
              <ul className="planta-plan-list">
                {mat.walls.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>{mat.split.title}</h3>
              <ul className="planta-plan-list">
                {mat.split.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}
