'use client';

import type { MnsFieldDef, MnsFieldValue } from '@/lib/mns/types';

function asString(v: MnsFieldValue | undefined): string {
  if (typeof v === 'string') return v;
  return '';
}

function asRecord(v: MnsFieldValue | undefined): Record<string, string> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, string>;
  return {};
}

function asList(v: MnsFieldValue | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.split('|').filter(Boolean);
  return [];
}

const STATUS_OPTS = [
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'hipotesis', label: 'Hipótesis' },
  { value: 'pendiente', label: 'Pendiente' },
];

const INCOTERMS = [
  { value: 'FCA', label: 'FCA', hint: 'Entrega al transportista designado' },
  { value: 'FOB', label: 'FOB', hint: 'A bordo en origen' },
  { value: 'CIF', label: 'CIF', hint: 'Costo, seguro y flete' },
  { value: 'DAP', label: 'DAP', hint: 'Entregado en lugar acordado' },
  { value: 'otro', label: 'Otra / propuesta', hint: 'Aún no acordada' },
];

const TRACE_NODES = [
  { id: 'P-01/F-02', label: 'Proveedor / origen', detail: 'P-01 / F-02' },
  { id: 'RF-01', label: 'Recepción', detail: 'RF-01' },
  { id: 'L-05', label: 'Lote', detail: 'L-05' },
  { id: 'QC-05', label: 'Control', detail: 'QC-05' },
  { id: 'EX-03', label: 'Expedición', detail: 'EX-03' },
  { id: 'C-01', label: 'Comprador', detail: 'C-01' },
];

export function fieldPlayFilled(field: MnsFieldDef, value: MnsFieldValue | undefined): boolean {
  if (!field.required) return true;
  if (field.kind === 'chips' || field.kind === 'trace-builder') return asList(value).length > 0;
  if (field.kind === 'incoterm') {
    const rec = asRecord(value);
    return Boolean(rec.code?.trim());
  }
  if (field.kind === 'rosa-calc') {
    const rec = asRecord(value);
    return Boolean(rec.precioNecesario?.trim() || rec.resultado10?.trim());
  }
  if (field.kind === 'tagged-text') {
    const rec = asRecord(value);
    return Boolean(rec.text?.trim() && rec.status?.trim());
  }
  if (field.kind === 'cost-table') {
    return Object.values(asRecord(value)).some((x) => Boolean(x.trim()));
  }
  if (field.kind === 'trace-links') return Boolean(asString(value).trim());
  if (field.kind === 'presentation') {
    const rec = asRecord(value);
    return Boolean(rec.somos?.trim() && rec.ofrecemos?.trim());
  }
  return Boolean(asString(value).trim());
}

export function MnsFieldPlay({
  field,
  value,
  onChange,
}: {
  field: MnsFieldDef;
  value: MnsFieldValue | undefined;
  onChange: (v: MnsFieldValue) => void;
}) {
  if (field.kind === 'choice') {
    return (
      <div className="grid gap-3">
        {(field.options || []).map((opt) => {
          const on = asString(value) === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-[16px] border px-4 py-4 text-left text-[15px] font-semibold shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)] transition ${
                on
                  ? 'border-[#52ADAD] bg-[#52ADAD]/15 text-[#071F5E] ring-2 ring-[#52ADAD]'
                  : 'border-transparent bg-white text-[#071F5E]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.kind === 'chips') {
    const selected = asList(value);
    const multi = field.options && field.options.length > 3;
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {(field.options || []).map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                if (!multi) {
                  onChange(on ? [] : [opt.value]);
                  return;
                }
                onChange(on ? selected.filter((x) => x !== opt.value) : [...selected, opt.value]);
              }}
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                on ? 'bg-[#071F5E] text-white' : 'bg-white text-[#071F5E] shadow-[-4px_4px_12px_-4px_rgba(0,0,0,0.12)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.kind === 'tagged-text') {
    const rec = asRecord(value);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {STATUS_OPTS.map((opt) => {
            const on = rec.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...rec, status: opt.value })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  on ? 'bg-[#52ADAD] text-white' : 'bg-white text-[#071F5E] shadow-sm'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <textarea
          className="w-full min-h-[140px] rounded-[16px] border border-[#8D99AE]/40 bg-white px-4 py-4 text-[15px] leading-6 text-[#071F5E] shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)] outline-none focus:border-[#52ADAD]"
          value={rec.text || ''}
          placeholder={field.placeholder || 'Escribe tu respuesta…'}
          onChange={(e) => onChange({ ...rec, text: e.target.value })}
        />
      </div>
    );
  }

  if (field.kind === 'incoterm') {
    const rec = asRecord(value);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INCOTERMS.map((opt) => {
            const on = rec.code === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...rec, code: opt.value })}
                className={`rounded-[16px] bg-white p-4 text-left shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.1)] ring-2 transition ${
                  on ? 'ring-[#52ADAD]' : 'ring-transparent'
                }`}
              >
                <div className="text-lg font-bold text-[#071F5E]">{opt.label}</div>
                <div className="mt-1 text-xs leading-4 text-[#071F5E]/55">{opt.hint}</div>
              </button>
            );
          })}
        </div>
        <input
          className="w-full min-h-[56px] rounded-[14px] border border-[#8D99AE]/40 bg-white px-4 text-sm outline-none focus:border-[#52ADAD]"
          placeholder="Lugar (acordado o propuesto)"
          value={rec.lugar || ''}
          onChange={(e) => onChange({ ...rec, lugar: e.target.value })}
        />
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTS.map((opt) => {
            const on = rec.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...rec, status: opt.value })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  on ? 'bg-[#071F5E] text-white' : 'bg-white text-[#071F5E]/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.kind === 'rosa-calc') {
    return <RosaCalc value={asRecord(value)} onChange={onChange} />;
  }

  if (field.kind === 'trace-builder') {
    return <TraceBuilder value={asList(value)} onChange={onChange} />;
  }

  if (field.kind === 'presentation') {
    const rec = asRecord(value);
    const slots: { key: string; label: string }[] = [
      { key: 'somos', label: 'Somos' },
      { key: 'ofrecemos', label: 'Ofrecemos' },
      { key: 'para', label: 'para' },
      { key: 'diferenciamos', label: 'Nos diferenciamos por' },
      { key: 'evidencia', label: 'Podemos presentar como evidencia' },
      { key: 'confirmar', label: 'Necesitamos confirmar' },
    ];
    return (
      <div className="space-y-3">
        {slots.map((s) => (
          <div key={s.key} className="rounded-[16px] bg-white p-4 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#009179]">{s.label}</p>
            <textarea
              className="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[15px] text-[#071F5E] outline-none placeholder:text-[#72777A]/45"
              rows={2}
              value={rec[s.key] || ''}
              onChange={(e) => onChange({ ...rec, [s.key]: e.target.value })}
              placeholder="Escribe aquí…"
            />
          </div>
        ))}
      </div>
    );
  }

  if (field.kind === 'cost-table') {
    const rec = asRecord(value);
    const cols = field.columns || [];
    const rows = field.rowLabels || [];
    const who = ['Vendedor', 'Comprador', 'Compartido', 'Pendiente'];
    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-[16px] bg-white p-4 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-bold text-[#071F5E]">{row.label}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {cols.map((col) => {
                const key = `${row.id}__${col.id}`;
                if (col.id === 'asume') {
                  return (
                    <div key={col.id}>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#071F5E]/50">
                        {col.label}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {who.map((w) => {
                          const on = rec[key] === w;
                          return (
                            <button
                              key={w}
                              type="button"
                              onClick={() => onChange({ ...rec, [key]: w })}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                on ? 'bg-[#52ADAD] text-white' : 'bg-[#FBFAF8] text-[#071F5E]/70'
                              }`}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <label key={col.id} className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#071F5E]/50">
                      {col.label}
                    </span>
                    <input
                      className="mt-1 w-full rounded-[10px] border border-[#8D99AE]/40 bg-[#FBFAF8] px-3 py-2 text-sm outline-none focus:border-[#52ADAD]"
                      value={rec[key] || ''}
                      onChange={(e) => onChange({ ...rec, [key]: e.target.value })}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (field.kind === 'text') {
    return (
      <input
        className="w-full min-h-[66px] rounded-[16px] border border-[#8D99AE]/40 bg-white px-4 text-center text-[15px] text-[#071F5E] shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)] outline-none focus:border-[#52ADAD]"
        value={asString(value)}
        placeholder={field.placeholder || 'Escribe aquí…'}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {field.kind === 'textarea' ? (
        <div className="flex flex-wrap justify-center gap-2">
          {['Usar ejemplo de Rosa', 'Marcar pendiente', 'Es hipótesis'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                if (chip.startsWith('Usar')) onChange(field.help.ejemplo);
                else if (chip.includes('pendiente')) onChange(`${asString(value)} [pendiente]`.trim());
                else onChange(`${asString(value)} [hipótesis]`.trim());
              }}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#071F5E] shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        className="w-full min-h-[160px] rounded-[16px] border border-[#8D99AE]/40 bg-white px-4 py-4 text-[15px] leading-6 text-[#071F5E] shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)] outline-none focus:border-[#52ADAD]"
        rows={field.rows || 4}
        value={asString(value)}
        placeholder={field.placeholder || 'Escribe aquí… Si no lo sabes, marca pendiente.'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function RosaCalc({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: MnsFieldValue) => void;
}) {
  const variables = 1800;
  const fijos = 800;
  const adicional = 600;
  const qty = 300;
  const desired = 400;
  const localPrice = 10;
  const costoOriginal = variables + fijos;
  const costoIntl = costoOriginal + adicional;
  const ingresoNec = costoIntl + desired;
  const precioNec = ingresoNec / qty;
  const resultado10 = qty * localPrice - costoIntl;

  function reveal(key: string, val: string) {
    onChange({ ...value, [key]: val });
  }

  const steps = [
    {
      key: 'costoOriginal',
      title: '1. ¿Cuánto cuesta producir aquí?',
      formula: 'Variables 1.800 + fijos 800',
      result: String(costoOriginal),
      unit: 'u. m.',
    },
    {
      key: 'costoIntl',
      title: '2. ¿Cuánto cuesta si exportás?',
      formula: `${costoOriginal} + adicional 600`,
      result: String(costoIntl),
      unit: 'u. m.',
    },
    {
      key: 'ingresoNec',
      title: '3. ¿Qué ingreso necesitás para no perder y dejar margen?',
      formula: `${costoIntl} + margen 400`,
      result: String(ingresoNec),
      unit: 'u. m.',
    },
    {
      key: 'precioNecesario',
      title: '4. ¿Qué precio por frasco sale?',
      formula: `${ingresoNec} ÷ ${qty} frascos`,
      result: String(precioNec),
      unit: 'u. m.',
    },
    {
      key: 'resultado10',
      title: '5. ¿Y si dejás el precio local (10)?',
      formula: `${qty} × 10 − ${costoIntl}`,
      result: String(resultado10),
      unit: 'u. m.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-[16px] bg-[#071F5E] p-4 text-white">
        <p className="text-[11px] font-light uppercase tracking-[0.14em] text-white/70">Práctica · ajustar el precio</p>
        <p className="mt-2 text-sm leading-5 text-white/90">
          Exportar suma costos. El precio local no se copia: se recalcula para cubrir el total y dejar margen.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <Stat label="Frascos" value="300" />
          <Stat label="Producir" value="2.600" />
          <Stat label="Exportar +" value="600" />
          <Stat label="Costo total" value="3.200" />
          <Stat label="Precio local" value="10" />
          <Stat label="Margen meta" value="400" />
        </div>
      </div>

      {steps.map((s) => {
        const open = Boolean(value[s.key]);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => reveal(s.key, `${s.result} ${s.unit}`)}
            className={`w-full rounded-[16px] p-4 text-left shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.1)] transition ${
              open ? 'bg-[#52ADAD]/15 ring-2 ring-[#52ADAD]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#071F5E]">{s.title}</p>
                <p className="mt-1 text-xs text-[#071F5E]/55">{s.formula}</p>
              </div>
              <div className="text-right">
                {open ? (
                  <p className="text-lg font-bold text-[#009179]">
                    {s.result} <span className="text-xs font-semibold">{s.unit}</span>
                  </p>
                ) : (
                  <span className="rounded-full bg-[#071F5E] px-3 py-1 text-xs font-bold text-white">Revelar</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
      <p className="text-center text-xs text-[#071F5E]/55">
        Unidades de práctica (u. m.), no dólares. Toca cada paso.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-white/10 px-2 py-2">
      <div className="text-[10px] uppercase tracking-[0.1em] text-white/60">{label}</div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}

function TraceBuilder({ value, onChange }: { value: string[]; onChange: (v: MnsFieldValue) => void }) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  }

  function move(id: string, dir: -1 | 1) {
    const i = value.indexOf(id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-[#071F5E]/65">Toca para armar el recorrido. Luego ordena con las flechas.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TRACE_NODES.map((node) => {
          const on = value.includes(node.id);
          const order = value.indexOf(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => toggle(node.id)}
              className={`relative rounded-[16px] p-4 text-left shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.1)] ring-2 transition ${
                on ? 'bg-[#071F5E] text-white ring-[#52ADAD]' : 'bg-white text-[#071F5E] ring-transparent'
              }`}
            >
              {on ? (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#52ADAD] text-xs font-bold">
                  {order + 1}
                </span>
              ) : null}
              <div className="text-sm font-bold">{node.label}</div>
              <div className={`mt-1 text-xs ${on ? 'text-white/70' : 'text-[#071F5E]/50'}`}>{node.detail}</div>
            </button>
          );
        })}
      </div>

      {value.length > 0 ? (
        <div className="rounded-[16px] bg-white p-4 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#009179]">Tu cadena</p>
          <div className="mt-3 space-y-2">
            {value.map((id, idx) => (
              <div key={id} className="flex items-center gap-2 rounded-[12px] bg-[#FBFAF8] px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071F5E] text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-semibold text-[#071F5E]">{id}</span>
                <button type="button" className="px-2 text-sm font-bold text-[#071F5E]/50" onClick={() => move(id, -1)}>
                  ↑
                </button>
                <button type="button" className="px-2 text-sm font-bold text-[#071F5E]/50" onClick={() => move(id, 1)}>
                  ↓
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#071F5E]/55">
            Hacia adelante sugerido: P-01/F-02 → RF-01 → L-05 → EX-03 → C-01 · control L-05 → QC-05
          </p>
        </div>
      ) : null}
    </div>
  );
}
