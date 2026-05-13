'use client';

import { useState } from 'react';

function parseNum(s: string) {
  const n = parseFloat(s.replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export type CalcSectionProps = {
  locale?: string;
};

const calcCopy = {
  es: {
    title: '¿Cuánta plata estás dejando arriba de la mesa?',
    subtitle: 'Ingresá tus datos y descubrí cuánto dinero se pierde cada mes con tu excedente.',
    monthlyProduction: 'Producción mensual (kg)',
    estimatedLoss: '% de pérdida estimada',
    averagePrice: 'Precio promedio de venta (USD/kg)',
    monthlyProductionPlaceholder: 'Ej: 1000',
    estimatedLossPlaceholder: 'Ej: 20',
    averagePricePlaceholder: 'Ej: 2',
    losingPerMonth: 'Estás perdiendo por mes',
    estimateHint: 'Estimación orientativa: kg perdidos × precio actual de venta.',
    cta: 'Ver cuánto podrías ganar con ese excedente →',
    impactLead: 'Y además de no perder ese dinero…',
    impactTitlePrefix: 'Al rescatar ',
    impactTitleFallback: 'tu excedente',
    impactTitleSuffix: ' también generás:',
    impactRatio: 'Basado en el ratio real de valorización: 5 kg de materia prima → 1 kg de producto procesado.',
    co2: 'CO₂e evitados',
    co2Sub: 'equivale a un árbol adulto por año',
    energy: 'Energía limpia ahorrada',
    energySub: 'con matrices térmicas/solares',
    water: 'Agua virtual preservada',
    waterSub: 'capital hídrico del cultivo',
    plastics: 'Empaques plásticos eliminados',
    plasticsSub: 'por circularidad real',
    closing:
      'La calculadora completa incorpora el tipo de producto, el proceso de transformación y los costos reales para mostrarte el potencial de ingreso neto.',
    locale: 'es-UY',
  },
  'pt-BR': {
    title: 'Quanto dinheiro você está deixando na mesa?',
    subtitle: 'Informe seus dados e descubra quanto valor se perde por mês com seu excedente.',
    monthlyProduction: 'Produção mensal (kg)',
    estimatedLoss: '% de perda estimada',
    averagePrice: 'Preço médio de venda (USD/kg)',
    monthlyProductionPlaceholder: 'Ex: 1000',
    estimatedLossPlaceholder: 'Ex: 20',
    averagePricePlaceholder: 'Ex: 2',
    losingPerMonth: 'Você está perdendo por mês',
    estimateHint: 'Estimativa orientativa: kg perdidos × preço atual de venda.',
    cta: 'Ver quanto você poderia ganhar com esse excedente →',
    impactLead: 'E além de não perder esse dinheiro…',
    impactTitlePrefix: 'Ao resgatar ',
    impactTitleFallback: 'seu excedente',
    impactTitleSuffix: ' você também gera:',
    impactRatio: 'Com base na relação real de valorização: 5 kg de matéria-prima → 1 kg de produto processado.',
    co2: 'CO₂e evitados',
    co2Sub: 'equivale a uma árvore adulta por ano',
    energy: 'Energia limpa economizada',
    energySub: 'com matrizes térmicas/solares',
    water: 'Água virtual preservada',
    waterSub: 'capital hídrico do cultivo',
    plastics: 'Embalagens plásticas eliminadas',
    plasticsSub: 'por circularidade real',
    closing:
      'A calculadora completa considera o tipo de produto, o processo de transformação e os custos reais para mostrar seu potencial de renda líquida.',
    locale: 'pt-BR',
  },
  en: {
    title: 'How much money are you leaving on the table?',
    subtitle: 'Enter your data and discover how much value is lost each month from your surplus.',
    monthlyProduction: 'Monthly production (kg)',
    estimatedLoss: 'Estimated loss %',
    averagePrice: 'Average selling price (USD/kg)',
    monthlyProductionPlaceholder: 'Eg: 1000',
    estimatedLossPlaceholder: 'Eg: 20',
    averagePricePlaceholder: 'Eg: 2',
    losingPerMonth: 'You are losing per month',
    estimateHint: 'Reference estimate: lost kg × current selling price.',
    cta: 'See how much you could earn from this surplus →',
    impactLead: 'And beyond avoiding this loss…',
    impactTitlePrefix: 'By recovering ',
    impactTitleFallback: 'your surplus',
    impactTitleSuffix: ' you also generate:',
    impactRatio: 'Based on the real value-add ratio: 5 kg raw material → 1 kg processed product.',
    co2: 'CO₂e avoided',
    co2Sub: 'equivalent to one mature tree per year',
    energy: 'Clean energy saved',
    energySub: 'with thermal/solar matrices',
    water: 'Virtual water preserved',
    waterSub: 'crop water capital',
    plastics: 'Plastic packaging eliminated',
    plasticsSub: 'through real circularity',
    closing:
      'The full calculator factors in product type, transformation process, and real costs to show your net income potential.',
    locale: 'en-US',
  },
} as const;

export function CalcSection({ locale = 'es' }: CalcSectionProps) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  const copy = calcCopy[key];

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
              {copy.title}
            </h2>
            <p className="mt-4 text-base text-white">
              {copy.subtitle}
            </p>

            <div className="mt-8 rounded-2xl bg-white p-8 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">{copy.monthlyProduction}</label>
                  <input
                    type="text" inputMode="decimal" placeholder={copy.monthlyProductionPlaceholder}
                    value={kg} onChange={(e) => setKg(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">{copy.estimatedLoss}</label>
                  <input
                    type="text" inputMode="decimal" placeholder={copy.estimatedLossPlaceholder}
                    value={pct} onChange={(e) => setPct(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E1E1E]">{copy.averagePrice}</label>
                  <input
                    type="text" inputMode="decimal" placeholder={copy.averagePricePlaceholder}
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/35 focus:border-[#009179] focus:ring-1 focus:ring-[#009179]"
                  />
                </div>

                <div className="rounded-xl bg-[#F4F5F7] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1E]/50">
                    {copy.losingPerMonth}
                  </p>
                  <p className="mt-1">
                    <span className="text-sm font-semibold text-[#009179]">USD </span>
                    <span className="text-4xl font-extrabold text-[#009179]">
                      {hasValues ? lostUSD.toLocaleString(copy.locale) : '—'}
                    </span>
                    {hasValues && (
                      <span className="ml-1 text-sm text-[#1E1E1E]/50">
                        ({lostKg.toLocaleString(copy.locale, { maximumFractionDigits: 1 })} kg)
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-xs text-[#1E1E1E]/45">
                    {copy.estimateHint}
                  </p>
                </div>

                <a
                  href="/calculadora"
                  className="block rounded-xl bg-[#0F1B5C] py-4 text-center text-sm font-bold text-white transition hover:bg-[#1a2d8a]"
                >
                  {copy.cta}
                </a>
              </div>
            </div>
          </div>

          {/* ── Direita: impacto ── */}
          <div className="lg:pt-[88px]">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#5DE8CF]">
              {copy.impactLead}
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl">
              {copy.impactTitlePrefix}{' '}
              <span className="text-[#5DE8CF]">
                {hasValues ? `${lostKg.toLocaleString(copy.locale, { maximumFractionDigits: 1 })} kg` : copy.impactTitleFallback}
              </span>{' '}
              {copy.impactTitleSuffix}
            </h3>
            <p className="mt-2 text-sm text-white">
              {copy.impactRatio}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { emoji: '🌳', value: hasValues ? `${co2} kg` : '—', label: copy.co2, sub: copy.co2Sub },
                { emoji: '☀️', value: hasValues ? `${kwh} kWh` : '—', label: copy.energy, sub: copy.energySub },
                { emoji: '💧', value: hasValues ? `${water.toLocaleString(copy.locale)} L` : '—', label: copy.water, sub: copy.waterSub },
                { emoji: '♻️', value: hasValues ? `${plastics}` : '—', label: copy.plastics, sub: copy.plasticsSub },
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
              {copy.closing}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
