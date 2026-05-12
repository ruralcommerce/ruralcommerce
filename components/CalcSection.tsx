'use client';

import { useState } from 'react';

function parseNum(s: string) {
  const n = parseFloat(s.replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function CalcSection() {
  const [kg, setKg] = useState('');
  const [pct, setPct] = useState('');
  const [price, setPrice] = useState('');

  const prod = parseNum(kg);
  const loss = Math.min(100, Math.max(0, parseNum(pct)));
  const pr = parseNum(price);

  const lostKg = prod * (loss / 100);
  const lostUSD = Math.round(lostKg * pr);
  const hasValues = prod > 0 && loss > 0 && pr > 0;

  // Métricas de impacto por kg resgatado (base: 5 kg matéria-prima → 1 kg produto)
  const co2 = +(lostKg * 3.3).toFixed(1);
  const kwh = +(lostKg * 1.5).toFixed(1);
  const water = Math.round(lostKg * 800);
  const plastics = Math.round(lostKg * 0.8);

  return (
    <section className="relative overflow-hidden bg-[#0F1B5C] py-16 sm:py-20">
      {/* padrão de pontos */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Esquerda: formulário ── */}
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              ¿Cuánta plata estás dejando arriba de la mesa?
            </h2>
            <p className="mt-4 text-base text-white">
              Ingresá tus datos y descubrí cuánto dinero se pierde cada mes con tu excedente.
            </p>

            <div className="mt-8 rounded-2xl bg-white p-8 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">Producción mensual (kg)</label>
                  <input
                    type="text" inputMode="decimal" placeholder="Ej: 1000"
                    value={kg} onChange={(e) => setKg(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">% de pérdida estimada</label>
                  <input
                    type="text" inputMode="decimal" placeholder="Ej: 20"
                    value={pct} onChange={(e) => setPct(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">Precio promedio de venta (USD/kg)</label>
                  <input
                    type="text" inputMode="decimal" placeholder="Ej: 2"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>

                <div className="rounded-xl bg-[#F4F5F7] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1E]/50">
                    Estás perdiendo por mes
                  </p>
                  <p className="mt-1">
                    <span className="text-sm font-semibold text-[#009179]">USD </span>
                    <span className="text-4xl font-extrabold text-[#009179]">
                      {hasValues ? lostUSD.toLocaleString('es-UY') : '—'}
                    </span>
                    {hasValues && (
                      <span className="ml-1 text-sm text-[#1E1E1E]/50">
                        ({lostKg.toLocaleString('es-UY', { maximumFractionDigits: 1 })} kg sin monetizar)
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-xs text-[#1E1E1E]/45">
                    Estimación orientativa: kg perdidos × precio actual de venta.
                  </p>
                </div>

                <a
                  href="/calculadora"
                  className="block rounded-xl bg-[#0F1B5C] py-4 text-center text-sm font-bold text-white transition hover:bg-[#1a2d8a]"
                >
                  Ver cuánto podrías ganar con ese excedente →
                </a>
              </div>
            </div>
          </div>

          {/* ── Direita: impacto ── */}
          <div className="lg:pt-[88px]">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#5DE8CF]">
              Y además de no perder ese dinero…
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl">
              Al rescatar{' '}
              <span className="text-[#5DE8CF]">
                {hasValues ? `${lostKg.toLocaleString('es-UY', { maximumFractionDigits: 1 })} kg` : 'tu excedente'}
              </span>{' '}
              también generás:
            </h3>
            <p className="mt-2 text-sm text-white">
              Basado en el ratio real de valorización: 5 kg de materia prima → 1 kg de producto procesado.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { emoji: '🌳', value: hasValues ? `${co2} kg` : '—', label: 'CO₂e evitados', sub: 'equivale a un árbol adulto por año' },
                { emoji: '☀️', value: hasValues ? `${kwh} kWh` : '—', label: 'Energía limpia ahorrada', sub: 'con matrices térmicas/solares' },
                { emoji: '💧', value: hasValues ? `${water.toLocaleString('es-UY')} L` : '—', label: 'Agua virtual preservada', sub: 'capital hídrico del cultivo' },
                { emoji: '♻️', value: hasValues ? `${plastics}` : '—', label: 'Empaques plásticos eliminados', sub: 'por circularidad real' },
              ].map(({ emoji, value, label, sub }) => (
                <div key={label} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                  <span className="text-2xl">{emoji}</span>
                  <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
                  <p className="mt-0.5 text-xs font-semibold text-white/90">{label}</p>
                  <p className="mt-1 text-[11px] text-white leading-snug">{sub}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-white leading-relaxed">
              La calculadora completa incorpora el tipo de producto, el proceso de transformación y los costos reales para mostrarte el potencial de ingreso neto.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
