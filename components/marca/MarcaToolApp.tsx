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

function MarcaToolBody({ locale }: { locale: string }) {
  const [tab, setTab] = useState<Tab>('contratos');
  const [contracts, setContracts] = useState<MarcaContract[]>([]);
  const [catalog, setCatalog] = useState<MarcaImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MarcaVisualProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
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
    const res = await fetch(`/api/marca/contracts/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as { contract: MarcaContract; profile: MarcaVisualProfile };
    setContracts((prev) => prev.map((c) => (c.id === id ? data.contract : c)));
    setProfile(data.profile);
    setSelectedId(id);
    setPickedIds(data.contract.imageIds || []);
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
      setTab('contratos');
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

  const workshopPath = selected ? `/${locale}/oficina/${selected.code}` : '';
  const workshopUrl =
    typeof window !== 'undefined' && workshopPath ? `${window.location.origin}${workshopPath}` : workshopPath;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <MarcaButton variant={tab === 'contratos' ? 'primary' : 'ghost'} onClick={() => setTab('contratos')}>
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

      {tab === 'catalogo' ? <CatalogManager /> : null}

      {tab === 'contratos' ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-5">
            <MarcaPanel>
              <h2 className="text-lg font-bold text-[var(--rc-primary)]">Nuevo contrato</h2>
              <form onSubmit={createContract} className="mt-4 space-y-3">
                <MarcaInput
                  placeholder="Nombre del cliente / grupo"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  required
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
                <MarcaButton type="submit" disabled={creating}>
                  {creating ? 'Creando…' : 'Crear contrato + link'}
                </MarcaButton>
              </form>
            </MarcaPanel>

            <MarcaPanel>
              <h2 className="text-lg font-bold text-[var(--rc-primary)]">Contratos</h2>
              <ul className="mt-4 divide-y divide-[var(--rc-primary)]/8">
                {contracts.length === 0 ? (
                  <li className="py-3 text-sm text-[var(--rc-text)]/65">Aún no hay contratos.</li>
                ) : (
                  contracts.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => void loadDetail(c.id)}
                        className={`flex w-full flex-col items-start gap-1 py-3 text-left transition ${
                          selectedId === c.id ? 'text-[var(--rc-accent)]' : 'text-[var(--rc-primary)]'
                        }`}
                      >
                        <span className="font-semibold">{c.clientName}</span>
                        <span className="text-xs text-[var(--rc-text)]/60">
                          {c.code} · {c.participants.length} participantes · {c.status}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </MarcaPanel>
          </div>

          <div className="space-y-5">
            {selected ? (
              <>
                <MarcaPanel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
                    Link de oficina
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--rc-primary)]">{selected.title}</h2>
                  <p className="mt-1 text-sm text-[var(--rc-text)]/70">{selected.clientName}</p>
                  <div className="mt-4 rounded-xl bg-[var(--rc-bg)] p-4">
                    <p className="break-all text-sm font-medium text-[var(--rc-primary)]">{workshopUrl}</p>
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
                  <div className="mt-4 grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
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
                  <MarcaProfileReport profile={profile} contract={selected} catalog={catalog} />
                ) : null}
              </>
            ) : (
              <MarcaPanel>
                <p className="text-sm text-[var(--rc-text)]/65">
                  Selecciona un contrato o crea uno nuevo para ver el perfil visual.
                </p>
              </MarcaPanel>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
