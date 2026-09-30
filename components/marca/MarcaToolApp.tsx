'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MarcaContract, MarcaImage, MarcaVisualProfile } from '@/lib/marca/types';
import {
  MarcaButton,
  MarcaInput,
  MarcaPanel,
  MarcaTextarea,
  marcaGhostLinkClass,
} from '@/components/marca/MarcaShell';
import { MarcaProfileReport } from '@/components/marca/MarcaProfileReport';
import { CatalogManager } from '@/components/marca/CatalogManager';
import { IntranetGate } from '@/components/intranet/IntranetGate';

type Tab = 'contratos' | 'catalogo';
type ContratosView = 'list' | 'create' | 'detail';

export function MarcaToolApp({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Construcción de marcas"
      breadcrumb="Páginas / Herramientas / Marcas"
      permission="tools.marca"
    >
      {() => <MarcaToolBody locale={locale} />}
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

function MarcaToolBody({ locale }: { locale: string }) {
  const [tab, setTab] = useState<Tab>('contratos');
  const [view, setView] = useState<ContratosView>('list');
  const [contracts, setContracts] = useState<MarcaContract[]>([]);
  const [catalog, setCatalog] = useState<MarcaImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MarcaVisualProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({ clientName: '', title: '', notes: '' });
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  const selected = useMemo(
    () => contracts.find((c) => c.id === selectedId) || null,
    [contracts, selectedId]
  );

  async function loadContracts() {
    const res = await fetch('/api/marca/contracts');
    if (!res.ok) return;
    const data = (await res.json()) as { contracts: MarcaContract[] };
    setContracts(data.contracts);
  }

  async function loadCatalog() {
    const res = await fetch('/api/marca/catalog');
    if (!res.ok) return;
    const data = (await res.json()) as { images: MarcaImage[] };
    setCatalog(data.images.filter((img) => img.active !== false));
  }

  async function loadDetail(id: string) {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/marca/contracts/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { contract: MarcaContract; profile: MarcaVisualProfile };
      setContracts((prev) => {
        const exists = prev.some((c) => c.id === id);
        return exists ? prev.map((c) => (c.id === id ? data.contract : c)) : [data.contract, ...prev];
      });
      setProfile(data.profile);
      setSelectedId(id);
      setPickedIds(data.contract.imageIds || []);
      setView('detail');
      setTab('contratos');
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    void loadContracts();
    void loadCatalog();
  }, []);

  async function createContract(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/marca/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          title: form.title || `Marca · ${form.clientName}`,
          notes: form.notes,
          locale,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { contract: MarcaContract };
      setContracts((prev) => [data.contract, ...prev]);
      setForm({ clientName: '', title: '', notes: '' });
      await loadDetail(data.contract.id);
    } finally {
      setCreating(false);
    }
  }

  function togglePick(id: string) {
    setPickedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function saveImageSelection() {
    if (!selected) return;
    setSavingImages(true);
    try {
      const res = await fetch(`/api/marca/contracts/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: pickedIds }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { contract: MarcaContract; profile: MarcaVisualProfile };
      setContracts((prev) => prev.map((c) => (c.id === selected.id ? data.contract : c)));
      setProfile(data.profile);
    } finally {
      setSavingImages(false);
    }
  }

  function backToList() {
    setSelectedId(null);
    setProfile(null);
    setView('list');
    void loadContracts();
  }

  const workshopPath = selected ? `/${locale}/oficina/${selected.code}` : '';
  const workshopUrl =
    typeof window !== 'undefined' && workshopPath ? `${window.location.origin}${workshopPath}` : workshopPath;

  return (
    <div>
      {view !== 'detail' ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <MarcaButton
            variant={tab === 'contratos' ? 'primary' : 'ghost'}
            onClick={() => {
              setTab('contratos');
              setView('list');
            }}
          >
            Contratos
          </MarcaButton>
          <MarcaButton
            variant={tab === 'catalogo' ? 'primary' : 'ghost'}
            onClick={() => {
              setTab('catalogo');
              void loadCatalog();
            }}
          >
            Catálogo de imágenes
          </MarcaButton>
          <Link href={`/${locale}/intranet/herramientas`} className={marcaGhostLinkClass}>
            ← Herramientas
          </Link>
        </div>
      ) : null}

      {tab === 'catalogo' && view !== 'detail' ? <CatalogManager /> : null}

      {tab === 'contratos' && view === 'list' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--rc-primary)]">Contratos</h2>
              <p className="mt-1 text-sm text-[var(--rc-text)]/60">
                Abre un contrato para ver el link, resultados y moodboard final.
              </p>
            </div>
            <MarcaButton onClick={() => setView('create')}>Nuevo contrato</MarcaButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--rc-primary)]/10 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rc-primary)]/10 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rc-text)]/45">
                  <th className="px-4 py-3 font-bold">Cliente</th>
                  <th className="hidden px-4 py-3 font-bold sm:table-cell">Código</th>
                  <th className="hidden px-4 py-3 font-bold md:table-cell">Participantes</th>
                  <th className="hidden px-4 py-3 font-bold sm:table-cell">Estado</th>
                  <th className="hidden px-4 py-3 font-bold lg:table-cell">Creado</th>
                  <th className="px-4 py-3 font-bold text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--rc-text)]/55">
                      Aún no hay contratos. Crea el primero para generar un link de oficina.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--rc-primary)]/8 last:border-b-0 transition hover:bg-[var(--rc-bg)]/80"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void loadDetail(c.id)}
                          className="text-left font-semibold text-[var(--rc-primary)] hover:text-[var(--rc-accent)]"
                        >
                          {c.clientName}
                          <span className="mt-0.5 block text-xs font-normal text-[var(--rc-text)]/55 sm:hidden">
                            {c.code} · {c.participants.length} · {c.status}
                          </span>
                        </button>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-[var(--rc-text)]/70 sm:table-cell">
                        {c.code}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--rc-text)]/70 md:table-cell">
                        {c.participants.length}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="rounded border border-[var(--rc-primary)]/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--rc-primary)]">
                          {c.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--rc-text)]/55 lg:table-cell">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void loadDetail(c.id)}
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

      {tab === 'contratos' && view === 'create' ? (
        <div className="mx-auto max-w-xl space-y-4">
          <button
            type="button"
            onClick={() => setView('list')}
            className="text-sm font-semibold text-[var(--rc-accent)] hover:underline"
          >
            ← Volver a contratos
          </button>
          <MarcaPanel>
            <h2 className="text-lg font-bold text-[var(--rc-primary)]">Nuevo contrato</h2>
            <form onSubmit={createContract} className="mt-4 space-y-3">
              <MarcaInput
                placeholder="Nombre del cliente / grupo"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
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
                  {creating ? 'Creando…' : 'Crear contrato + link'}
                </MarcaButton>
                <MarcaButton type="button" variant="ghost" onClick={() => setView('list')}>
                  Cancelar
                </MarcaButton>
              </div>
            </form>
          </MarcaPanel>
        </div>
      ) : null}

      {tab === 'contratos' && view === 'detail' ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={backToList}
              className="text-sm font-semibold text-[var(--rc-accent)] hover:underline"
            >
              ← Volver a contratos
            </button>
            <Link href={`/${locale}/intranet/herramientas`} className={marcaGhostLinkClass}>
              Herramientas
            </Link>
          </div>

          {loadingDetail && !selected ? (
            <MarcaPanel>
              <p className="text-sm text-[var(--rc-text)]/65">Cargando contrato…</p>
            </MarcaPanel>
          ) : null}

          {selected ? (
            <>
              <MarcaPanel>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
                  Contrato · {selected.code}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--rc-primary)]">{selected.title}</h2>
                <p className="mt-1 text-sm text-[var(--rc-text)]/70">
                  {selected.clientName} · {selected.participants.length} participantes · {selected.status}
                </p>
                <div className="mt-4 rounded-xl bg-[var(--rc-bg)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rc-text)]/45">
                    Link de oficina
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-[var(--rc-primary)]">{workshopUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <MarcaButton
                      variant="primary"
                      onClick={() => void navigator.clipboard.writeText(workshopUrl)}
                    >
                      Copiar link
                    </MarcaButton>
                    <Link href={workshopPath} target="_blank" className={marcaGhostLinkClass}>
                      Abrir oficina
                    </Link>
                    <MarcaButton variant="ghost" onClick={() => void loadDetail(selected.id)}>
                      Actualizar perfil
                    </MarcaButton>
                  </div>
                </div>
              </MarcaPanel>

              <MarcaPanel>
                <h3 className="text-lg font-bold text-[var(--rc-primary)]">Imágenes de esta oficina</h3>
                <p className="mt-1 text-sm text-[var(--rc-text)]/65">
                  Vacío = catálogo completo activo. Selecciona un subconjunto si quieres.
                </p>
                <div className="mt-4 grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
                  {catalog.map((img) => {
                    const on = pickedIds.includes(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => togglePick(img.id)}
                        className={`overflow-hidden rounded-lg border text-left ${
                          on
                            ? 'border-[var(--rc-accent)] ring-2 ring-[var(--rc-accent)]/30'
                            : 'border-[var(--rc-primary)]/10'
                        }`}
                      >
                        <div className="relative aspect-square bg-[var(--rc-bg)]">
                          {img.src ? (
                            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="140px" />
                          ) : (
                            <div className="absolute inset-0" style={{ background: img.moodColor || '#071F5E' }} />
                          )}
                        </div>
                        <p className="truncate px-2 py-1.5 text-[11px] font-medium text-[var(--rc-primary)]">
                          {img.alt}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <MarcaButton variant="ghost" onClick={() => setPickedIds([])}>
                    Usar catálogo completo
                  </MarcaButton>
                  <MarcaButton onClick={() => void saveImageSelection()} disabled={savingImages}>
                    {savingImages ? 'Guardando…' : 'Guardar selección'}
                  </MarcaButton>
                </div>
              </MarcaPanel>

              {profile ? (
                <MarcaProfileReport
                  profile={profile}
                  contract={selected}
                  catalog={catalog}
                  onRefresh={() => loadDetail(selected.id)}
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
