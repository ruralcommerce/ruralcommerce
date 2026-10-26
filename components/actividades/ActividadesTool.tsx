'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { IntranetGate } from '@/components/intranet/IntranetGate';
import { emptyEnrollmentForm, type EnrollmentFormState } from '@/lib/actividades/profile';
import type {
  Activity,
  ActivityKind,
  ActivityParticipant,
  ImpulsaPerson,
  ParticipantState,
} from '@/lib/actividades/types';
import { getProjectSexLabel } from '@/lib/project-sex';
import { normalizePhone } from '@/lib/project-phone';
import { captureGeo, readDeviceId } from './geo-client';
import { RoomQr } from './RoomQr';

const fieldClass =
  'min-h-10 w-full rounded-lg border border-[#071F5E]/15 px-3 text-sm text-[#071F5E] outline-none focus:border-[#009179]';

const KIND_LABEL: Record<ActivityKind, string> = {
  capacitacion: 'Capacitación',
  visita: 'Visita de campo',
};

const STATE_LABEL: Record<ParticipantState, string> = {
  invitado: 'Invitado',
  inscrito: 'Inscrito',
  presente: 'Presente',
  ausente: 'Ausente',
};

function formatWhen(iso: string) {
  if (!iso) return 'Sin fecha';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
}

function origin() {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

async function readJson(res: Response) {
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; activity?: Activity };
  if (!res.ok || data.ok === false) throw new Error(data.message || 'No se pudo completar');
  return data;
}

export function ActividadesTool({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Actividades de campo"
      breadcrumb="Páginas / Herramientas / Actividades"
      permission="tools.actividades"
    >
      {() => <ActividadesBody locale={locale} />}
    </IntranetGate>
  );
}

function ActividadesBody({ locale }: { locale: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mode, setMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'todas' | ActivityKind | 'abiertas'>('todas');
  const [query, setQuery] = useState('');

  const selected = activities.find((item) => item.id === selectedId) || null;

  function upsert(activity: Activity) {
    setActivities((current) => {
      const exists = current.some((item) => item.id === activity.id);
      const next = exists ? current.map((item) => (item.id === activity.id ? activity : item)) : [activity, ...current];
      return next.sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1));
    });
    setSelectedId(activity.id);
    setMode('detail');
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/intranet/actividades', { cache: 'no-store' });
        const data = await readJson(res);
        if (cancelled) return;
        setActivities((data as { activities?: Activity[] }).activities || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities.filter((item) => {
      if (filter === 'abiertas' && item.status !== 'abierta') return false;
      if (filter === 'capacitacion' && item.kind !== 'capacitacion') return false;
      if (filter === 'visita' && item.kind !== 'visita') return false;
      if (!q) return true;
      return `${item.title} ${item.projectLabel} ${item.place}`.toLowerCase().includes(q);
    });
  }, [activities, filter, query]);

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

      {mode === 'create' ? (
        <CreateForm
          onCancel={() => setMode('list')}
          onCreated={(activity) => {
            setError('');
            upsert(activity);
          }}
          onError={setError}
        />
      ) : null}

      {mode === 'detail' && selected ? (
        <ActivityDetail
          key={selected.id}
          locale={locale}
          activity={selected}
          onBack={() => setMode('list')}
          onChange={upsert}
          onDeleted={() => {
            setActivities((current) => current.filter((item) => item.id !== selected.id));
            setSelectedId(null);
            setMode('list');
          }}
          onError={setError}
        />
      ) : null}

      {mode === 'list' ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#071F5E]">Capacitaciones y visitas</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#1E1E1E]/70">
                Un QR en la sala. Cada persona entra con su cuenta Impulsa CR y valida. Sin enviar enlaces uno por uno.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void downloadCsv()} className="rounded-xl border border-[#071F5E]/15 px-3 py-2 text-sm font-semibold text-[#071F5E]">
                Exportar
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('create');
                }}
                className="rounded-xl bg-[#009179] px-3 py-2 text-sm font-semibold text-white"
              >
                Nueva actividad
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ['todas', 'Todas'],
                ['capacitacion', 'Capacitaciones'],
                ['visita', 'Visitas'],
                ['abiertas', 'Abiertas'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filter === id ? 'bg-[#071F5E] text-white' : 'bg-[#F4F7FA] text-[#071F5E]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className={`${fieldClass} mt-3`}
            placeholder="Buscar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {loading ? <p className="mt-4 text-sm text-[#071F5E]/60">Cargando…</p> : null}
          {!loading && visible.length === 0 ? <p className="mt-4 text-sm text-[#071F5E]/60">Sin actividades.</p> : null}
          <ul className="mt-3 divide-y divide-[#071F5E]/8">
            {visible.map((item) => {
              const presentes = item.participants.filter((person) => person.state === 'presente').length;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setMode('detail');
                      setError('');
                    }}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#F4F7FA]/80"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.kind === 'visita' ? 'navy' : 'green'}>{KIND_LABEL[item.kind]}</Badge>
                        <Badge tone={item.status === 'abierta' ? 'green' : 'slate'}>
                          {item.status === 'abierta' ? 'Abierta' : 'Cerrada'}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate font-semibold text-[#071F5E]">{item.title}</p>
                      <p className="truncate text-xs text-[#1E1E1E]/55">
                        {[item.place, formatWhen(item.startsAt)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-[#009179]">
                      {presentes}/{item.participants.length}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CreateForm({
  onCancel,
  onCreated,
  onError,
}: {
  onCancel: () => void;
  onCreated: (activity: Activity) => void;
  onError: (message: string) => void;
}) {
  const [kind, setKind] = useState<ActivityKind>('capacitacion');
  const [title, setTitle] = useState('');
  const [projectLabel, setProjectLabel] = useState('');
  const [place, setPlace] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const geo = await captureGeo(8000);
      const res = await fetch('/api/intranet/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title,
          projectLabel,
          place,
          startsAt: startsAt ? new Date(startsAt).toISOString() : '',
          geo,
          deviceId: readDeviceId(),
        }),
      });
      const data = await readJson(res);
      if (!data.activity) throw new Error('No se pudo crear');
      onCreated(data.activity);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo crear');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#071F5E]">Nueva actividad</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {(['capacitacion', 'visita'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
              kind === option ? 'border-[#009179] bg-[#E7F6EC] text-[#1D6359]' : 'border-[#071F5E]/15 text-[#071F5E]'
            }`}
          >
            {KIND_LABEL[option]}
          </button>
        ))}
      </div>
      <input className={fieldClass} placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className={fieldClass} placeholder="Proyecto o contexto" value={projectLabel} onChange={(e) => setProjectLabel(e.target.value)} />
      <input className={fieldClass} placeholder="Lugar" value={place} onChange={(e) => setPlace(e.target.value)} />
      <input className={fieldClass} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="rounded-xl bg-[#009179] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? 'Abriendo…' : 'Abrir actividad'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#071F5E]/15 px-4 py-2.5 text-sm font-semibold text-[#071F5E]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ActivityDetail({
  locale,
  activity,
  onBack,
  onChange,
  onDeleted,
  onError,
}: {
  locale: string;
  activity: Activity;
  onBack: () => void;
  onChange: (activity: Activity) => void;
  onDeleted: () => void;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState({
    notes: activity.notes,
    photoLinks: activity.photoLinks.join('\n'),
    place: activity.place,
  });
  const [manual, setManual] = useState<EnrollmentFormState>(emptyEnrollmentForm());
  const [people, setPeople] = useState<ImpulsaPerson[] | null>(null);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [anularId, setAnularId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'todas' | 'pendientes' | 'presentes'>('todas');
  const [rosterQuery, setRosterQuery] = useState('');
  const [openRow, setOpenRow] = useState<string | null>(null);

  const salaUrl = `${origin()}/${locale}/actividad/${activity.inviteCode}/sala`;
  const inviteUrl = `${origin()}/${locale}/actividad/${activity.inviteCode}`;
  const presentes = activity.participants.filter((p) => p.state === 'presente').length;
  const pendientes = activity.participants.filter((p) => p.state === 'inscrito' || p.state === 'invitado').length;
  const warnings = {
    sameDevice: activity.participants.some((person) => person.state === 'presente' && person.sameDevice),
    lejos: activity.participants.filter((person) => person.geoStatus === 'lejos').length,
  };
  const rosterIds = new Set(activity.participants.map((person) => person.inscriptionId).filter(Boolean));
  const filteredPeople = (people || []).filter((person) => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return true;
    return `${person.name} ${person.organization} ${person.phone}`.toLowerCase().includes(q);
  });
  const roster = activity.participants.filter((person) => {
    if (rosterFilter === 'presentes' && person.state !== 'presente') return false;
    if (rosterFilter === 'pendientes' && person.state !== 'inscrito' && person.state !== 'invitado') return false;
    const q = rosterQuery.trim().toLowerCase();
    if (!q) return true;
    return `${person.name} ${person.phone} ${person.organization} ${person.locality}`.toLowerCase().includes(q);
  });

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch(`/api/intranet/actividades/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (!data.activity) throw new Error('Sin respuesta');
      onChange(data.activity);
      setNotice('Guardado');
      return data.activity;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo guardar');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function loadPeople() {
    setBusy(true);
    try {
      const res = await fetch('/api/intranet/actividades/impulsa', { cache: 'no-store' });
      const data = (await readJson(res)) as { people?: ImpulsaPerson[] };
      setPeople(data.people || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo leer Impulsa CR');
    } finally {
      setBusy(false);
    }
  }

  async function saveSessionGeo() {
    setBusy(true);
    try {
      const geo = await captureGeo();
      if (!geo) {
        onError('Este celular no entregó la ubicación.');
        return;
      }
      const res = await fetch(`/api/intranet/actividades/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session-geo', geo, deviceId: readDeviceId() }),
      });
      const data = await readJson(res);
      if (data.activity) onChange(data.activity);
      setNotice('Ubicación de la sesión guardada');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo guardar la ubicación');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('¿Borrar esta actividad?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/intranet/actividades/${activity.id}`, { method: 'DELETE' });
      await readJson(res);
      onDeleted();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo borrar');
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice('Copiado');
    } catch {
      setNotice('Selecciona y copia el texto');
    }
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <button type="button" onClick={onBack} className="text-xs font-semibold uppercase tracking-wide text-[#009179]">
          ← Lista
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone={activity.kind === 'visita' ? 'navy' : 'green'}>{KIND_LABEL[activity.kind]}</Badge>
          <Badge tone={activity.status === 'abierta' ? 'green' : 'slate'}>
            {activity.status === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
          <span className="text-xs font-semibold text-[#009179]">
            {presentes} presentes · {pendientes} pendientes · {activity.participants.length} en lista
          </span>
        </div>
        <h2 className="mt-2 text-xl font-bold text-[#071F5E] sm:text-2xl">{activity.title}</h2>
        <p className="mt-1 text-sm text-[#1E1E1E]/65">
          {[activity.projectLabel, activity.place, formatWhen(activity.startsAt)].filter(Boolean).join(' · ')}
        </p>
        {warnings.sameDevice ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">Hay validaciones del mismo celular.</p>
        ) : null}
        {warnings.lejos > 0 ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">{warnings.lejos} lejos del punto de la sesión.</p>
        ) : null}
        {notice ? <p className="mt-2 text-sm text-[#009179]">{notice}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy || activity.status === 'cerrada'} onClick={() => void saveSessionGeo()} className="rounded-lg border border-[#071F5E]/15 px-3 py-2 text-xs font-semibold text-[#071F5E] disabled:opacity-50">
            Guardar mi GPS
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch({ action: 'status', status: activity.status === 'abierta' ? 'cerrada' : 'abierta' })}
            className="rounded-lg bg-[#071F5E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {activity.status === 'abierta' ? 'Cerrar' : 'Reabrir'}
          </button>
          <button type="button" onClick={() => void downloadCsv(activity.id)} className="rounded-lg border border-[#071F5E]/15 px-3 py-2 text-xs font-semibold text-[#071F5E]">
            Exportar
          </button>
          <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">
            Borrar
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#071F5E] p-4 text-white shadow-sm sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#52ADAD]">Validación en la sala</p>
        <h3 className="mt-1 text-lg font-bold">QR de esta actividad</h3>
        <p className="mt-1 max-w-xl text-sm leading-6 text-white/80">
          Muéstralo en la pantalla o imprímelo. La persona escanea, entra con su correo y contraseña de Impulsa CR, y
          confirma. No hay que mandar un WhatsApp por persona.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="rounded-2xl bg-white p-3">
            {activity.status === 'abierta' ? <RoomQr url={salaUrl} size={220} /> : <p className="p-8 text-center text-sm text-[#071F5E]">Cerrada</p>}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Enlace corto</p>
            <input className="min-h-10 w-full rounded-lg border-0 bg-white/10 px-3 text-sm text-white" readOnly value={salaUrl} onFocus={(e) => e.currentTarget.select()} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copy(salaUrl)} className="rounded-lg bg-[#009179] px-3 py-2 text-xs font-semibold text-white">
                Copiar enlace del QR
              </button>
              <a href={salaUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                Abrir pantalla de validación
              </a>
            </div>
          </div>
        </div>
      </div>

      <Panel title="Inscripción previa (opcional)" defaultOpen={false} hint="Formulario para quien aún no está en Impulsa CR">
        {activity.kind === 'capacitacion' ? (
          <div className="space-y-2">
            <p className="text-sm leading-6 text-[#1E1E1E]/70">
              Comparte este formulario antes del evento. Quien se inscribe queda en la lista; el día valida con el QR y
              su cuenta, o pide al equipo agregarlo desde Impulsa.
            </p>
            <input className={fieldClass} readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copy(inviteUrl)} className="rounded-lg bg-[#009179] px-3 py-2 text-xs font-semibold text-white">
                Copiar formulario
              </button>
              <a href={inviteUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#071F5E]/15 px-3 py-2 text-xs font-semibold text-[#071F5E]">
                Abrir
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#1E1E1E]/70">Las visitas no usan inscripción abierta. Agrega a la persona y que valide con el QR.</p>
        )}
      </Panel>

      <Panel title="Agregar desde Impulsa CR" defaultOpen={activity.participants.length === 0} hint="Opcional: precargar lista antes de la sala">
        {people == null ? (
          <button type="button" disabled={busy} onClick={() => void loadPeople()} className="rounded-lg border border-[#071F5E]/15 px-3 py-2 text-xs font-semibold text-[#071F5E]">
            Cargar personas
          </button>
        ) : (
          <div className="space-y-2">
            <input className={fieldClass} placeholder="Filtrar" value={peopleQuery} onChange={(e) => setPeopleQuery(e.target.value)} />
            <ul className="max-h-40 space-y-1 overflow-auto rounded-lg border border-[#071F5E]/10 p-2">
              {filteredPeople.slice(0, 50).map((person) => {
                const added = rosterIds.has(person.id);
                return (
                  <li key={person.id}>
                    <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F4F7FA]">
                      <input
                        type="checkbox"
                        disabled={added}
                        checked={added || picked.includes(person.id)}
                        onChange={(event) => {
                          setPicked((current) =>
                            event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id)
                          );
                        }}
                      />
                      <span className="min-w-0 truncate">
                        <span className="font-semibold text-[#071F5E]">{person.name}</span>
                        <span className="text-[#1E1E1E]/50">{added ? ' · ya' : ''}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              disabled={busy || picked.length === 0 || activity.status === 'cerrada'}
              onClick={() =>
                void patch({ action: 'impulsa', inscriptionIds: picked }).then((saved) => {
                  if (saved) setPicked([]);
                })
              }
              className="rounded-lg bg-[#071F5E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Agregar seleccionados ({picked.length})
            </button>
          </div>
        )}
      </Panel>

      <Panel title="Agregar a mano" defaultOpen={false}>
        <form
          className="grid gap-2 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void patch({ action: 'manual', person: manual }).then((saved) => {
              if (saved) setManual(emptyEnrollmentForm());
            });
          }}
        >
          <input className={fieldClass} placeholder="Nombre *" value={manual.name} onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))} required />
          <input className={fieldClass} placeholder="Teléfono" value={manual.phone} onChange={(e) => setManual((m) => ({ ...m, phone: e.target.value }))} />
          <input className={fieldClass} placeholder="Documento" value={manual.documentId} onChange={(e) => setManual((m) => ({ ...m, documentId: e.target.value }))} />
          <input className={fieldClass} placeholder="Localidad" value={manual.locality} onChange={(e) => setManual((m) => ({ ...m, locality: e.target.value }))} />
          <select className={fieldClass} value={manual.sex} onChange={(e) => setManual((m) => ({ ...m, sex: e.target.value as EnrollmentFormState['sex'] }))}>
            <option value="">Sexo</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
            <option value="collective">Colectivo</option>
          </select>
          <input className={fieldClass} placeholder="Edad" value={manual.age} onChange={(e) => setManual((m) => ({ ...m, age: e.target.value }))} />
          <input className={fieldClass} placeholder="Empresa" value={manual.companyName} onChange={(e) => setManual((m) => ({ ...m, companyName: e.target.value }))} />
          <input className={fieldClass} placeholder="Organización" value={manual.organization} onChange={(e) => setManual((m) => ({ ...m, organization: e.target.value }))} />
          <button type="submit" disabled={busy || activity.status === 'cerrada'} className="rounded-lg bg-[#009179] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2 sm:w-fit">
            Agregar
          </button>
        </form>
      </Panel>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-bold text-[#071F5E]">Lista ({roster.length})</h3>
            <p className="text-xs text-[#1E1E1E]/55">Compacta. Toca una fila solo si necesitas marcar ausente o anular.</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['todas', 'Todas'],
                ['pendientes', 'Pendientes'],
                ['presentes', 'Presentes'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRosterFilter(id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  rosterFilter === id ? 'bg-[#071F5E] text-white' : 'bg-[#F4F7FA] text-[#071F5E]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <input className={`${fieldClass} mt-3`} placeholder="Buscar en la lista" value={rosterQuery} onChange={(e) => setRosterQuery(e.target.value)} />
        {roster.length === 0 ? <p className="mt-3 text-sm text-[#1E1E1E]/55">Nadie en este filtro.</p> : null}
        <ul className="mt-2 divide-y divide-[#071F5E]/8">
          {roster.map((person) => {
            const open = openRow === person.id;
            const sexLabel = getProjectSexLabel(person.sex, 'es');
            return (
              <li key={person.id} className="py-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => setOpenRow(open ? null : person.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#071F5E]">{person.name}</span>
                      <Badge tone={person.state === 'presente' ? 'green' : person.state === 'ausente' ? 'red' : 'slate'}>
                        {STATE_LABEL[person.state]}
                      </Badge>
                      {person.sameDevice && person.state === 'presente' ? <Badge tone="amber">Mismo celular</Badge> : null}
                      {person.geoStatus === 'lejos' ? <Badge tone="amber">Lejos</Badge> : null}
                    </div>
                    <p className="truncate text-xs text-[#1E1E1E]/55">
                      {[sexLabel, person.age != null ? `${person.age} a` : '', person.locality, person.phone].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#071F5E]/40 transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? (
                  <div className="mt-2 space-y-2 rounded-xl bg-[#F4F7FA] p-3">
                    <p className="text-xs text-[#1E1E1E]/60">
                      {[
                        person.documentId ? `Doc. ${person.documentId}` : '',
                        person.companyName,
                        person.organization,
                        person.source === 'impulsa' ? 'Impulsa CR' : person.source === 'convite' ? 'Convite' : 'Manual',
                        person.confirmedAt ? formatWhen(person.confirmedAt) : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {person.state !== 'presente' && person.state !== 'ausente' ? (
                        <button type="button" disabled={busy || activity.status === 'cerrada'} onClick={() => void patch({ action: 'mark', participantId: person.id, mark: 'ausente' })} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#071F5E] disabled:opacity-40">
                          Ausente
                        </button>
                      ) : null}
                      {person.state === 'ausente' ? (
                        <button type="button" disabled={busy || activity.status === 'cerrada'} onClick={() => void patch({ action: 'mark', participantId: person.id, mark: 'restaurar' })} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#071F5E] disabled:opacity-40">
                          Restaurar
                        </button>
                      ) : null}
                      {person.state === 'presente' ? (
                        <button
                          type="button"
                          disabled={busy || activity.status === 'cerrada'}
                          onClick={() => {
                            setAnularId(person.id);
                            setReason('');
                          }}
                          className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40"
                        >
                          Anular presencia
                        </button>
                      ) : null}
                      {person.phone ? (
                        <a
                          href={`https://wa.me/${(normalizePhone(person.phone) || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${person.name}, valida tu presencia escaneando el QR de la sala o abriendo: ${salaUrl}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#071F5E]"
                        >
                          Recordar QR por WhatsApp
                        </a>
                      ) : null}
                    </div>
                    {anularId === person.id ? (
                      <div className="flex flex-wrap gap-2">
                        <input className={fieldClass} placeholder="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
                        <button type="button" disabled={busy} onClick={() => void patch({ action: 'mark', participantId: person.id, mark: 'anular', reason }).then(() => setAnularId(null))} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white">
                          Confirmar
                        </button>
                        <button type="button" onClick={() => setAnularId(null)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#071F5E]">
                          Cancelar
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <Panel title="Ficha (notas y fotos)" defaultOpen={false}>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void patch({ action: 'meta', place: draft.place, notes: draft.notes, photoLinks: draft.photoLinks });
          }}
        >
          <input className={fieldClass} placeholder="Lugar" value={draft.place} onChange={(e) => setDraft((d) => ({ ...d, place: e.target.value }))} />
          <textarea className={`${fieldClass} min-h-24 py-2`} placeholder="Notas" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
          <textarea className={`${fieldClass} min-h-20 py-2`} placeholder="Enlaces Drive (uno por línea)" value={draft.photoLinks} onChange={(e) => setDraft((d) => ({ ...d, photoLinks: e.target.value }))} />
          <button type="submit" disabled={busy} className="rounded-lg bg-[#009179] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
            Guardar ficha
          </button>
        </form>
      </Panel>

      <Panel title="Historial" defaultOpen={false}>
        <ul className="space-y-1.5 text-xs text-[#1E1E1E]/70">
          {activity.audit.slice(0, 15).map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              {formatWhen(entry.at)} · {entry.action}
              {entry.detail ? ` · ${entry.detail}` : ''}
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}

function Panel({
  title,
  hint,
  defaultOpen,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5">
        <div>
          <p className="font-bold text-[#071F5E]">{title}</p>
          {hint ? <p className="text-xs text-[#1E1E1E]/55">{hint}</p> : null}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#071F5E]/45 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="border-t border-[#071F5E]/8 px-4 py-3 sm:px-5">{children}</div> : null}
    </div>
  );
}

function Badge({ children, tone }: { children: string; tone: 'green' | 'navy' | 'slate' | 'amber' | 'red' }) {
  const toneClass = {
    green: 'bg-[#E7F6EC] text-[#1D6359]',
    navy: 'bg-[#071F5E] text-white',
    slate: 'bg-[#F4F7FA] text-[#071F5E]',
    amber: 'bg-amber-100 text-amber-950',
    red: 'bg-red-50 text-red-800',
  }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneClass}`}>{children}</span>;
}

async function downloadCsv(id?: string) {
  const res = await fetch(`/api/intranet/actividades/export${id ? `?id=${encodeURIComponent(id)}` : ''}`, { cache: 'no-store' });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = id ? `actividad-${id}.csv` : 'actividades.csv';
  link.click();
  URL.revokeObjectURL(url);
}
