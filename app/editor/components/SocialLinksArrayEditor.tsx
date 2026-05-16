'use client';

import { useMemo } from 'react';
import {
  SOCIAL_NETWORK_PRESETS,
  parseSocialLinksJson,
  presetIdFromLabel,
  stringifySocialLinksJson,
  type SocialLinkItem,
} from '@/lib/social-links';
import { SocialLinkIcon } from '@/components/SocialLinkIcon';

function emptyLink(): SocialLinkItem {
  return { label: 'Instagram', href: '' };
}

export function SocialLinksArrayEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const rows = useMemo(() => parseSocialLinksJson(value), [value]);

  const commit = (next: SocialLinkItem[]) => {
    onChange(stringifySocialLinksJson(next));
  };

  const updateRow = (idx: number, patch: Partial<SocialLinkItem>) => {
    const base = rows.length ? [...rows] : [];
    while (base.length <= idx) base.push(emptyLink());
    base[idx] = { ...base[idx], ...patch };
    commit(base);
  };

  const setPreset = (idx: number, presetId: string) => {
    const preset = SOCIAL_NETWORK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const row = rows[idx] ?? emptyLink();
    updateRow(idx, {
      label: presetId === 'custom' ? row.label || 'Outra rede' : preset.label,
      href: row.href,
    });
  };

  const addRow = () => {
    commit([...rows, emptyLink()]);
  };

  const removeRow = (idx: number) => {
    commit(rows.filter((_, i) => i !== idx));
  };

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from < 0 || from >= rows.length) return;
    const c = [...rows];
    const [m] = c.splice(from, 1);
    c.splice(to, 0, m);
    commit(c);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-slate-600">
        Escolha a <strong>rede</strong> (define o ícone no site) e cole o <strong>link completo</strong> (https://…).
        Funciona no rodapé e na faixa de redes da página de contacto.
      </p>

      {rows.length === 0 ? (
        <button
          type="button"
          onClick={addRow}
          className="w-full rounded-lg border border-dashed border-slate-400 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          + Adicionar rede social
        </button>
      ) : null}

      {rows.map((row, idx) => {
        const presetId = presetIdFromLabel(row.label);
        return (
          <div key={`social-${idx}`} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/90 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#009179] text-[#009179]"
                  title="Pré-visualização do ícone"
                >
                  <SocialLinkIcon label={row.label} className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Rede {idx + 1}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveRow(idx, idx - 1)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={idx === rows.length - 1}
                  onClick={() => moveRow(idx, idx + 1)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600"
                >
                  Remover
                </button>
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-600">Rede / ícone</span>
              <select
                value={presetId}
                onChange={(e) => setPreset(idx, e.target.value)}
                className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
              >
                {SOCIAL_NETWORK_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {presetId === 'custom' ? (
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-600">Nome (para ícone aproximado)</span>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(idx, { label: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="ex.: Pinterest"
                  className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
                />
              </label>
            ) : null}

            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-600">Link (URL)</span>
              <input
                type="url"
                value={row.href}
                onChange={(e) => updateRow(idx, { href: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={SOCIAL_NETWORK_PRESETS.find((p) => p.id === presetId)?.hint ?? 'https://...'}
                className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900"
              />
            </label>
          </div>
        );
      })}

      {rows.length > 0 ? (
        <button
          type="button"
          onClick={addRow}
          className="w-full rounded-lg border border-dashed border-slate-400 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          + Adicionar rede social
        </button>
      ) : null}
    </div>
  );
}
