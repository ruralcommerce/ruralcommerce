'use client';

import { useState } from 'react';
import { zones } from '@/lib/planta-content';
import { cn } from '@/lib/planta-cn';

const zoneMeta: Record<string, { x: number; y: number; w: number; h: number }> = {
  lavado: { x: 90, y: 78, w: 188, h: 118 },
  recepcion: { x: 278, y: 78, w: 172, h: 118 },
  triturado: { x: 90, y: 206, w: 188, h: 132 },
  coccion: { x: 278, y: 206, w: 172, h: 132 },
  envase: { x: 90, y: 348, w: 360, h: 108 },
  ingreso: { x: 90, y: 466, w: 360, h: 86 },
};

export function PlantaFloorPlan() {
  const [active, setActive] = useState('lavado');
  const zone = zones.find((z) => z.id === active) ?? zones[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
      <div className="overflow-hidden rounded-2xl border border-[#E6EBF1] bg-white p-3 md:p-4">
        <svg viewBox="0 0 540 700" className="h-auto w-full" role="img" aria-label="Planta de 4,0 por 5,5 metros">
          <rect width="540" height="700" fill="#fffaf1" />
          <text x="270" y="28" textAnchor="middle" fill="#5b5346" fontSize="13">
            Parte trasera · hacia el centro de acopio
          </text>
          <rect x="88" y="76" width="364" height="478" fill="none" stroke="#1c2418" strokeWidth="6" />
          {zones.map((z) => {
            const box = zoneMeta[z.id];
            if (!box) return null;
            const selected = active === z.id;
            return (
              <g key={z.id} onClick={() => setActive(z.id)} className="cursor-pointer">
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  fill={z.color}
                  fillOpacity={selected ? 0.28 : 0.12}
                  stroke={z.color}
                  strokeWidth={selected ? 2.5 : 1}
                />
                <text x={box.x + box.w / 2} y={box.y + box.h / 2} textAnchor="middle" fill="#1c2418" fontSize="12">
                  {z.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setActive(z.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                active === z.id ? 'border-transparent bg-[#071F5E] text-white' : 'border-[#E6EBF1] bg-white'
              )}
            >
              {z.name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-[#E6EBF1] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#009179]">Zona activa</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#071F5E]">{zone.name}</h2>
          <p className="mt-2 text-sm">{zone.role}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[#2F3336]/60">Dónde</dt>
              <dd>{zone.where}</dd>
            </div>
            <div>
              <dt className="text-[#2F3336]/60">Sí</dt>
              <dd>{zone.do}</dd>
            </div>
            <div>
              <dt className="text-[#2F3336]/60">No</dt>
              <dd>{zone.dont}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
