'use client';

/**
 * Cor hex com picker nativo, campo texto e amostras rápidas (UX tipo Elementor).
 */

const SWATCHES = ['#009179', '#071F5E', '#ffffff', '#0f172a', '#64748b', '#8b5cf6', '#f59e0b', '#e11d48'];

function parseHex6(v: string): string | null {
  const t = v.trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(t)) return t.toLowerCase();
  const m3 = t.match(/^#([0-9A-Fa-f]{3})$/);
  if (m3?.[1] && m3[1].length === 3) {
    const x = m3[1];
    return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`.toLowerCase();
  }
  return null;
}

export function EditorColorField({
  value,
  onChange,
  allowClear,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Quando true, mostra botão para voltar a vazio (ex.: cores de hover opcionais). */
  allowClear?: boolean;
}) {
  const normalized = parseHex6(value);
  const pickerValue = normalized ?? '#1e293b';

  return (
    <div className="space-y-2 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 shadow-inner"
          title="Escolher no espectro"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rrggbb"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200/70"
        />
        {allowClear && value.trim() !== '' ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Limpar
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onChange(hex)}
            className={`h-7 w-7 rounded-md border shadow-sm transition hover:scale-105 hover:ring-2 hover:ring-violet-300/80 ${
              hex.toLowerCase() === '#ffffff' ? 'border-slate-300' : 'border-white/20'
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  );
}
