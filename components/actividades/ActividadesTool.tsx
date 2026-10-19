'use client';

import { useEffect, useMemo, useState } from 'react';
import { IntranetGate } from '@/components/intranet/IntranetGate';
import { normalizePhone } from '@/lib/project-phone';
import type {
  Activity,
  ActivityKind,
  ActivityParticipant,
  ImpulsaPerson,
  ParticipantState,
} from '@/lib/actividades/types';
import { captureGeo, readDeviceId } from './geo-client';

const fieldClass =
  'min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-3 text-sm text-[#071F5E] outline-none focus:border-[#009179]';

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

function toLocalInput(iso: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Campo</p>
              <h2 className="mt-1 text-xl font-bold text-[#071F5E]">Capacitaciones y visitas</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1E1E1E]/70">
                Quien ya está en Impulsa CR solo confirma presencia. Quien no está, entra por el convite y se inscribe.
                La presencia queda registrada cuando la persona abre su enlace en su celular.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void downloadCsv()}
                className="rounded-xl border border-[#071F5E]/15 px-4 py-2.5 text-sm font-semibold text-[#071F5E]"
              >
                Exportar
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('create');
                }}
                className="rounded-xl bg-[#009179] px-4 py-2.5 text-sm font-semibold text-white"
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
            placeholder="Buscar por título, proyecto o lugar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {loading ? <p className="mt-4 text-sm text-[#071F5E]/60">Cargando…</p> : null}
          {!loading && visible.length === 0 ? (
            <p className="mt-4 text-sm text-[#071F5E]/60">Todavía no hay actividades con este filtro.</p>
          ) : null}
          <ul className="mt-4 space-y-3">
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
                    className="w-full rounded-2xl border border-[#071F5E]/10 px-4 py-3 text-left transition hover:border-[#009179]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={item.kind === 'visita' ? 'navy' : 'green'}>{KIND_LABEL[item.kind]}</Badge>
                      <Badge tone={item.status === 'abierta' ? 'green' : 'slate'}>
                        {item.status === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </div>
                    <p className="mt-2 font-bold text-[#071F5E]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#1E1E1E]/60">
                      {[item.projectLabel, item.place, formatWhen(item.startsAt)].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#009179]">
                      {presentes} presentes · {item.participants.length} en lista
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
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
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
      <input
        className={fieldClass}
        placeholder="Proyecto o contexto (Impulsa CR, actividad suelta…)"
        value={projectLabel}
        onChange={(e) => setProjectLabel(e.target.value)}
      />
      <input className={fieldClass} placeholder="Lugar" value={place} onChange={(e) => setPlace(e.target.value)} />
      <input className={fieldClass} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      <p className="text-xs leading-5 text-[#1E1E1E]/55">
        Al crear, este celular intenta guardar la ubicación de la sesión. Si el GPS falla, la actividad se abre igual.
      </p>
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
  const [manual, setManual] = useState({ name: '', phone: '', organization: '' });
  const [people, setPeople] = useState<ImpulsaPerson[] | null>(null);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [anularId, setAnularId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');

  const inviteUrl = `${origin()}/${locale}/actividad/${activity.inviteCode}`;
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
        onError('Este celular no entregó la ubicación. La actividad sigue abierta.');
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

  function confirmUrl(token: string) {
    return `${origin()}/${locale}/actividad/c/${token}`;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice('Enlace copiado');
    } catch {
      setNotice('Selecciona el enlace y cópialo');
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <button type="button" onClick={onBack} className="text-xs font-semibold uppercase tracking-wide text-[#009179]">
          Volver a la lista
        </button>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={activity.kind === 'visita' ? 'navy' : 'green'}>{KIND_LABEL[activity.kind]}</Badge>
          <Badge tone={activity.status === 'abierta' ? 'green' : 'slate'}>
            {activity.status === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-[#071F5E]">{activity.title}</h2>
        <p className="mt-1 text-sm text-[#1E1E1E]/65">
          {[activity.projectLabel || 'Sin proyecto', activity.place || 'Sin lugar', formatWhen(activity.startsAt)].join(' · ')}
        </p>
        <p className="mt-2 text-xs text-[#1E1E1E]/50">Abierta por {activity.openedBy.name}</p>

        {activity.sessionGeo ? (
          <p className="mt-3 text-xs text-[#071F5E]">
            GPS de la sesión: {activity.sessionGeo.lat.toFixed(5)}, {activity.sessionGeo.lng.toFixed(5)}
            {activity.sessionGeo.accuracy != null ? ` · ±${Math.round(activity.sessionGeo.accuracy)} m` : ''}
          </p>
        ) : (
          <p className="mt-3 text-xs text-amber-800">La sesión todavía no tiene GPS del celular del técnico.</p>
        )}

        {warnings.sameDevice ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Hay confirmaciones hechas desde el mismo celular, o desde el celular con el que se abrió la sesión. Revísalas antes del reporte.
          </p>
        ) : null}
        {warnings.lejos > 0 ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {warnings.lejos} {warnings.lejos === 1 ? 'persona confirmó' : 'personas confirmaron'} lejos del punto de la sesión.
          </p>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-[#009179]">{notice}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || activity.status === 'cerrada'}
            onClick={() => void saveSessionGeo()}
            className="rounded-xl border border-[#071F5E]/15 px-3 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-50"
          >
            Guardar mi ubicación
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void patch({ action: 'status', status: activity.status === 'abierta' ? 'cerrada' : 'abierta' })}
            className="rounded-xl bg-[#071F5E] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {activity.status === 'abierta' ? 'Cerrar actividad' : 'Reabrir'}
          </button>
          <button
            type="button"
            onClick={() => void downloadCsv(activity.id)}
            className="rounded-xl border border-[#071F5E]/15 px-3 py-2 text-sm font-semibold text-[#071F5E]"
          >
            Exportar
          </button>
          <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
            Borrar
          </button>
        </div>
      </div>

      {activity.kind === 'capacitacion' ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-[#071F5E]">Convite para quien no está en el sistema</h3>
          <p className="mt-1 text-sm leading-6 text-[#1E1E1E]/70">
            Comparte este enlace. La persona se inscribe. Después confirma la presencia en su celular. Inscripción no es presencia.
            {activity.status === 'cerrada' ? ' Con la actividad cerrada el convite no acepta inscripciones.' : ''}
          </p>
          <input className={`${fieldClass} mt-3`} readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => void copy(inviteUrl)} className="rounded-xl bg-[#009179] px-3 py-2 text-sm font-semibold text-white">
              Copiar convite
            </button>
            <a
              className="rounded-xl border border-[#071F5E]/15 px-3 py-2 text-sm font-semibold text-[#071F5E]"
              href={`https://wa.me/?text=${encodeURIComponent(`Hola, te comparto la inscripción para «${activity.title}»: ${inviteUrl}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-[#071F5E]">Visita sin convite abierto</h3>
          <p className="mt-1 text-sm leading-6 text-[#1E1E1E]/70">
            Agrega a la persona desde Impulsa CR o a mano. Ella confirma con el enlace personal, en su celular.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-bold text-[#071F5E]">Personas ya registradas en Impulsa CR</h3>
        <p className="mt-1 text-sm leading-6 text-[#1E1E1E]/70">No se vuelven a inscribir. Solo confirman presencia.</p>
        {people == null ? (
          <button type="button" disabled={busy} onClick={() => void loadPeople()} className="mt-3 rounded-xl border border-[#071F5E]/15 px-3 py-2 text-sm font-semibold text-[#071F5E]">
            Buscar en Impulsa CR
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <input className={fieldClass} placeholder="Filtrar por nombre" value={peopleQuery} onChange={(e) => setPeopleQuery(e.target.value)} />
            {people.length === 0 ? <p className="text-sm text-[#1E1E1E]/60">No hay personas aprobadas o pendientes en Impulsa CR.</p> : null}
            <ul className="max-h-64 space-y-1 overflow-auto">
              {filteredPeople.slice(0, 40).map((person) => {
                const added = rosterIds.has(person.id);
                return (
                  <li key={person.id}>
                    <label className="flex items-start gap-2 rounded-xl px-2 py-2 text-sm hover:bg-[#F4F7FA]">
                      <input
                        type="checkbox"
                        className="mt-1"
                        disabled={added}
                        checked={added || picked.includes(person.id)}
                        onChange={(event) => {
                          setPicked((current) =>
                            event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id)
                          );
                        }}
                      />
                      <span>
                        <span className="font-semibold text-[#071F5E]">{person.name}</span>
                        <span className="block text-xs text-[#1E1E1E]/55">
                          {[person.organization, person.phone, person.status === 'pending' ? 'pendiente' : ''].filter(Boolean).join(' · ')}
                          {added ? ' · ya en la lista' : ''}
                        </span>
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
              className="rounded-xl bg-[#071F5E] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Agregar seleccionados
            </button>
          </div>
        )}

        <form
          className="mt-5 grid gap-2 border-t border-[#071F5E]/10 pt-4 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            void patch({ action: 'manual', person: manual }).then((saved) => {
              if (saved) setManual({ name: '', phone: '', organization: '' });
            });
          }}
        >
          <p className="sm:col-span-3 text-sm font-semibold text-[#071F5E]">Agregar a mano</p>
          <input className={fieldClass} placeholder="Nombre" value={manual.name} onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))} required />
          <input className={fieldClass} placeholder="Teléfono" value={manual.phone} onChange={(e) => setManual((m) => ({ ...m, phone: e.target.value }))} />
          <input className={fieldClass} placeholder="Organización" value={manual.organization} onChange={(e) => setManual((m) => ({ ...m, organization: e.target.value }))} />
          <button type="submit" disabled={busy || activity.status === 'cerrada'} className="rounded-xl bg-[#009179] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-3 sm:w-fit">
            Agregar
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-[#071F5E]">Lista</h3>
          <button
            type="button"
            onClick={() => {
              const lines = activity.participants
                .filter((person) => person.state !== 'presente' && person.state !== 'ausente')
                .map((person) => `${person.name}: ${confirmUrl(person.confirmToken)}`);
              void copy(lines.join('\n') || 'Nadie pendiente');
            }}
            className="text-xs font-semibold uppercase tracking-wide text-[#009179]"
          >
            Copiar enlaces pendientes
          </button>
        </div>
        {activity.participants.length === 0 ? <p className="mt-3 text-sm text-[#1E1E1E]/60">Todavía no hay personas.</p> : null}
        <ul className="mt-3 space-y-3">
          {activity.participants.map((person) => (
            <ParticipantRow
              key={person.id}
              person={person}
              url={confirmUrl(person.confirmToken)}
              busy={busy}
              closed={activity.status === 'cerrada'}
              anularOpen={anularId === person.id}
              reason={reason}
              onReason={setReason}
              onCopy={() => void copy(confirmUrl(person.confirmToken))}
              onAnularOpen={() => {
                setAnularId(person.id);
                setReason('');
              }}
              onAnularClose={() => setAnularId(null)}
              onMark={(mark) => void patch({ action: 'mark', participantId: person.id, mark, reason })}
            />
          ))}
        </ul>
      </div>

      <form
        className="space-y-3 rounded-2xl bg-white p-5 shadow-sm sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void patch({
            action: 'meta',
            place: draft.place,
            notes: draft.notes,
            photoLinks: draft.photoLinks,
          });
        }}
      >
        <h3 className="font-bold text-[#071F5E]">Ficha de la visita o capacitación</h3>
        <p className="text-sm leading-6 text-[#1E1E1E]/70">
          Notas del técnico y enlaces de fotos en Drive. Se pueden completar después de cerrar. La lista de presencia no se reescribe en silencio.
        </p>
        <input className={fieldClass} placeholder="Lugar" value={draft.place} onChange={(e) => setDraft((d) => ({ ...d, place: e.target.value }))} />
        <textarea
          className={`${fieldClass} min-h-28 py-3`}
          placeholder="Qué se vio, acuerdos, próximo paso"
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
        />
        <textarea
          className={`${fieldClass} min-h-24 py-3`}
          placeholder="Un enlace de Drive por línea"
          value={draft.photoLinks}
          onChange={(e) => setDraft((d) => ({ ...d, photoLinks: e.target.value }))}
        />
        <button type="submit" disabled={busy} className="rounded-xl bg-[#009179] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          Guardar ficha
        </button>
      </form>

      {activity.audit.length > 0 ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-[#071F5E]">Historial</h3>
          <ul className="mt-3 space-y-2 text-xs text-[#1E1E1E]/70">
            {activity.audit.slice(0, 12).map((entry, index) => (
              <li key={`${entry.at}-${index}`}>
                {formatWhen(entry.at)} · {entry.action}
                {entry.detail ? ` · ${entry.detail}` : ''} · {entry.actor}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ParticipantRow({
  person,
  url,
  busy,
  closed,
  anularOpen,
  reason,
  onReason,
  onCopy,
  onAnularOpen,
  onAnularClose,
  onMark,
}: {
  person: ActivityParticipant;
  url: string;
  busy: boolean;
  closed: boolean;
  anularOpen: boolean;
  reason: string;
  onReason: (value: string) => void;
  onCopy: () => void;
  onAnularOpen: () => void;
  onAnularClose: () => void;
  onMark: (mark: 'ausente' | 'restaurar' | 'anular') => void;
}) {
  const phone = normalizePhone(person.phone);
  const digits = phone ? phone.replace(/\D/g, '') : '';
  const wa = `${digits ? `https://wa.me/${digits}` : 'https://wa.me/'}?text=${encodeURIComponent(
    `Hola ${person.name}, confirma tu presencia aquí: ${url}`
  )}`;

  return (
    <li className="rounded-2xl border border-[#071F5E]/10 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-[#071F5E]">{person.name}</p>
        <Badge tone={person.state === 'presente' ? 'green' : person.state === 'ausente' ? 'red' : 'slate'}>
          {STATE_LABEL[person.state]}
        </Badge>
        {person.geoStatus === 'sin_gps' && person.state === 'presente' ? <Badge tone="amber">Sin GPS</Badge> : null}
        {person.geoStatus === 'lejos' ? <Badge tone="amber">Ubicación distinta</Badge> : null}
        {person.sameDevice && person.state === 'presente' ? <Badge tone="amber">Mismo celular</Badge> : null}
      </div>
      <p className="mt-1 text-xs text-[#1E1E1E]/55">
        {[person.organization, person.phone, person.source === 'impulsa' ? 'Impulsa CR' : person.source === 'convite' ? 'Convite' : 'Manual']
          .filter(Boolean)
          .join(' · ')}
        {person.confirmedAt ? ` · ${formatWhen(person.confirmedAt)}` : ''}
      </p>
      <input className={`${fieldClass} mt-2`} readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className="rounded-lg bg-[#F4F7FA] px-2.5 py-1.5 text-xs font-semibold text-[#071F5E]">
          Copiar
        </button>
        <a href={wa} target="_blank" rel="noreferrer" className="rounded-lg bg-[#F4F7FA] px-2.5 py-1.5 text-xs font-semibold text-[#071F5E]">
          WhatsApp
        </a>
        {person.state !== 'presente' && person.state !== 'ausente' ? (
          <button type="button" disabled={busy || closed} onClick={() => onMark('ausente')} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#071F5E] disabled:opacity-40">
            Ausente
          </button>
        ) : null}
        {person.state === 'ausente' ? (
          <button type="button" disabled={busy || closed} onClick={() => onMark('restaurar')} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#071F5E] disabled:opacity-40">
            Volver a la lista
          </button>
        ) : null}
        {person.state === 'presente' ? (
          <button type="button" disabled={busy || closed} onClick={onAnularOpen} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40">
            Anular presencia
          </button>
        ) : null}
      </div>
      {anularOpen ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input className={fieldClass} placeholder="Motivo de la anulación" value={reason} onChange={(e) => onReason(e.target.value)} />
          <button type="button" disabled={busy} onClick={() => onMark('anular')} className="rounded-xl bg-red-700 px-3 py-2 text-xs font-semibold text-white">
            Confirmar anulación
          </button>
          <button type="button" onClick={onAnularClose} className="rounded-xl px-3 py-2 text-xs font-semibold text-[#071F5E]">
            Cancelar
          </button>
        </div>
      ) : null}
    </li>
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
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${toneClass}`}>{children}</span>;
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
