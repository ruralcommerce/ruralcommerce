'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MNS_COURSE, MNS_FICHAS, getFicha } from '@/lib/mns/content';
import type {
  MnsAnswers,
  MnsFieldDef,
  MnsFieldHelp,
  MnsFieldValue,
  MnsFichaId,
  MnsWorkRoute,
} from '@/lib/mns/types';
import { MnsAssistantPanel, MnsFab } from './MnsAssistant';
import './mns.css';

type Phase = 'gate' | 'welcome' | 'ficha' | 'done';

type LocalSession = {
  participantId: string;
  name: string;
  workRoute: MnsWorkRoute;
  productLabel: string;
  answers: MnsAnswers;
  currentFicha: MnsFichaId;
  fichaIndex: number;
  stepIndex: number;
  completedAt?: string | null;
};

function storageKey(code: string) {
  return `mns-mapa:${code.trim().toUpperCase()}`;
}

function loadLocal(code: string): LocalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) return null;
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

function saveLocal(code: string, data: LocalSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(data));
  } catch {
    // ignore
  }
}

function asString(v: MnsFieldValue | undefined): string {
  if (typeof v === 'string') return v;
  return '';
}

function asRecord(v: MnsFieldValue | undefined): Record<string, string> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, string>;
  return {};
}

export function MnsWorkshopApp({ locale, code }: { locale: string; code: string }) {
  const normalized = code.trim().toUpperCase();
  const [phase, setPhase] = useState<Phase>('gate');
  const [name, setName] = useState('');
  const [workRoute, setWorkRoute] = useState<MnsWorkRoute>('negocio');
  const [participantId, setParticipantId] = useState('');
  const [sessionTitle, setSessionTitle] = useState(MNS_COURSE.shortName);
  const [answers, setAnswers] = useState<MnsAnswers>({});
  const [fichaIndex, setFichaIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [helpField, setHelpField] = useState<{ title: string; help: MnsFieldHelp } | null>(null);
  const [assistOpen, setAssistOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booting, setBooting] = useState(true);

  const ficha = MNS_FICHAS[fichaIndex];
  const step = ficha?.steps[stepIndex];

  const progress = useMemo(() => {
    return MNS_FICHAS.map((f, i) => {
      if (phase === 'done') return 'done';
      if (i < fichaIndex) return 'done';
      if (i === fichaIndex && phase === 'ficha') return 'current';
      return 'todo';
    });
  }, [fichaIndex, phase]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const local = loadLocal(normalized);
      try {
        const res = await fetch(`/api/mns/session/${encodeURIComponent(normalized)}`);
        if (res.ok) {
          const data = (await res.json()) as { session: { title: string; status: string } };
          if (!cancelled) setSessionTitle(data.session.title || MNS_COURSE.shortName);
          if (data.session.status === 'closed' && !local) {
            if (!cancelled) {
              setError('Esta sala está cerrada.');
              setBooting(false);
            }
            return;
          }
        } else if (res.status === 404) {
          if (!cancelled) setError('Código no encontrado. Pide el código al facilitador.');
        }
      } catch {
        // offline-friendly: still allow local
      }

      if (local?.participantId) {
        if (!cancelled) {
          setParticipantId(local.participantId);
          setName(local.name);
          setWorkRoute(local.workRoute || 'negocio');
          setAnswers(local.answers || {});
          setFichaIndex(local.fichaIndex || 0);
          setStepIndex(local.stepIndex || 0);
          setPhase(local.completedAt ? 'done' : 'ficha');
        }
      }
      if (!cancelled) setBooting(false);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [normalized]);

  const persist = useCallback(
    async (next: Partial<LocalSession> & { sync?: boolean; complete?: boolean }) => {
      const snapshot: LocalSession = {
        participantId,
        name,
        workRoute,
        productLabel: asString(answers.ficha1?.producto) || '',
        answers,
        currentFicha: (MNS_FICHAS[fichaIndex]?.id || 'ficha1') as MnsFichaId,
        fichaIndex,
        stepIndex,
        completedAt: null,
        ...next,
      };
      saveLocal(normalized, snapshot);

      if (!participantId || next.sync === false) return;
      setSaving(true);
      try {
        await fetch(`/api/mns/session/${encodeURIComponent(normalized)}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: snapshot.participantId,
            answers: snapshot.answers,
            currentFicha: snapshot.currentFicha,
            workRoute: snapshot.workRoute,
            productLabel: snapshot.productLabel,
            complete: Boolean(next.complete),
          }),
        });
      } catch {
        // keep local
      } finally {
        setSaving(false);
      }
    },
    [answers, fichaIndex, name, normalized, participantId, stepIndex, workRoute]
  );

  async function join() {
    setError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Escribe tu nombre para continuar.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/mns/session/${encodeURIComponent(normalized)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, workRoute }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || 'No se pudo entrar a la sala.');
        setSaving(false);
        return;
      }
      const data = (await res.json()) as {
        participantId: string;
        name: string;
        answers?: MnsAnswers;
        currentFicha?: MnsFichaId;
        workRoute?: MnsWorkRoute;
        completedAt?: string | null;
      };
      setParticipantId(data.participantId);
      setName(data.name);
      setWorkRoute(data.workRoute || workRoute);
      const nextAnswers = data.answers || {};
      setAnswers(nextAnswers);
      const idx = Math.max(
        0,
        MNS_FICHAS.findIndex((f) => f.id === data.currentFicha)
      );
      setFichaIndex(idx < 0 ? 0 : idx);
      setStepIndex(0);
      const local: LocalSession = {
        participantId: data.participantId,
        name: data.name,
        workRoute: data.workRoute || workRoute,
        productLabel: '',
        answers: nextAnswers,
        currentFicha: data.currentFicha || 'ficha1',
        fichaIndex: idx < 0 ? 0 : idx,
        stepIndex: 0,
        completedAt: data.completedAt || null,
      };
      saveLocal(normalized, local);
      setPhase(data.completedAt ? 'done' : 'welcome');
    } catch {
      setError('Error de conexión. Reintenta.');
    } finally {
      setSaving(false);
    }
  }

  function getFieldValue(fieldId: string): MnsFieldValue | undefined {
    return answers[ficha.id]?.[fieldId];
  }

  function setFieldValue(fieldId: string, value: MnsFieldValue) {
    setAnswers((prev) => {
      const next: MnsAnswers = {
        ...prev,
        [ficha.id]: {
          ...(prev[ficha.id] || {}),
          [fieldId]: value,
        },
      };
      return next;
    });
  }

  useEffect(() => {
    if (phase !== 'ficha' || !participantId) return;
    const t = window.setTimeout(() => {
      void persist({ answers, fichaIndex, stepIndex });
    }, 600);
    return () => window.clearTimeout(t);
  }, [answers, fichaIndex, phase, participantId, persist, stepIndex]);

  function openFieldHelp(field: MnsFieldDef) {
    setHelpField({ title: field.label, help: field.help });
    setAssistOpen(true);
  }

  function openStepHelp() {
    if (!ficha || !step) return;
    setHelpField({
      title: `${ficha.title} · ${step.title}`,
      help: {
        paraQue: ficha.proposito,
        como: step.intro,
        ejemplo: ficha.consigna,
        alerta: ficha.tipRevision,
      },
    });
    setAssistOpen(true);
  }

  async function goNext() {
    if (!ficha) return;
    if (stepIndex < ficha.steps.length - 1) {
      setStepIndex((s) => s + 1);
      setAssistOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (fichaIndex < MNS_FICHAS.length - 1) {
      const nextIdx = fichaIndex + 1;
      setFichaIndex(nextIdx);
      setStepIndex(0);
      setAssistOpen(false);
      await persist({
        fichaIndex: nextIdx,
        stepIndex: 0,
        currentFicha: MNS_FICHAS[nextIdx].id,
        answers,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await persist({ complete: true, answers, fichaIndex, stepIndex });
    setPhase('done');
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
      return;
    }
    if (fichaIndex > 0) {
      const prev = fichaIndex - 1;
      const prevFicha = getFicha(MNS_FICHAS[prev].id)!;
      setFichaIndex(prev);
      setStepIndex(prevFicha.steps.length - 1);
      return;
    }
    setPhase('welcome');
  }

  if (booting) {
    return (
      <div className="mns-app">
        <header className="mns-header">
          <Link href={`/${locale}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-branco.png" alt="Rural Commerce" />
          </Link>
          <span className="mns-chip">Cargando…</span>
        </header>
      </div>
    );
  }

  return (
    <div className="mns-app">
      <header className="mns-header">
        <Link href={`/${locale}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-branco.png" alt="Rural Commerce" />
        </Link>
        <span className="mns-chip">
          {normalized}
          {saving ? ' · guardando' : ''}
        </span>
      </header>

      {phase === 'ficha' || phase === 'done' ? (
        <div className="mns-progress" aria-hidden>
          {progress.map((state, i) => (
            <div key={MNS_FICHAS[i].id} className={`mns-progress-dot is-${state}`}>
              <span />
            </div>
          ))}
        </div>
      ) : null}

      {phase === 'gate' ? (
        <div className="mns-welcome">
          <p className="mns-eyebrow">{MNS_COURSE.edition}</p>
          <h1>{MNS_COURSE.name}</h1>
          <p className="mns-lead">{sessionTitle}</p>
          <p className="mns-map-note">{MNS_COURSE.mapNote}</p>

          <div className="mns-card" style={{ marginTop: '1.25rem' }}>
            <label className="mns-label" htmlFor="mns-name">
              Tu nombre
            </label>
            <input
              id="mns-name"
              className="mns-input"
              style={{ marginTop: '0.4rem' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como quieres que te identifiquen"
              autoComplete="name"
            />

            <p className="mns-label" style={{ marginTop: '1rem' }}>
              Ruta de trabajo inicial
            </p>
            <div className="mns-choices" style={{ marginTop: '0.4rem' }}>
              {(
                [
                  ['negocio', 'Negocio propio'],
                  ['ficticio', 'Caso ficticio / Rosa'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`mns-choice ${workRoute === value || (value === 'ficticio' && workRoute === 'rosa') ? 'is-on' : ''}`}
                  onClick={() => setWorkRoute(value === 'ficticio' ? 'rosa' : 'negocio')}
                >
                  <span className="mns-choice-dot" />
                  {label}
                </button>
              ))}
            </div>

            {error ? (
              <p style={{ marginTop: '0.85rem', color: '#b42318', fontSize: '0.88rem' }}>{error}</p>
            ) : null}

            <button
              type="button"
              className="mns-btn mns-btn-primary"
              style={{ width: '100%', marginTop: '1.1rem' }}
              onClick={() => void join()}
              disabled={saving}
            >
              Entrar a mi mapa
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'welcome' ? (
        <div className="mns-welcome">
          <p className="mns-eyebrow">Hola, {name.split(' ')[0]}</p>
          <h1>Tu Mapa de Negocio</h1>
          <p className="mns-lead">
            Cuatro dinámicas en el celular. En cada campo toca <strong>?</strong> para ver para qué sirve, cómo
            completarlo y un ejemplo.
          </p>
          <div className="mns-ficha-list">
            {MNS_FICHAS.map((f) => (
              <div key={f.id} className="mns-ficha-item">
                <div className="mns-ficha-num">{f.number}</div>
                <div>
                  <strong>{f.title}</strong>
                  <small>
                    Día {f.day} · ~{f.durationMin} min · {f.subtitle.split('·')[0].trim()}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mns-btn mns-btn-primary"
            style={{ width: '100%', marginTop: '1.35rem' }}
            onClick={() => {
              setFichaIndex(0);
              setStepIndex(0);
              setPhase('ficha');
              const first = MNS_FICHAS[0];
              setHelpField({
                title: `${first.title} · ${first.steps[0].title}`,
                help: {
                  paraQue: first.proposito,
                  como: first.steps[0].intro,
                  ejemplo: first.consigna,
                  alerta: first.tipRevision,
                },
              });
              setAssistOpen(true);
            }}
          >
            Empezar Ficha 1
          </button>
        </div>
      ) : null}

      {phase === 'ficha' && ficha && step ? (
        <main className="mns-main">
          <div className="mns-card">
            <p className="mns-eyebrow">
              Ficha {ficha.number} de 4 · Paso {stepIndex + 1}/{ficha.steps.length}
            </p>
            <h1 className="mns-title">{step.title}</h1>
            <p className="mns-lead">{step.intro}</p>
            {stepIndex === 0 ? <div className="mns-consigna">{ficha.consigna}</div> : null}

            {step.fields.map((field) => (
              <FieldBlock
                key={field.id}
                field={field}
                value={getFieldValue(field.id)}
                onChange={(v) => setFieldValue(field.id, v)}
                onHelp={() => openFieldHelp(field)}
                helpActive={assistOpen && helpField?.title === field.label}
              />
            ))}
          </div>

          <div className="mns-nav">
            <div className="mns-nav-inner">
              <button type="button" className="mns-btn mns-btn-ghost" onClick={goBack}>
                Atrás
              </button>
              <button
                type="button"
                className="mns-btn mns-btn-primary"
                onClick={() => void goNext()}
                disabled={!stepContinueOk(step.fields, (id) => getFieldValue(id))}
              >
                {fichaIndex === MNS_FICHAS.length - 1 && stepIndex === ficha.steps.length - 1
                  ? 'Cerrar mapa'
                  : stepIndex === ficha.steps.length - 1
                    ? `Ir a Ficha ${ficha.number + 1}`
                    : 'Continuar'}
              </button>
            </div>
          </div>
        </main>
      ) : null}

      {phase === 'done' ? (
        <main className="mns-main">
          <div className="mns-card mns-done">
            <p className="mns-eyebrow">Mapa completo</p>
            <h2>Organizaste propuesta, verificación, precio y recorrido</h2>
            <p className="mns-lead">
              Lo importante es saber qué puedes demostrar y cuál es el siguiente paso. Una ficha completa no
              sustituye la validación técnica de una operación real.
            </p>
            <button
              type="button"
              className="mns-btn mns-btn-ghost"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setPhase('ficha');
                setFichaIndex(0);
                setStepIndex(0);
              }}
            >
              Revisar mis fichas
            </button>
          </div>
        </main>
      ) : null}

      {phase === 'ficha' ? (
        <>
          <MnsFab
            open={assistOpen}
            onClick={() => {
              if (helpField) setAssistOpen(true);
              else openStepHelp();
            }}
          />
          {assistOpen && helpField ? (
            <MnsAssistantPanel
              title={helpField.title}
              help={helpField.help}
              onClose={() => setAssistOpen(false)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function stepContinueOk(
  fields: MnsFieldDef[],
  getValue: (id: string) => MnsFieldValue | undefined
): boolean {
  return fields.every((field) => {
    if (!field.required) return true;
    const v = getValue(field.id);
    if (field.kind === 'cost-table' || field.kind === 'trace-links') return true;
    if (field.kind === 'presentation') {
      const rec = asRecord(v);
      return Boolean(rec.somos?.trim() && rec.ofrecemos?.trim());
    }
    return Boolean(asString(v).trim());
  });
}

function FieldBlock({
  field,
  value,
  onChange,
  onHelp,
  helpActive,
}: {
  field: MnsFieldDef;
  value: MnsFieldValue | undefined;
  onChange: (v: MnsFieldValue) => void;
  onHelp: () => void;
  helpActive: boolean;
}) {
  return (
    <div className="mns-field">
      <div className="mns-label-row">
        <label className="mns-label">{field.label}</label>
        <button
          type="button"
          className={`mns-help-btn ${helpActive ? 'is-active' : ''}`}
          onClick={onHelp}
          aria-label={`Ayuda: ${field.label}`}
        >
          ?
        </button>
      </div>

      {field.kind === 'text' ? (
        <input
          className="mns-input"
          value={asString(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {field.kind === 'textarea' ? (
        <textarea
          className="mns-textarea"
          rows={field.rows || 3}
          value={asString(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {field.kind === 'choice' ? (
        <div className="mns-choices">
          {(field.options || []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`mns-choice ${asString(value) === opt.value ? 'is-on' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="mns-choice-dot" />
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {field.kind === 'presentation' ? (
        <PresentationFields value={asRecord(value)} onChange={onChange} />
      ) : null}

      {field.kind === 'cost-table' ? (
        <CostTable field={field} value={asRecord(value)} onChange={onChange} />
      ) : null}

      {field.kind === 'trace-links' ? (
        <TraceLinks value={asString(value)} onChange={onChange} />
      ) : null}
    </div>
  );
}

function PresentationFields({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: MnsFieldValue) => void;
}) {
  function set(key: string, text: string) {
    onChange({ ...value, [key]: text });
  }
  const slots: { key: string; label: string }[] = [
    { key: 'somos', label: 'Somos' },
    { key: 'ofrecemos', label: 'Ofrecemos' },
    { key: 'para', label: 'para' },
    { key: 'diferenciamos', label: 'Nos diferenciamos por' },
    { key: 'evidencia', label: 'Podemos presentar como evidencia' },
    { key: 'confirmar', label: 'Necesitamos confirmar' },
  ];
  return (
    <div className="mns-grid-2" style={{ gridTemplateColumns: '1fr' }}>
      {slots.map((s) => (
        <div key={s.key}>
          <div style={{ fontSize: '0.75rem', color: 'var(--mns-muted)', marginBottom: 4 }}>{s.label}</div>
          <textarea
            className="mns-textarea"
            rows={2}
            value={value[s.key] || ''}
            onChange={(e) => set(s.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

function CostTable({
  field,
  value,
  onChange,
}: {
  field: MnsFieldDef;
  value: Record<string, string>;
  onChange: (v: MnsFieldValue) => void;
}) {
  const cols = field.columns || [];
  const rows = field.rowLabels || [];
  function cell(rowId: string, colId: string) {
    return value[`${rowId}__${colId}`] || '';
  }
  function setCell(rowId: string, colId: string, text: string) {
    onChange({ ...value, [`${rowId}__${colId}`]: text });
  }
  return (
    <div>
      {rows.map((row) => (
        <div key={row.id} className="mns-cost-row">
          <strong>{row.label}</strong>
          <div className="mns-grid-2">
            {cols.map((col) => (
              <div key={col.id}>
                <div style={{ fontSize: '0.7rem', color: 'var(--mns-muted)', marginBottom: 4 }}>{col.label}</div>
                <input
                  className="mns-input"
                  value={cell(row.id, col.id)}
                  onChange={(e) => setCell(row.id, col.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TraceLinks({ value, onChange }: { value: string; onChange: (v: MnsFieldValue) => void }) {
  return (
    <textarea
      className="mns-textarea"
      rows={5}
      placeholder={'Punto · Registro · Se conecta con · Responsable\nEj.: Lote · L-05 · RF-01 y EX-03 · Calidad'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
