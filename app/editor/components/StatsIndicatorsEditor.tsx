'use client';

import { useId, useMemo } from 'react';

/** Mesmas chaves que `StatsCarousel` / STAT_ICONS. */
export const STATS_INDICATOR_ICON_OPTIONS = [
  { value: 'users', label: 'Pessoas / equipa' },
  { value: 'droplets', label: 'Água (gota)' },
  { value: 'building2', label: 'Edifício / org.' },
  { value: 'leaf', label: 'Folha / sustentabilidade' },
  { value: 'mapPin', label: 'Mapa / território' },
  { value: 'sprout', label: 'Brote / produtores' },
] as const;

export type StatIndicatorRow = {
  icon: string;
  digits: string;
  symbol: '+' | '%';
  label: string;
};

/** Conteúdo inicial alinhado ao carrossel padrão (ES) ao ativar edição manual. */
const SEED_ROWS: StatIndicatorRow[] = [
  {
    icon: 'users',
    digits: '1200',
    symbol: '+',
    label: 'Toneladas de CO₂ evitadas en proyectos reales',
  },
  {
    icon: 'droplets',
    digits: '8,714',
    symbol: '+',
    label: 'Millones de litros de agua preservados.',
  },
  {
    icon: 'building2',
    digits: '1600',
    symbol: '%',
    label: 'de aumento promedio en la rentabilidad en redes implementadas',
  },
  {
    icon: 'leaf',
    digits: '35',
    symbol: '+',
    label: 'especies y cultivos asociados a redes de valor sostenible',
  },
  {
    icon: 'mapPin',
    digits: '18',
    symbol: '+',
    label: 'territorios con intervenciones coordinadas en campo',
  },
  {
    icon: 'sprout',
    digits: '240',
    symbol: '+',
    label: 'productores vinculados a programas de eficiencia',
  },
];

function emptyRow(): StatIndicatorRow {
  return { icon: 'users', digits: '', symbol: '+', label: '' };
}

function parseRows(raw: string): StatIndicatorRow[] | null {
  const t = raw.trim();
  if (!t) return [];
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: StatIndicatorRow[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const sym = String(o.symbol ?? '+').trim() === '%' ? '%' : '+';
      out.push({
        icon: String(o.icon ?? 'users'),
        digits: String(o.digits ?? ''),
        symbol: sym,
        label: String(o.label ?? ''),
      });
    }
    return out;
  } catch {
    return null;
  }
}

function serialize(rows: StatIndicatorRow[]): string {
  const payload = rows
    .filter((r) => r.label.trim() !== '')
    .map((r) => ({
      icon: r.icon,
      digits: r.digits.trim(),
      symbol: r.symbol,
      label: r.label.trim(),
    }));
  return JSON.stringify(payload);
}

type StatsIndicatorsEditorProps = {
  value: string;
  onChange: (next: string) => void;
  jsonError?: string | null;
};

export function StatsIndicatorsEditor({ value, onChange, jsonError }: StatsIndicatorsEditorProps) {
  const formUid = useId();
  const parsed = useMemo(() => parseRows(value), [value]);
  const useBuiltin = value.trim() === '';

  if (useBuiltin) {
    return (
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-slate-800">Indicadores do carrossel</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            O site usa os <strong>seis valores pré-definidos</strong> por idioma (ES / PT-BR / EN). O aspeto dos cartões
            no público não muda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(serialize(SEED_ROWS))}
          className="w-full rounded-lg border border-violet-300 bg-violet-50 py-2.5 text-xs font-semibold text-violet-900 hover:bg-violet-100"
        >
          Editar indicadores manualmente (ícone, número, símbolo, descrição)
        </button>
      </div>
    );
  }

  if (parsed === null) {
    return (
      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] text-amber-900">
          {jsonError ?? 'Os dados guardados não são JSON válido.'} Carrega o modelo abaixo e grava de novo.
        </p>
        <button
          type="button"
          onClick={() => onChange(serialize(SEED_ROWS))}
          className="w-full rounded-lg border border-amber-400 bg-white py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100/80"
        >
          Carregar modelo (6 indicadores) para editar
        </button>
      </div>
    );
  }

  const rows = parsed.length === 0 ? [emptyRow()] : parsed.map((r) => ({ ...r }));

  const setRows = (next: StatIndicatorRow[]) => {
    onChange(serialize(next));
  };

  const updateRow = (index: number, patch: Partial<StatIndicatorRow>) => {
    const base = [...rows];
    base[index] = { ...base[index], ...patch };
    setRows(base);
  };

  const addRow = () => setRows([...rows, emptyRow()]);

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    setRows(next.length ? next : [emptyRow()]);
  };

  const moveRow = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    const t = next[index];
    next[index] = next[j];
    next[j] = t;
    setRows(next);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-800">Indicadores</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Ícone, número, símbolo (+ ou %) e descrição — igual ao cartão público (CSS igual no site).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange('')}
          className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar aos pré-definidos
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={`stat-indicator-${index}`} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/90 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Indicador {index + 1}
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveRow(index, -1)}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 disabled:opacity-35"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === rows.length - 1}
                  onClick={() => moveRow(index, 1)}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 disabled:opacity-35"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded border border-red-200 bg-white px-2 py-0.5 text-xs text-red-700 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="block space-y-1">
                <label htmlFor={`${formUid}-icon-${index}`} className="block text-[11px] font-medium text-slate-600">
                  Ícone
                </label>
                <select
                  id={`${formUid}-icon-${index}`}
                  value={row.icon}
                  onChange={(e) => updateRow(index, { icon: e.target.value })}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                >
                  {STATS_INDICATOR_ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="block space-y-1">
                  <label htmlFor={`${formUid}-digits-${index}`} className="block text-[11px] font-medium text-slate-600">
                    Número
                  </label>
                  <input
                    id={`${formUid}-digits-${index}`}
                    type="text"
                    value={row.digits}
                    onChange={(e) => updateRow(index, { digits: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                    placeholder="ex.: 35"
                  />
                </div>
                <div className="block space-y-1">
                  <label htmlFor={`${formUid}-symbol-${index}`} className="block text-[11px] font-medium text-slate-600">
                    Símbolo
                  </label>
                  <select
                    id={`${formUid}-symbol-${index}`}
                    value={row.symbol}
                    onChange={(e) => updateRow(index, { symbol: e.target.value as '+' | '%' })}
                    className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                  >
                    <option value="+">+</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="block space-y-1">
              <label htmlFor={`${formUid}-label-${index}`} className="block text-[11px] font-medium text-slate-600">
                Descrição
              </label>
              <textarea
                id={`${formUid}-label-${index}`}
                value={row.label}
                onChange={(e) => updateRow(index, { label: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                rows={3}
                className="w-full resize-y rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                placeholder="Texto por baixo do número"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="w-full rounded-lg border border-dashed border-slate-400 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        + Adicionar indicador
      </button>
    </div>
  );
}
