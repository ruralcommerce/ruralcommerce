'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IntranetGate } from '@/components/intranet/IntranetGate';
import { MNS_COURSE, MNS_FICHAS } from '@/lib/mns/content';
import type { MnsSession } from '@/lib/mns/types';
import './mns.css';

export function MnsToolApp({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="MNS Internacional"
      breadcrumb="Páginas / Herramientas / MNS"
      permission="tools.mns"
    >
      {() => <MnsToolBody locale={locale} />}
    </IntranetGate>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function MnsToolBody({ locale }: { locale: string }) {
  const [sessions, setSessions] = useState<MnsSession[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ groupName: '', title: '', notes: '' });

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) || null,
    [sessions, selectedId]
  );

  async function loadSessions() {
    const res = await fetch('/api/mns/sessions');
    if (!res.ok) return;
    const data = (await res.json()) as { sessions: MnsSession[] };
    setSessions(data.sessions);
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (!form.groupName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/mns/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: form.groupName,
          title: form.title || `MNS · ${form.groupName}`,
          notes: form.notes,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { session: MnsSession };
      setSessions((prev) => [data.session, ...prev]);
      setSelectedId(data.session.id);
      setView('detail');
      setForm({ groupName: '', title: '', notes: '' });
    } finally {
      setCreating(false);
    }
  }

  async function openDetail(id: string) {
    const res = await fetch(`/api/mns/sessions/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as { session: MnsSession };
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === id);
      return exists ? prev.map((s) => (s.id === id ? data.session : s)) : [data.session, ...prev];
    });
    setSelectedId(id);
    setView('detail');
  }

  async function setStatus(status: 'active' | 'closed') {
    if (!selected) return;
    const res = await fetch(`/api/mns/sessions/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { session: MnsSession };
    setSessions((prev) => prev.map((s) => (s.id === data.session.id ? data.session : s)));
  }

  const joinPath = selected ? `/${locale}/mns/${selected.code}` : '';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--rc-primary)]/10 bg-white p-5 shadow-[0_12px_40px_rgba(7,31,94,0.06)] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rc-accent)]">
          {MNS_COURSE.edition}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--rc-primary)]">{MNS_COURSE.name}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--rc-text)]/75">
          Crea salas para que cada participante complete las 4 fichas desde el celular, con asistente
          autoexplicativo (para qué, cómo y ejemplos).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MNS_FICHAS.map((f) => (
            <span
              key={f.id}
              className="rounded-full bg-[var(--rc-primary)]/5 px-3 py-1 text-xs font-semibold text-[var(--rc-primary)]"
            >
              {f.number}. {f.title}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView('list')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            view === 'list' ? 'bg-[var(--rc-primary)] text-white' : 'bg-white text-[var(--rc-primary)] border border-[var(--rc-primary)]/15'
          }`}
        >
          Salas
        </button>
        <button
          type="button"
          onClick={() => setView('create')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            view === 'create' ? 'bg-[var(--rc-accent)] text-white' : 'bg-white text-[var(--rc-primary)] border border-[var(--rc-primary)]/15'
          }`}
        >
          Nueva sala
        </button>
        {selected && view === 'detail' ? (
          <span className="rounded-full bg-[var(--rc-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--rc-accent)]">
            Código {selected.code}
          </span>
        ) : null}
      </div>

      {view === 'create' ? (
        <form
          onSubmit={createSession}
          className="space-y-4 rounded-2xl border border-[var(--rc-primary)]/10 bg-white p-5 sm:p-6"
        >
          <div>
            <label className="text-sm font-semibold text-[var(--rc-primary)]">Grupo / cohorte</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--rc-primary)]/15 bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-[var(--rc-accent)]"
              value={form.groupName}
              onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
              placeholder="Ej. Impulsa Los Santos · abril 2026"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--rc-primary)]">Título (opcional)</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--rc-primary)]/15 bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-[var(--rc-accent)]"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="MNS Internacional · sesión 1"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--rc-primary)]">Notas</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-[var(--rc-primary)]/15 bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-[var(--rc-accent)]"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-full bg-[var(--rc-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {creating ? 'Creando…' : 'Crear sala y código'}
          </button>
        </form>
      ) : null}

      {view === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--rc-primary)]/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--rc-primary)] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Grupo</th>
                <th className="px-4 py-3 font-semibold">Participantes</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--rc-text)]/60">
                    Aún no hay salas. Crea la primera para el encuentro.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer border-t border-[var(--rc-primary)]/8 hover:bg-[var(--rc-accent)]/5"
                    onClick={() => void openDetail(s.id)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[var(--rc-primary)]">{s.code}</td>
                    <td className="px-4 py-3">{s.groupName}</td>
                    <td className="px-4 py-3">{s.participants.length}</td>
                    <td className="px-4 py-3 capitalize">{s.status}</td>
                    <td className="px-4 py-3">{formatDate(s.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === 'detail' && selected ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--rc-primary)]/10 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--rc-accent)]">
                  Sala activa
                </p>
                <h3 className="mt-1 text-xl font-bold text-[var(--rc-primary)]">{selected.title}</h3>
                <p className="mt-1 text-sm text-[var(--rc-text)]/70">{selected.groupName}</p>
                <p className="mt-3 font-mono text-3xl font-bold tracking-[0.18em] text-[var(--rc-primary)]">
                  {selected.code}
                </p>
                <p className="mt-2 text-sm text-[var(--rc-text)]/70">
                  Participantes: abre{' '}
                  <Link className="font-semibold text-[var(--rc-accent)] underline" href={joinPath}>
                    {joinPath}
                  </Link>{' '}
                  o entra en <code>/{locale}/mns</code> con el código.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(`${window.location.origin}${joinPath}`)}
                  className="rounded-full border border-[var(--rc-primary)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--rc-primary)]"
                >
                  Copiar enlace
                </button>
                {selected.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => void setStatus('closed')}
                    className="rounded-full bg-[var(--rc-primary)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Cerrar sala
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setStatus('active')}
                    className="rounded-full bg-[var(--rc-accent)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Reabrir sala
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--rc-primary)]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f8fb] text-[var(--rc-primary)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Participante</th>
                  <th className="px-4 py-3 font-semibold">Ficha</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {selected.participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--rc-text)]/60">
                      Nadie ha entrado todavía. Comparte el código en la sesión.
                    </td>
                  </tr>
                ) : (
                  selected.participants.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--rc-primary)]/8">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.currentFicha.replace('ficha', 'Ficha ')}</td>
                      <td className="px-4 py-3 max-w-[14rem] truncate">{p.productLabel || '—'}</td>
                      <td className="px-4 py-3">{p.completedAt ? 'Completó' : 'En curso'}</td>
                      <td className="px-4 py-3">{formatDate(p.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
