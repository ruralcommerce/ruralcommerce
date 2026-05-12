'use client';

import { useMemo, useState } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';

function parseNum(s: string): number {
  const n = Number(String(s).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function LossCalculator() {
  const [monthlyKg, setMonthlyKg] = useState('1000');
  const [lossPct, setLossPct] = useState('20');
  const [pricePerKg, setPricePerKg] = useState('2');

  const result = useMemo(() => {
    const prod = parseNum(monthlyKg);
    const loss = Math.min(100, Math.max(0, parseNum(lossPct)));
    const price = parseNum(pricePerKg);
    const lostKg = prod * (loss / 100);
    const usdPerMonth = lostKg * price;
    return { lostKg, usdPerMonth };
  }, [monthlyKg, lossPct, pricePerKg]);

  return (
    <div className="rounded-2xl border border-[#071F5E]/10 bg-gradient-to-br from-white to-[#009179]/5 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#009179] text-white">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#1E1E1E]">¿Cuánta plata estás dejando arriba de la mesa?</h3>
          <p className="mt-1 text-sm text-[#1E1E1E]/70">
            En menos de un minuto, estimá cuánto valor se pierde en tu operación.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#1E1E1E]/55">Producción mensual</span>
          <div className="mt-1 flex rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#009179]/30">
            <input
              type="text"
              inputMode="decimal"
              value={monthlyKg}
              onChange={(e) => setMonthlyKg(e.target.value)}
              className="w-full min-w-0 rounded-l-lg border-0 bg-transparent px-3 py-2.5 text-[#1E1E1E] outline-none"
            />
            <span className="flex items-center pr-3 text-sm text-[#1E1E1E]/55">kg</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#1E1E1E]/55">% de pérdida</span>
          <div className="mt-1 flex rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#009179]/30">
            <input
              type="text"
              inputMode="decimal"
              value={lossPct}
              onChange={(e) => setLossPct(e.target.value)}
              className="w-full min-w-0 rounded-l-lg border-0 bg-transparent px-3 py-2.5 text-[#1E1E1E] outline-none"
            />
            <span className="flex items-center pr-3 text-sm text-[#1E1E1E]/55">%</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[#1E1E1E]/55">Precio promedio</span>
          <div className="mt-1 flex rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#009179]/30">
            <span className="flex items-center pl-3 text-sm text-[#1E1E1E]/55">USD</span>
            <input
              type="text"
              inputMode="decimal"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="w-full min-w-0 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-[#1E1E1E] outline-none"
            />
            <span className="flex items-center pr-3 text-sm text-[#1E1E1E]/55">/kg</span>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#071F5E]/10 bg-[#071F5E]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[#071F5E]">
          <TrendingDown className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Podrías estar perdiendo</span>
        </div>
        <p className="text-2xl font-bold tabular-nums text-[#071F5E] sm:text-right">
          USD {result.usdPerMonth.toLocaleString('es-UY', { maximumFractionDigits: 0 })}{' '}
          <span className="text-base font-semibold text-[#1E1E1E]/80">por mes</span>
        </p>
      </div>
      <p className="mt-2 text-xs text-[#1E1E1E]/55">
        Estimación orientativa: {result.lostKg.toLocaleString('es-UY', { maximumFractionDigits: 1 })} kg/mes no
        monetizados según tus datos.
      </p>
    </div>
  );
}
