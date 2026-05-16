'use client';

/**
 * Biblioteca de media — estilo explorador: árvore de pastas, lista + miniaturas,
 * arrastar e largar para upload na pasta atual (qualquer subpasta de public/images).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  ImagePlus,
  LayoutGrid,
  Link2,
  List,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const ROOT_TOKEN = '__root__';
const BROWSE_KEY_STORAGE = 'media-library-browse-key';
/** Valor enviado no POST quando o destino é a raiz de public/images (FormData pode omitir string vazia). */
const MEDIA_UPLOAD_ROOT_SENTINEL = '__images_root__';

type FsNode = {
  segment: string;
  /** Caminho relativo a /images, ex.: "uploads" ou "home/aliados" */
  key: string;
  folders: Map<string, FsNode>;
  files: string[];
};

function emptyNode(segment: string, key: string): FsNode {
  return { segment, key, folders: new Map(), files: [] };
}

function buildFsTree(paths: string[]): FsNode {
  const root = emptyNode('', '');
  for (const p of paths) {
    const parts = p.split('/').filter(Boolean);
    if (parts[0] !== 'images' || parts.length < 2) continue;
    const segs = parts.slice(1);
    const dirSegs = segs.slice(0, -1);
    let node = root;
    const acc: string[] = [];
    for (const seg of dirSegs) {
      acc.push(seg);
      const key = acc.join('/');
      if (!node.folders.has(seg)) {
        node.folders.set(seg, emptyNode(seg, key));
      }
      node = node.folders.get(seg)!;
    }
    node.files.push(p);
  }
  const sortFiles = (n: FsNode) => {
    n.files.sort((a, b) => a.localeCompare(b));
    for (const c of n.folders.values()) sortFiles(c);
  };
  sortFiles(root);
  return root;
}

function getNodeByKey(root: FsNode, key: string): FsNode | null {
  if (key === '') return root;
  const segs = key.split('/').filter(Boolean);
  let node = root;
  for (const seg of segs) {
    const next = node.folders.get(seg);
    if (!next) return null;
    node = next;
  }
  return node;
}

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

function canManageMediaFile(imagePath: string): boolean {
  return imagePath.startsWith('/images/');
}

async function parseApiJson(res: Response): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const text = await res.text();
  if (!text) return { ok: res.ok, data: {} };
  try {
    return { ok: res.ok, data: JSON.parse(text) as Record<string, unknown> };
  } catch {
    return { ok: res.ok, data: { error: text.slice(0, 240) || `HTTP ${res.status}` } };
  }
}

function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
  selectedKey,
  onPick,
}: {
  node: FsNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (key: string) => void;
  selectedKey: string;
  onPick: (key: string) => void;
}) {
  const subs = useMemo(() => Array.from(node.folders.values()).sort((a, b) => a.segment.localeCompare(b.segment)), [node]);
  if (subs.length === 0) return null;

  return (
    <>
      {subs.map((child) => {
        const isOpen = expanded.has(child.key);
        const isSel = selectedKey === child.key || selectedKey.startsWith(`${child.key}/`);
        const hasKids = child.folders.size > 0;
        return (
          <div key={child.key} className="select-none">
            <div
              className={`flex items-center gap-0.5 rounded-md py-0.5 pr-1 text-xs ${
                selectedKey === child.key ? 'bg-violet-100 text-violet-950' : isSel ? 'text-violet-800' : 'text-slate-700'
              } hover:bg-slate-200/80`}
              style={{ paddingLeft: 4 + depth * 12 }}
            >
              {hasKids ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-300/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(child.key);
                  }}
                >
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span className="inline-block w-6 shrink-0" />
              )}
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium"
                onClick={() => onPick(child.key)}
              >
                {isOpen ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                <span className="truncate">{child.segment}</span>
              </button>
            </div>
            {hasKids && isOpen ? (
              <TreeRow
                node={child}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                selectedKey={selectedKey}
                onPick={onPick}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
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
  const [folderFilter, setFolderFilter] = useState<string>('__all__');
  const [browseKey, setBrowseKey] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['uploads']));
  const [viewMode, setViewMode] = useState<'icons' | 'list'>('icons');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [maxUploadMb, setMaxUploadMb] = useState(50);
  const [movingPath, setMovingPath] = useState<string | null>(null);
  const [movingBusy, setMovingBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setFolderFilter('__all__');
      setBrowseKey('');
      setExpanded(new Set(['uploads']));
      setExternalUrl('');
      setDragOver(false);
      setMovingPath(null);
      setMovingBusy(false);
    } else {
      try {
        const saved = sessionStorage.getItem(BROWSE_KEY_STORAGE);
        setBrowseKey(saved && typeof saved === 'string' ? saved : '');
      } catch {
        setBrowseKey('');
      }
      setExpanded((prev) => new Set([...prev, 'uploads']));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(BROWSE_KEY_STORAGE, browseKey);
    } catch {
      /* ignore */
    }
  }, [open, browseKey]);

  const tree = useMemo(() => buildFsTree(images), [images]);

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
      for (let i = 1; i <= dirParts.length; i++) {
        set.add(dirParts.slice(0, i).join('/'));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [images]);

  const filteredGlobal = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter((p) => {
      if (folderFilter !== '__all__') {
        const dir = directoryFromImagePath(p);
        if (folderFilter === ROOT_TOKEN) {
          if (dir !== ROOT_TOKEN) return false;
        } else {
          if (dir === ROOT_TOKEN) return false;
          if (!(dir === folderFilter || dir.startsWith(`${folderFilter}/`))) return false;
        }
      }
      if (!q) return true;
      return p.toLowerCase().includes(q) || fileNameFromPath(p).toLowerCase().includes(q);
    });
  }, [images, search, folderFilter]);

  const currentNode = useMemo(() => getNodeByKey(tree, browseKey), [tree, browseKey]);

  const filesInFolder = useMemo(() => {
    if (search.trim()) return filteredGlobal;
    const node = getNodeByKey(tree, browseKey);
    if (node) return node.files;
    // Pasta ainda sem nó na árvore (ex.: uploads vazia) ou lista desfasada: derivar da lista plana
    if (browseKey === '') {
      return images.filter((p) => directoryFromImagePath(p) === ROOT_TOKEN);
    }
    return images.filter((p) => directoryFromImagePath(p) === browseKey);
  }, [search, filteredGlobal, tree, browseKey, images]);

  const subfoldersInBrowse = useMemo(() => {
    if (search.trim()) return [];
    if (currentNode) {
      return Array.from(currentNode.folders.values()).sort((a, b) => a.segment.localeCompare(b.segment));
    }
    if (!browseKey) return [];
    const prefix = `${browseKey}/`;
    const childNames = new Set<string>();
    for (const p of images) {
      const d = directoryFromImagePath(p);
      if (d === browseKey) continue;
      if (!d.startsWith(prefix)) continue;
      const rest = d.slice(prefix.length);
      const first = rest.split('/')[0];
      if (first) childNames.add(first);
    }
    return Array.from(childNames)
      .sort()
      .map((segment) => ({
        segment,
        key: `${browseKey}/${segment}`,
        folders: new Map<string, FsNode>(),
        files: [] as string[],
      }));
  }, [search, currentNode, browseKey, images]);

  const toggleExpand = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleMoveTo = useCallback(
    async (from: string, toBrowseKey: string) => {
      setMovingBusy(true);
      try {
        const res = await fetch('/api/editor/media/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ from, toDir: toBrowseKey }),
        });
        const { data } = await parseApiJson(res);
        if (!res.ok) {
          toast.error((typeof data.error === 'string' && data.error) || `Erro HTTP ${res.status}`);
          return;
        }
        toast.success('Ficheiro movido');
        setMovingPath(null);
        await onRefresh();
        const newPath = typeof data.path === 'string' ? data.path : null;
        if (newPath) {
          const dir = directoryFromImagePath(newPath);
          const nextKey = dir === ROOT_TOKEN ? '' : dir;
          setBrowseKey(nextKey);
          const parts = nextKey.split('/').filter(Boolean);
          let acc = '';
          setExpanded((prev) => {
            const next = new Set(prev);
            for (const p of parts) {
              acc = acc ? `${acc}/${p}` : p;
              next.add(acc);
            }
            return next;
          });
        } else {
          setBrowseKey(toBrowseKey);
        }
      } finally {
        setMovingBusy(false);
      }
    },
    [onRefresh]
  );

  const goOrMoveToFolder = useCallback(
    (folderKey: string) => {
      if (movingPath && !movingBusy) {
        void handleMoveTo(movingPath, folderKey);
        return;
      }
      setBrowseKey(folderKey);
    },
    [movingPath, movingBusy, handleMoveTo]
  );

  const handleUploadFiles = useCallback(
    async (list: FileList | null) => {
      if (!list?.length) return;
      setUploading(true);
      try {
        let lastOkPath: string | null = null;
        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          const fd = new FormData();
          fd.set('file', file);
          fd.set('targetDir', browseKey === '' ? MEDIA_UPLOAD_ROOT_SENTINEL : browseKey);

          const res = await fetch('/api/editor/media', {
            method: 'POST',
            body: fd,
            credentials: 'include',
          });
          const { data } = await parseApiJson(res);
          const err = typeof data.error === 'string' ? data.error : null;
          if (!res.ok) {
            toast.error(err || `Falha no upload (${file.name}) — HTTP ${res.status}`);
            continue;
          }
          if (typeof data.path === 'string') {
            lastOkPath = data.path;
            toast.success(`Carregado: ${fileNameFromPath(data.path)}`);
          }
          if (typeof data.maxUploadMb === 'number') setMaxUploadMb(data.maxUploadMb);
        }
        await onRefresh();
        if (lastOkPath) {
          const dir = directoryFromImagePath(lastOkPath);
          const nextKey = dir === ROOT_TOKEN ? '' : dir;
          setBrowseKey(nextKey);
          const parts = nextKey.split('/').filter(Boolean);
          let acc = '';
          setExpanded((prev) => {
            const next = new Set(prev);
            for (const p of parts) {
              acc = acc ? `${acc}/${p}` : p;
              next.add(acc);
            }
            return next;
          });
        }
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [onRefresh, browseKey]
  );

  const handleDelete = useCallback(
    async (imagePath: string) => {
      if (!canManageMediaFile(imagePath)) return;
      if (!window.confirm(`Apagar permanentemente esta imagem no servidor?\n${imagePath}`)) return;
      setDeleting(imagePath);
      try {
        const res = await fetch('/api/editor/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: imagePath }),
          credentials: 'include',
        });
        const { data } = await parseApiJson(res);
        if (!res.ok) {
          toast.error((typeof data.error === 'string' && data.error) || 'Não foi possível apagar');
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
      if (e.key === 'Escape') {
        if (movingPath) setMovingPath(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, movingPath]);

  const breadcrumbParts = browseKey ? browseKey.split('/') : [];

  const onDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setDragOver(false);
  };

  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleUploadFiles(e.dataTransfer.files);
  };

  if (!mounted || !open) return null;

  const acceptMime =
    'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff,image/avif,image/heic,image/heif,.ico';

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
        className="flex max-h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h2 id="media-library-title" className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Explorador de imagens
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Pastas em <code className="rounded bg-slate-200 px-1">public/images</code>. O upload vai para a pasta em que está agora (barra de caminho). Mover: botão «Mover» numa imagem e depois clique na pasta de destino na árvore ou nas pastas grandes. Até {maxUploadMb} MB por ficheiro.
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

        <div className="shrink-0 space-y-2 border-b border-slate-100 bg-white px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100">
              <Upload className="h-4 w-4" />
              {uploading ? 'A enviar…' : 'Escolher ficheiros'}
              <input
                ref={fileRef}
                type="file"
                accept={acceptMime}
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
              Google Drive
            </a>
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                title="Ícones grandes"
                onClick={() => setViewMode('icons')}
                className={`rounded-md p-1.5 ${viewMode === 'icons' ? 'bg-violet-100 text-violet-800' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Lista"
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 ${viewMode === 'list' ? 'bg-violet-100 text-violet-800' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">URL externa</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://…"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="button"
                  onClick={applyExternalUrl}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Usar
                </button>
              </div>
            </div>
          </div>
        </div>

        {movingPath ? (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">
            <span className="min-w-0 truncate">
              A mover:{' '}
              <code className="rounded bg-white/80 px-1 font-mono">{fileNameFromPath(movingPath)}</code> — clique numa pasta
              na árvore ou nas pastas grandes.
            </span>
            <button
              type="button"
              className="shrink-0 rounded border border-amber-300 px-2 py-1 font-semibold hover:bg-amber-100"
              onClick={() => setMovingPath(null)}
            >
              Cancelar
            </button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 divide-x divide-slate-200">
          {/* Coluna esquerda — árvore */}
          <aside className="flex w-[220px] shrink-0 flex-col bg-slate-50">
            <div className="border-b border-slate-200 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Pastas
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => goOrMoveToFolder('')}
                className={`mx-1 flex w-[calc(100%-8px)] items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold ${
                  browseKey === '' ? 'bg-violet-100 text-violet-950' : 'text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate">Imagens (raiz)</span>
              </button>
              <TreeRow
                node={tree}
                depth={0}
                expanded={expanded}
                onToggle={toggleExpand}
                selectedKey={browseKey}
                onPick={goOrMoveToFolder}
              />
            </div>
          </aside>

          {/* Área principal */}
          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2">
              <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[11px] text-slate-600">
                <button type="button" className="font-semibold text-violet-700 hover:underline" onClick={() => goOrMoveToFolder('')}>
                  images
                </button>
                {breadcrumbParts.map((part, i) => {
                  const prefix = breadcrumbParts.slice(0, i + 1).join('/');
                  return (
                    <span key={prefix} className="flex items-center gap-1">
                      <span className="text-slate-300">/</span>
                      <button
                        type="button"
                        className={`truncate font-medium hover:underline ${prefix === browseKey ? 'text-violet-800' : ''}`}
                        onClick={() => goOrMoveToFolder(prefix)}
                      >
                        {part}
                      </button>
                    </span>
                  );
                })}
              </nav>
              <div className="relative w-full max-w-xs sm:w-56">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar em todo o projeto…"
                  className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-xs text-slate-900 outline-none focus:border-violet-400"
                />
              </div>
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-1.5 pl-2 pr-6 text-[10px] font-semibold text-slate-700"
                title="Filtro rápido (opcional)"
              >
                <option value="__all__">Todas ({images.length})</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f === ROOT_TOKEN ? '(raiz)' : f.split('/').join(' / ')}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`relative min-h-0 flex-1 overflow-y-auto p-3 transition-colors ${
                dragOver ? 'bg-violet-50 ring-2 ring-inset ring-violet-300' : 'bg-slate-50/50'
              }`}
              onDragOver={onDropZoneDragOver}
              onDragLeave={onDropZoneDragLeave}
              onDrop={onDropZoneDrop}
            >
              {dragOver ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-violet-400 bg-violet-50/90">
                  <p className="text-sm font-semibold text-violet-900">Largar para carregar</p>
                </div>
              ) : null}

              {uploading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" /> A processar…
                </div>
              ) : (
                <>
                  {!search.trim() && subfoldersInBrowse.length > 0 ? (
                    <div className="mb-4">
                      <p className="mb-2 text-[10px] font-bold uppercase text-slate-400">Pastas</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {subfoldersInBrowse.map((sub) => (
                          <button
                            key={sub.key}
                            type="button"
                            onClick={() => goOrMoveToFolder(sub.key)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-violet-300 hover:bg-violet-50/50"
                          >
                            <Folder className="h-8 w-8 shrink-0 text-amber-500" />
                            <span className="truncate text-sm font-semibold text-slate-800">{sub.segment}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {filesInFolder.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-slate-500">
                      <ImagePlus className="h-10 w-10 text-slate-300" />
                      <p>Nenhuma imagem aqui.</p>
                      <p className="max-w-md text-xs">
                        {search.trim()
                          ? 'Tente outro termo ou limpe a busca.'
                          : 'Arraste imagens para esta área ou use «Escolher ficheiros». O destino é a pasta atual (caminho em cima).'}
                      </p>
                    </div>
                  ) : viewMode === 'icons' ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {filesInFolder.map((imagePath) => {
                        const manageable = canManageMediaFile(imagePath);
                        const busy = deleting === imagePath;
                        const dir = directoryFromImagePath(imagePath);
                        const dirLabel = dir === ROOT_TOKEN ? '(raiz)' : dir;
                        const isMoving = movingPath === imagePath;
                        return (
                          <div
                            key={imagePath}
                            className={`group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md ${
                              isMoving ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelect(imagePath)}
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
                            {manageable ? (
                              <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 shadow-sm transition group-hover:opacity-100">
                                <button
                                  type="button"
                                  title="Mover para outra pasta"
                                  disabled={movingBusy}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMovingPath(imagePath);
                                    toast.message('Modo mover', {
                                      description: 'Clique na pasta de destino na árvore ou numa pasta grande.',
                                    });
                                  }}
                                  className="rounded-md bg-white/95 p-1.5 text-slate-700 ring-1 ring-slate-200 hover:bg-violet-50 hover:text-violet-900 disabled:opacity-50"
                                >
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Apagar do servidor"
                                  disabled={busy}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDelete(imagePath);
                                  }}
                                  className="rounded-md bg-white/95 p-1.5 text-red-600 ring-1 ring-slate-200 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Nome</th>
                            <th className="hidden px-3 py-2 sm:table-cell">Pasta</th>
                            <th className="w-14 px-2 py-2 text-center">Mini</th>
                            <th className="w-24 px-2 py-2 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filesInFolder.map((imagePath) => {
                            const dir = directoryFromImagePath(imagePath);
                            const dirLabel = dir === ROOT_TOKEN ? '(raiz)' : dir;
                            const manageable = canManageMediaFile(imagePath);
                            const busy = deleting === imagePath;
                            return (
                              <tr
                                key={imagePath}
                                className={`border-b border-slate-50 hover:bg-violet-50/40 ${movingPath === imagePath ? 'bg-amber-50/60' : ''}`}
                              >
                                <td className="px-3 py-1.5">
                                  <button
                                    type="button"
                                    className="font-mono text-[11px] font-medium text-violet-800 hover:underline"
                                    onClick={() => onSelect(imagePath)}
                                  >
                                    {fileNameFromPath(imagePath)}
                                  </button>
                                </td>
                                <td className="hidden max-w-[200px] truncate px-3 py-1.5 text-slate-500 sm:table-cell" title={dirLabel}>
                                  {dirLabel}
                                </td>
                                <td className="px-2 py-1">
                                  <button type="button" onClick={() => onSelect(imagePath)} className="mx-auto block h-10 w-10 overflow-hidden rounded border border-slate-100 bg-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imagePath} alt="" className="h-full w-full object-cover" loading="lazy" />
                                  </button>
                                </td>
                                <td className="px-1 py-1 text-center">
                                  {manageable ? (
                                    <div className="flex justify-center gap-1">
                                      <button
                                        type="button"
                                        title="Mover"
                                        disabled={movingBusy}
                                        className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-violet-50 hover:text-violet-900 disabled:opacity-50"
                                        onClick={() => {
                                          setMovingPath(imagePath);
                                          toast.message('Modo mover', { description: 'Clique na pasta de destino.' });
                                        }}
                                      >
                                        <ArrowRightLeft className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        title="Apagar"
                                        disabled={busy}
                                        className="rounded border border-slate-200 p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        onClick={() => void handleDelete(imagePath)}
                                      >
                                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-[10px] text-slate-500">
          Clique numa imagem para escolher · Apagar ou mover ficheiros em <code className="mx-0.5 rounded bg-slate-200 px-1">/images/</code> · Variável{' '}
          <code className="mx-0.5 rounded bg-slate-200 px-1">EDITOR_MAX_UPLOAD_MB</code>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
