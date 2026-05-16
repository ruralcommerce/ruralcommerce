'use client';

import { useId, useMemo } from 'react';
import {
  STAT_INDICATOR_ICON_GROUPS,
  STAT_INDICATOR_SYMBOL_OPTIONS,
  STAT_SYMBOL_CUSTOM_PLACEHOLDER,
  buildStatIconKey,
  isStatSymbolPreset,
  parseStatIconFields,
  resolveStatIndicatorVisual,
} from '@/lib/stats-indicator-icons';

export type StatIndicatorRow = {
  icon: string;
  digits: string;
  symbol: string;
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

/** Valor do &lt;select&gt; para «(nenhum)» — não usar string vazia (colide com modo personalizado). */
const SYMBOL_NONE_SELECT = '__none__';
const SYMBOL_CUSTOM_SELECT = '__custom__';

function symbolToSelectValue(symbol: string): string {
  if (symbol === '') return SYMBOL_NONE_SELECT;
  if (symbol === STAT_SYMBOL_CUSTOM_PLACEHOLDER) return SYMBOL_CUSTOM_SELECT;
  if (isStatSymbolPreset(symbol)) return symbol;
  return SYMBOL_CUSTOM_SELECT;
}

function selectValueToSymbol(selectValue: string, currentSymbol: string): string {
  if (selectValue === SYMBOL_NONE_SELECT) return '';
  if (selectValue === SYMBOL_CUSTOM_SELECT) {
    if (
      currentSymbol !== '' &&
      currentSymbol !== STAT_SYMBOL_CUSTOM_PLACEHOLDER &&
      !isStatSymbolPreset(currentSymbol)
    ) {
      return currentSymbol;
    }
    return STAT_SYMBOL_CUSTOM_PLACEHOLDER;
  }
  return selectValue;
}

function symbolForCustomInput(symbol: string): string {
  if (symbol === STAT_SYMBOL_CUSTOM_PLACEHOLDER) return '';
  return symbol;
}

function customInputToSymbol(input: string): string {
  if (input.trim() === '') return STAT_SYMBOL_CUSTOM_PLACEHOLDER;
  return input;
}

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
      out.push({
        icon: String(o.icon ?? 'users'),
        digits: String(o.digits ?? ''),
        symbol: String(o.symbol ?? '+'),
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
      label: r.label,
    }));
  return JSON.stringify(payload);
}

function StatIconPreview({ iconKey }: { iconKey: string }) {
  const visual = resolveStatIndicatorVisual(iconKey);
  if (visual.kind === 'emoji') {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-2xl">
        {visual.emoji}
      </span>
    );
  }
  const Icon = visual.Icon;
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#071F5E]">
      <Icon className="h-7 w-7" strokeWidth={1.35} aria-hidden />
    </span>
  );
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
            Mais de 40 ícones Lucide, emoji personalizado (🌾, ⚡…) e vários símbolos ao lado do número (+, %, K, M…).
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
        {rows.map((row, index) => {
          const { preset, emoji } = parseStatIconFields(row.icon);
          const symbolSelectValue = symbolToSelectValue(row.symbol);

          return (
            <div key={`stat-indicator-${index}`} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/90 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatIconPreview iconKey={row.icon} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Indicador {index + 1}
                  </span>
                </div>
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

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="block space-y-1">
                  <label htmlFor={`${formUid}-icon-${index}`} className="block text-[11px] font-medium text-slate-600">
                    Ícone (biblioteca)
                  </label>
                  <select
                    id={`${formUid}-icon-${index}`}
                    value={preset}
                    disabled={Boolean(emoji.trim())}
                    onChange={(e) => updateRow(index, { icon: buildStatIconKey(e.target.value, '') })}
                    className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {STAT_INDICATOR_ICON_GROUPS.map((group) => (
                      <optgroup key={group.id} label={group.label}>
                        {group.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="block space-y-1 sm:min-w-[140px]">
                  <span className="block text-[11px] font-medium text-slate-600">Pré-visualização</span>
                  <StatIconPreview iconKey={row.icon} />
                </div>
              </div>

              <div className="block space-y-1">
                <label htmlFor={`${formUid}-emoji-${index}`} className="block text-[11px] font-medium text-slate-600">
                  Emoji ou símbolo Unicode (opcional)
                </label>
                <input
                  id={`${formUid}-emoji-${index}`}
                  type="text"
                  value={emoji}
                  onChange={(e) => {
                    const nextEmoji = e.target.value;
                    updateRow(index, {
                      icon: buildStatIconKey(preset, nextEmoji),
                    });
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-lg text-slate-900"
                  placeholder="ex.: 🌾 💧 ⚡ (substitui o ícone acima)"
                />
                <p className="text-[10px] text-slate-500">
                  Cole um emoji do teclado ou Win+. / Mac Ctrl+Cmd+Espaço. Deixa vazio para usar o ícone da lista.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <div className="block space-y-1">
                    <label htmlFor={`${formUid}-symbol-${index}`} className="block text-[11px] font-medium text-slate-600">
                      Símbolo ao lado do número
                    </label>
                    <select
                      id={`${formUid}-symbol-${index}`}
                      value={symbolSelectValue}
                      onChange={(e) =>
                        updateRow(index, {
                          symbol: selectValueToSymbol(e.target.value, row.symbol),
                        })
                      }
                      className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                    >
                      {STAT_INDICATOR_SYMBOL_OPTIONS.map((o) => (
                        <option
                          key={o.label}
                          value={o.value === '' ? SYMBOL_NONE_SELECT : o.value}
                        >
                          {o.label}
                        </option>
                      ))}
                      <option value={SYMBOL_CUSTOM_SELECT}>Outro (texto livre)…</option>
                    </select>
                  </div>
                  {symbolSelectValue === SYMBOL_CUSTOM_SELECT ? (
                    <input
                      type="text"
                      value={symbolForCustomInput(row.symbol)}
                      onChange={(e) =>
                        updateRow(index, { symbol: customInputToSymbol(e.target.value) })
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      maxLength={6}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                      placeholder="ex.: bn, t, /ano"
                    />
                  ) : null}
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
          );
        })}
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
