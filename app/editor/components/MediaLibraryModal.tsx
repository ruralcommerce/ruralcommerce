'use client';

/**
 * Biblioteca de media em modal (v1): busca, pastas virtuais, upload local,
 * URL externa, apagar só em /images/uploads/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FolderOpen, ImagePlus, Link2, Loader2, Search, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const ROOT_TOKEN = '__root__';

/**
 * /images/home/aliados/foo.png -> "home/aliados"
 * /images/foo.png -> ROOT_TOKEN
 */
function directoryFromImagePath(imagePath: string): string {
  const parts = imagePath.split('/').filter(Boolean);
  if (parts[0] !== 'images' || parts.length < 2) return ROOT_TOKEN;
  const dirParts = parts.slice(1, -1);
  if (dirParts.length === 0) return ROOT_TOKEN;
  return dirParts.join('/');
}

function fileNameFromPath(imagePath: string): string {
  const parts = imagePath.split('/').filter(Boolean);
  return parts[parts.length - 1] || imagePath;
}

function canDeleteUpload(imagePath: string): boolean {
  return imagePath.startsWith('/images/uploads/');
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  images,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  images: string[];
  onRefresh: () => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string>('__all__');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setFolder('__all__');
      setExternalUrl('');
    }
  }, [open]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const p of images) {
      const parts = p.split('/').filter(Boolean);
      if (parts[0] !== 'images' || parts.length < 2) {
        set.add(ROOT_TOKEN);
        continue;
      }

      const dirParts = parts.slice(1, -1);
      if (dirParts.length === 0) {
        set.add(ROOT_TOKEN);
        continue;
      }

      // Adiciona todos os prefixos para que o filtro permita níveis aninhados:
      // home -> home/aliados -> home/aliados/sub
      for (let i = 1; i <= dirParts.length; i++) {
        set.add(dirParts.slice(0, i).join('/'));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [images]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter((p) => {
      if (folder !== '__all__') {
        const dir = directoryFromImagePath(p);
        if (folder === ROOT_TOKEN) {
          if (dir !== ROOT_TOKEN) return false;
        } else {
          // Seleção de um nível deve mostrar também subpastas.
          if (dir === ROOT_TOKEN) return false;
          if (!(dir === folder || dir.startsWith(`${folder}/`))) return false;
        }
      }
      if (!q) return true;
      return p.toLowerCase().includes(q) || fileNameFromPath(p).toLowerCase().includes(q);
    });
  }, [images, search, folder]);

  const handleUploadFiles = useCallback(
    async (list: FileList | null) => {
      if (!list?.length) return;
      setUploading(true);
      try {
        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          const fd = new FormData();
          fd.set('file', file);
          const res = await fetch('/api/editor/media', { method: 'POST', body: fd });
          const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
          if (!res.ok) {
            toast.error(data.error || `Falha no upload (${file.name})`);
            continue;
          }
          if (data.path) {
            toast.success(`Carregado: ${fileNameFromPath(data.path)}`);
          }
        }
        await onRefresh();
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [onRefresh]
  );

  const handleDelete = useCallback(
    async (imagePath: string) => {
      if (!canDeleteUpload(imagePath)) return;
      if (!window.confirm(`Apagar permanentemente esta imagem no servidor?\n${imagePath}`)) return;
      setDeleting(imagePath);
      try {
        const res = await fetch('/api/editor/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: imagePath }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          toast.error(data.error || 'Não foi possível apagar');
          return;
        }
        toast.success('Imagem apagada');
        await onRefresh();
      } finally {
        setDeleting(null);
      }
    },
    [onRefresh]
  );

  const applyExternalUrl = () => {
    const u = externalUrl.trim();
    if (!u.startsWith('https://') && !u.startsWith('http://')) {
      toast.error('A URL deve começar por https:// ou http://');
      return;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(u);
    } catch {
      toast.error('URL inválida');
      return;
    }
    onSelect(u);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const panel = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-library-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(90vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h2 id="media-library-title" className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Biblioteca de media
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Carregue para <code className="rounded bg-slate-200 px-1">/images/uploads/</code> — fica no servidor com o projeto. Apagar só nessa pasta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 space-y-3 border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100">
              <Upload className="h-4 w-4" />
              {uploading ? 'A enviar…' : 'Do computador'}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => void handleUploadFiles(e.target.files)}
              />
            </label>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FolderOpen className="h-4 w-4" />
              Abrir Google Drive
            </a>
            <span className="text-[11px] text-slate-500">
              No Drive: descarregue o ficheiro e use «Do computador», ou cole uma ligação pública abaixo.
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">URL externa (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://… (imagem pública)"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="button"
                  onClick={applyExternalUrl}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Usar URL
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou caminho…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold uppercase text-slate-500">Pasta</label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-2 pl-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-violet-400"
              >
                <option value="__all__">Todas ({images.length})</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f === ROOT_TOKEN ? '(raiz)' : f.split('/').join(' / ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 p-4">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> A processar upload…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-slate-500">
              <ImagePlus className="h-10 w-10 text-slate-300" />
              <p>Nenhuma imagem neste filtro.</p>
              <p className="max-w-sm text-xs">Carregue ficheiros ou ajuste a busca / pasta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((imagePath) => {
                const deletable = canDeleteUpload(imagePath);
                const busy = deleting === imagePath;
                const dir = directoryFromImagePath(imagePath);
                const dirLabel = dir === ROOT_TOKEN ? '(raiz)' : dir;
                return (
                  <div
                    key={imagePath}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(imagePath);
                      }}
                      className="flex aspect-square w-full items-center justify-center bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0]"
                      title={imagePath}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePath}
                        alt=""
                        className="max-h-[92%] max-w-[92%] object-contain"
                        loading="lazy"
                      />
                    </button>
                    <div className="border-t border-slate-100 px-2 py-1.5">
                      <p className="truncate font-mono text-[10px] text-slate-600" title={imagePath}>
                        {fileNameFromPath(imagePath)}
                      </p>
                      <p className="truncate text-[9px] uppercase tracking-wide text-slate-400" title={dirLabel}>
                        {dirLabel}
                      </p>
                    </div>
                    {deletable ? (
                      <button
                        type="button"
                        title="Apagar do servidor"
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(imagePath);
                        }}
                        className="absolute right-1.5 top-1.5 rounded-md bg-white/95 p-1.5 text-red-600 opacity-0 shadow-md ring-1 ring-slate-200 transition hover:bg-red-50 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-[10px] text-slate-500">
          Clique numa miniatura para escolher · Imagens fora de <code className="mx-0.5 rounded bg-slate-200 px-1">uploads</code> não podem ser apagadas aqui
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
