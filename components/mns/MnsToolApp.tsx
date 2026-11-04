'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IntranetGate } from '@/components/intranet/IntranetGate';
import {
  MarcaButton,
  MarcaInput,
  MarcaPanel,
  MarcaTextarea,
  marcaGhostLinkClass,
} from '@/components/marca/MarcaShell';
import { deltaLabel } from '@/lib/mns/assessment';
import { MNS_COURSE, MNS_FICHAS } from '@/lib/mns/content';
import type { MnsParticipant, MnsSession } from '@/lib/mns/types';

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

function participantStatus(p: MnsParticipant) {
  if (p.completedAt || p.postCheck?.completedAt) return 'Completó';
  if (p.preCheck?.completedAt) return `En mapa · ${p.currentFicha.replace('ficha', 'Ficha ')}`;
  return 'En punto de partida';
}

function MnsToolBody({ locale }: { locale: string }) {
  const [sessions, setSessions] = useState<MnsSession[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({ groupName: '', title: '', notes: '' });
  const [copied, setCopied] = useState(false);

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
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/mns/sessions/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { session: MnsSession };
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === id);
        return exists ? prev.map((s) => (s.id === id ? data.session : s)) : [data.session, ...prev];
      });
      setSelectedId(id);
      setView('detail');
    } finally {
      setLoadingDetail(false);
    }
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

  function backToList() {
    setSelectedId(null);
    setView('list');
    void loadSessions();
  }

  const joinPath = selected ? `/${locale}/mns/${selected.code}` : '';
  const joinUrl =
    typeof window !== 'undefined' && joinPath ? `${window.location.origin}${joinPath}` : joinPath;

  const stats = useMemo(() => {
    if (!selected) return null;
    const parts = selected.participants;
    const withPre = parts.filter((p) => p.preCheck).length;
    const withPost = parts.filter((p) => p.postCheck).length;
    const completed = parts.filter((p) => p.completedAt || p.postCheck).length;
    const withBoth = parts.filter((p) => p.preCheck && p.postCheck);
    const avgDelta =
      withBoth.length > 0
        ? withBoth.reduce((acc, p) => acc + ((p.postCheck?.score || 0) - (p.preCheck?.score || 0)), 0) /
          withBoth.length
        : null;
    const byFicha: Record<string, number> = { ficha1: 0, ficha2: 0, ficha3: 0, ficha4: 0, done: 0 };
    for (const p of parts) {
      if (p.completedAt || p.postCheck) byFicha.done += 1;
      else byFicha[p.currentFicha] = (byFicha[p.currentFicha] || 0) + 1;
    }
    return { withPre, withPost, completed, avgDelta, byFicha, total: parts.length };
  }, [selected]);

  return (
    <div>
      {view !== 'detail' ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <MarcaButton
            variant={view === 'list' ? 'primary' : 'ghost'}
            onClick={() => setView('list')}
          >
            Salas
          </MarcaButton>
          <MarcaButton variant={view === 'create' ? 'primary' : 'ghost'} onClick={() => setView('create')}>
            Nueva sala
          </MarcaButton>
          <Link href={`/${locale}/intranet/herramientas`} className={marcaGhostLinkClass}>
            ← Herramientas
          </Link>
        </div>
      ) : null}

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--rc-primary)]">Salas MNS</h2>
              <p className="mt-1 text-sm text-[var(--rc-text)]/60">
                Abre una sala para ver el link, resultados y avance por participante.
              </p>
            </div>
            <MarcaButton onClick={() => setView('create')}>Nueva sala</MarcaButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--rc-primary)]/10 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rc-primary)]/10 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rc-text)]/45">
                  <th className="px-4 py-3">Grupo</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Código</th>
                  <th className="hidden px-4 py-3 md:table-cell">Participantes</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Estado</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Actualizado</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--rc-text)]/55">
                      Aún no hay salas. Crea la primera para generar un link de oficina.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[var(--rc-primary)]/8 last:border-b-0 transition hover:bg-[var(--rc-bg)]/80"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void openDetail(s.id)}
                          className="text-left font-semibold text-[var(--rc-primary)] hover:text-[var(--rc-accent)]"
                        >
                          {s.groupName}
                          <span className="mt-0.5 block text-xs font-normal text-[var(--rc-text)]/55 sm:hidden">
                            {s.code} · {s.participants.length} · {s.status}
                          </span>
                        </button>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-[var(--rc-text)]/70 sm:table-cell">
                        {s.code}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--rc-text)]/70 md:table-cell">
                        {s.participants.length}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="rounded border border-[var(--rc-primary)]/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--rc-primary)]">
                          {s.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--rc-text)]/55 lg:table-cell">
                        {formatDate(s.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void openDetail(s.id)}
                          className="text-xs font-semibold text-[var(--rc-accent)] hover:underline"
                        >
                          Abrir →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {view === 'create' ? (
        <div className="mx-auto max-w-xl space-y-4">
          <button
            type="button"
            onClick={() => setView('list')}
            className="text-sm font-semibold text-[var(--rc-accent)] hover:underline"
          >
            ← Volver a salas
          </button>
          <MarcaPanel>
            <h2 className="text-lg font-bold text-[var(--rc-primary)]">Nueva sala</h2>
            <p className="mt-1 text-sm text-[var(--rc-text)]/65">{MNS_COURSE.edition}</p>
            <form onSubmit={createSession} className="mt-4 space-y-3">
              <MarcaInput
                placeholder="Nombre del grupo / cohorte"
                value={form.groupName}
                onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
                required
                autoFocus
              />
              <MarcaInput
                placeholder="Título de la oficina (opcional)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <MarcaTextarea
                placeholder="Notas internas"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <MarcaButton type="submit" disabled={creating}>
                  {creating ? 'Creando…' : 'Crear sala + link'}
                </MarcaButton>
                <MarcaButton type="button" variant="ghost" onClick={() => setView('list')}>
                  Cancelar
                </MarcaButton>
              </div>
            </form>
          </MarcaPanel>
        </div>
      ) : null}

      {view === 'detail' ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={backToList}
              className="text-sm font-semibold text-[var(--rc-accent)] hover:underline"
            >
              ← Volver a salas
            </button>
            <Link href={`/${locale}/intranet/herramientas`} className={marcaGhostLinkClass}>
              Herramientas
            </Link>
          </div>

          {loadingDetail && !selected ? (
            <MarcaPanel>
              <p className="text-sm text-[var(--rc-text)]/65">Cargando sala…</p>
            </MarcaPanel>
          ) : null}

          {selected ? (
            <>
              <MarcaPanel>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
                  Oficina · {selected.code}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--rc-primary)]">{selected.title}</h2>
                <p className="mt-1 text-sm text-[var(--rc-text)]/70">
                  {selected.groupName} · {selected.participants.length} participantes · {selected.status}
                </p>

                <div className="mt-4 rounded-xl bg-[var(--rc-bg)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rc-text)]/45">
                    Link de oficina
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-[var(--rc-primary)]">{joinUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <MarcaButton
                      variant="primary"
                      onClick={() => {
                        void navigator.clipboard.writeText(joinUrl);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1800);
                      }}
                    >
                      {copied ? 'Copiado' : 'Copiar link'}
                    </MarcaButton>
                    <Link href={joinPath} target="_blank" className={marcaGhostLinkClass}>
                      Abrir oficina
                    </Link>
                    <MarcaButton variant="ghost" onClick={() => void openDetail(selected.id)}>
                      Actualizar resultados
                    </MarcaButton>
                    {selected.status === 'active' ? (
                      <MarcaButton variant="ghost" onClick={() => void setStatus('closed')}>
                        Cerrar sala
                      </MarcaButton>
                    ) : (
                      <MarcaButton variant="ghost" onClick={() => void setStatus('active')}>
                        Reabrir sala
                      </MarcaButton>
                    )}
                  </div>
                </div>
              </MarcaPanel>

              {stats ? (
                <MarcaPanel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
                    Resultados del taller
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[var(--rc-primary)]">
                    {stats.completed} de {stats.total} participantes con mapa cerrado
                  </h3>
                  <p className="mt-1 text-sm text-[var(--rc-text)]/65">
                    Pre: {stats.withPre} · Post: {stats.withPost} · Mejora media:{' '}
                    {stats.avgDelta == null
                      ? '—'
                      : `${stats.avgDelta > 0 ? '+' : ''}${stats.avgDelta.toFixed(1)}`}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {MNS_FICHAS.map((f) => (
                      <div key={f.id} className="rounded-xl bg-[var(--rc-bg)] px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--rc-text)]/45">
                          Ficha {f.number}
                        </p>
                        <p className="mt-1 text-xl font-bold text-[var(--rc-primary)]">
                          {stats.byFicha[f.id] || 0}
                        </p>
                        <p className="text-xs text-[var(--rc-text)]/55">en esta ficha</p>
                      </div>
                    ))}
                    <div className="rounded-xl bg-[var(--rc-accent)]/10 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--rc-accent)]">
                        Completos
                      </p>
                      <p className="mt-1 text-xl font-bold text-[var(--rc-accent)]">{stats.byFicha.done}</p>
                      <p className="text-xs text-[var(--rc-text)]/55">con post</p>
                    </div>
                  </div>
                </MarcaPanel>
              ) : null}

              <MarcaPanel>
                <h3 className="text-lg font-bold text-[var(--rc-primary)]">Participantes</h3>
                <p className="mt-1 text-sm text-[var(--rc-text)]/65">
                  Resumen por representante y empresa. Actualiza para ver el avance en vivo.
                </p>

                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--rc-primary)]/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--rc-bg)] text-[var(--rc-primary)]">
                      <tr>
                        <th className="px-3 py-3 font-semibold">Representante</th>
                        <th className="px-3 py-3 font-semibold">Empresa</th>
                        <th className="hidden px-3 py-3 font-semibold sm:table-cell">Pre</th>
                        <th className="hidden px-3 py-3 font-semibold sm:table-cell">Post</th>
                        <th className="px-3 py-3 font-semibold">Mejora</th>
                        <th className="px-3 py-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.participants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-[var(--rc-text)]/60">
                            Nadie ha entrado todavía. Comparte el link de oficina.
                          </td>
                        </tr>
                      ) : (
                        selected.participants.map((p) => {
                          const pre = p.preCheck;
                          const post = p.postCheck;
                          const delta = deltaLabel(pre?.score, post?.score);
                          return (
                            <tr key={p.id} className="border-t border-[var(--rc-primary)]/8">
                              <td className="px-3 py-3 font-medium text-[var(--rc-primary)]">{p.name}</td>
                              <td className="px-3 py-3 text-[var(--rc-text)]/75">{p.companyName || '—'}</td>
                              <td className="hidden px-3 py-3 sm:table-cell">
                                {pre ? `${pre.score}/${pre.max}` : '—'}
                              </td>
                              <td className="hidden px-3 py-3 sm:table-cell">
                                {post ? `${post.score}/${post.max}` : '—'}
                              </td>
                              <td
                                className={`px-3 py-3 font-semibold ${
                                  delta.startsWith('+')
                                    ? 'text-[var(--rc-accent)]'
                                    : delta === '0'
                                      ? 'text-[var(--rc-text)]/60'
                                      : delta === '—'
                                        ? 'text-[var(--rc-text)]/40'
                                        : 'text-[#b42318]'
                                }`}
                              >
                                {delta}
                              </td>
                              <td className="px-3 py-3 text-[var(--rc-text)]/70">{participantStatus(p)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </MarcaPanel>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
