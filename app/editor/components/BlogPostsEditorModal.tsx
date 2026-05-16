'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Newspaper, Plus, Trash2, ImageIcon, Languages } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogPostGalleryItem, BlogPostRecord } from '@/lib/blog-posts-shared';
import { isValidBlogSlug } from '@/lib/blog-posts-shared';
import { MediaLibraryModal } from './MediaLibraryModal';
import { BlogRichTextEditor } from './BlogRichTextEditor';
import { BlogTranslateModal } from './BlogTranslateModal';

function clonePosts(posts: BlogPostRecord[]): BlogPostRecord[] {
  return JSON.parse(JSON.stringify(posts)) as BlogPostRecord[];
}

type MediaTarget =
  | { kind: 'cover' }
  | { kind: 'gallery'; index: number }
  | { kind: 'body-image' };

export function BlogPostsEditorModal({
  open,
  onClose,
  locale,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
  /** Chamado após guardar com sucesso (para actualizar baseline de tradução em ES). */
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [fileStatus, setFileStatus] = useState<'draft' | 'published'>('published');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const [translateOpen, setTranslateOpen] = useState(false);
  const insertBodyImageRef = useRef<(url: string) => void>(() => {});

  const bindInsertImage = useCallback((fn: (url: string) => void) => {
    insertBodyImageRef.current = fn;
  }, []);

  const loadMediaImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/editor/media?_=${Date.now()}`, { cache: 'no-store', credentials: 'include' });
      if (!response.ok) return;
      const data = (await response.json()) as { images?: string[] };
      if (Array.isArray(data.images)) setMediaImages(data.images);
    } catch {
      setMediaImages([]);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent(locale)}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error('Não foi possível carregar os artigos do blog.');
        return;
      }
      const data = (await res.json()) as { posts?: BlogPostRecord[]; status?: string };
      const list = Array.isArray(data.posts) ? clonePosts(data.posts) : [];
      setPosts(list);
      setFileStatus(data.status === 'draft' ? 'draft' : 'published');
      setSelectedIdx(0);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    void loadPosts();
    void loadMediaImages();
  }, [open, loadPosts, loadMediaImages]);

  const selected = posts[selectedIdx] ?? null;

  const updateSelected = useCallback(
    (patch: Partial<BlogPostRecord>) => {
      setPosts((prev) => {
        const next = [...prev];
        const cur = next[selectedIdx];
        if (!cur) return prev;
        next[selectedIdx] = { ...cur, ...patch };
        return next;
      });
    },
    [selectedIdx]
  );

  const setFeaturedOnly = useCallback((idx: number) => {
    setPosts((prev) => prev.map((p, i) => ({ ...p, featured: i === idx })));
  }, []);

  const addPost = useCallback(() => {
    setPosts((prev) => {
      const slug = `artigo-${Date.now()}`;
      const featured = prev.length === 0;
      const row: BlogPostRecord = {
        slug,
        title: 'Novo artigo',
        category: 'NOTÍCIAS',
        author: '',
        coverImage: '/images/home/hero-1.png',
        coverImageAlt: '',
        excerpt: '',
        body: '',
        gallery: [],
        featured,
        cta: {
          enabled: false,
          title: '',
          body: '',
          buttonLabel: 'Contacto',
          buttonHref: '/contacto',
        },
      };
      const next = [...prev, row];
      setSelectedIdx(next.length - 1);
      return next;
    });
  }, []);

  const removeSelected = useCallback(() => {
    if (posts.length <= 1) {
      toast.message('É necessário pelo menos um artigo.');
      return;
    }
    setPosts((prev) => {
      const next = prev.filter((_, i) => i !== selectedIdx);
      setSelectedIdx((i) => {
        if (i === selectedIdx) return Math.max(0, Math.min(i, next.length - 1));
        if (i > selectedIdx) return i - 1;
        return i;
      });
      return next;
    });
  }, [posts.length, selectedIdx]);

  const persist = useCallback(
    async (status: 'draft' | 'published') => {
      for (const p of posts) {
        if (!isValidBlogSlug(p.slug)) {
          toast.error(`Slug inválido: "${p.slug}" (use letras minúsculas, números e hífens).`);
          return;
        }
      }
      const slugSet = new Set(posts.map((p) => p.slug));
      if (slugSet.size !== posts.length) {
        toast.error('Cada artigo precisa de um slug único.');
        return;
      }
      setSaving(true);
      try {
        const res = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent(locale)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status, posts }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          toast.error(err.error || 'Erro ao guardar.');
          return;
        }
        const data = (await res.json()) as { status?: string };
        setFileStatus(data.status === 'draft' ? 'draft' : 'published');
        toast.success(status === 'published' ? 'Blog publicado.' : 'Rascunho guardado.');
        onSaved?.();
      } finally {
        setSaving(false);
      }
    },
    [locale, posts, onSaved]
  );

  const openMediaFor = (target: MediaTarget) => {
    setMediaTarget(target);
    setMediaOpen(true);
    void loadMediaImages();
  };

  const onMediaPick = (path: string) => {
    if (!mediaTarget) return;
    if (mediaTarget.kind === 'body-image') {
      insertBodyImageRef.current(path);
    } else if (mediaTarget.kind === 'cover') {
      updateSelected({ coverImage: path });
    } else {
      setPosts((prev) => {
        const next = [...prev];
        const cur = next[selectedIdx];
        if (!cur) return prev;
        const gallery = [...(cur.gallery || [])];
        const row = gallery[mediaTarget.index] || { type: 'image' as const, src: '', alt: '' };
        gallery[mediaTarget.index] = { ...row, type: 'image', src: path };
        next[selectedIdx] = { ...cur, gallery };
        return next;
      });
    }
    setMediaOpen(false);
    setMediaTarget(null);
  };

  const addGalleryRow = () => {
    setPosts((prev) => {
      const next = [...prev];
      const cur = next[selectedIdx];
      if (!cur) return prev;
      const gallery = [...(cur.gallery || []), { type: 'image' as const, src: '', alt: '' }];
      next[selectedIdx] = { ...cur, gallery };
      return next;
    });
  };

  const removeGalleryRow = (index: number) => {
    setPosts((prev) => {
      const next = [...prev];
      const cur = next[selectedIdx];
      if (!cur) return prev;
      const gallery = (cur.gallery || []).filter((_, i) => i !== index);
      next[selectedIdx] = { ...cur, gallery: gallery.length ? gallery : undefined };
      return next;
    });
  };

  const updateGalleryRow = (index: number, patch: Partial<BlogPostGalleryItem>) => {
    setPosts((prev) => {
      const next = [...prev];
      const cur = next[selectedIdx];
      if (!cur) return prev;
      const gallery = [...(cur.gallery || [])];
      const row = gallery[index];
      if (!row) return prev;
      gallery[index] = { ...row, ...patch };
      next[selectedIdx] = { ...cur, gallery };
      return next;
    });
  };

  const hint = useMemo(
    () =>
      'Corpo em HTML (negrito, listas, cores, imagens, links). Use «Tradução / comparar» para gerar PT/EN a partir deste ou de outro idioma — não precisa do menu global «Traduzir».',
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3" role="dialog" aria-modal>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Newspaper className="h-5 w-5 shrink-0 text-emerald-700" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">Artigos do blog</h2>
              <p className="truncate text-[11px] text-slate-600">Idioma: {locale} · ficheiro JSON em public/blog-posts</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={saving}
              onClick={() => void persist('draft')}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Rascunho
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void persist('published')}
              className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Publicar
            </button>
            <button
              type="button"
              onClick={() => setTranslateOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-100"
            >
              <Languages className="h-3.5 w-3.5" />
              Tradução / comparar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200/80"
            >
              Fechar
            </button>
          </div>
        </div>

        <p className="border-b border-slate-100 bg-amber-50/80 px-4 py-2 text-[11px] text-amber-950">
          Estado no servidor: <span className="font-semibold">{fileStatus}</span>. {hint}
        </p>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="flex w-full flex-shrink-0 flex-col border-b border-slate-200 md:w-56 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between border-b border-slate-100 px-2 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lista</span>
              <button
                type="button"
                onClick={addPost}
                className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900"
              >
                <Plus className="h-3 w-3" />
                Novo
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loading ? (
                <p className="p-2 text-xs text-slate-500">A carregar…</p>
              ) : (
                <ul className="space-y-1">
                  {posts.map((p, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setSelectedIdx(i)}
                        className={`flex w-full flex-col rounded-md border px-2 py-1.5 text-left text-[11px] transition ${
                          i === selectedIdx
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                            : 'border-transparent bg-slate-50 text-slate-800 hover:border-slate-200'
                        }`}
                      >
                        <span className="line-clamp-2 font-semibold">{p.title || '(sem título)'}</span>
                        <span className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{p.slug}</span>
                        {p.featured ? (
                          <span className="mt-1 inline-block w-fit rounded bg-amber-100 px-1 py-0 text-[9px] font-bold text-amber-900">
                            Destaque
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {!selected ? (
              <p className="text-sm text-slate-600">Sem artigos.</p>
            ) : (
              <div className="mx-auto max-w-xl space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.featured)}
                      onChange={(e) => {
                        if (e.target.checked) setFeaturedOnly(selectedIdx);
                        else setPosts((prev) => prev.map((p, i) => ({ ...p, featured: i === 0 })));
                      }}
                    />
                    Destaque (aparece em grande na página do blog)
                  </label>
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="ml-auto inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                    Apagar
                  </button>
                </div>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Slug (URL)</span>
                  <input
                    className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    value={selected.slug}
                    onChange={(e) => updateSelected({ slug: e.target.value.trim().toLowerCase() })}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Título</span>
                  <input
                    className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    value={selected.title}
                    onChange={(e) => updateSelected({ title: e.target.value })}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-slate-700">Categoria</span>
                    <input
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      value={selected.category}
                      onChange={(e) => updateSelected({ category: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-slate-700">Autor</span>
                    <input
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      value={selected.author}
                      onChange={(e) => updateSelected({ author: e.target.value })}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Resumo (chapéu)</span>
                  <textarea
                    className="mt-0.5 min-h-[72px] w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    value={selected.excerpt}
                    onChange={(e) => updateSelected({ excerpt: e.target.value })}
                  />
                </label>

                <div>
                  <span className="text-[11px] font-semibold text-slate-700">Imagem de capa</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
                      value={selected.coverImage}
                      onChange={(e) => updateSelected({ coverImage: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => openMediaFor({ kind: 'cover' })}
                      className="inline-flex shrink-0 items-center gap-1 rounded border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-900"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Media
                    </button>
                  </div>
                  <label className="mt-1 block">
                    <span className="text-[10px] text-slate-500">Alt da capa</span>
                    <input
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={selected.coverImageAlt || ''}
                      onChange={(e) => updateSelected({ coverImageAlt: e.target.value })}
                    />
                  </label>
                </div>

                <div className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Corpo do artigo</span>
                  <p className="mb-1 text-[10px] text-slate-500">
                    Use a barra de ferramentas; o ícone de imagem abre a biblioteca de media para inserir no texto.
                  </p>
                  <BlogRichTextEditor
                    key={selected.slug}
                    value={selected.body}
                    onChange={(html) => updateSelected({ body: html })}
                    bindInsertImage={bindInsertImage}
                    onRequestImage={() => {
                      setMediaTarget({ kind: 'body-image' });
                      setMediaOpen(true);
                      void loadMediaImages();
                    }}
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-[11px] font-bold text-slate-800">Banner CTA (fim do artigo)</p>
                  <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.cta?.enabled)}
                      onChange={(e) =>
                        updateSelected({
                          cta: {
                            ...selected.cta,
                            enabled: e.target.checked,
                            title: selected.cta?.title ?? '',
                            body: selected.cta?.body ?? '',
                            buttonLabel: selected.cta?.buttonLabel ?? 'Contacto',
                            buttonHref: selected.cta?.buttonHref ?? '/contacto',
                          },
                        })
                      }
                    />
                    Mostrar CTA no fim da página do artigo
                  </label>
                  <label className="mt-2 block">
                    <span className="text-[10px] font-semibold text-slate-600">Título do CTA</span>
                    <input
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={selected.cta?.title ?? ''}
                      onChange={(e) =>
                        updateSelected({
                          cta: {
                            ...selected.cta,
                            enabled: selected.cta?.enabled ?? false,
                            title: e.target.value,
                            body: selected.cta?.body ?? '',
                            buttonLabel: selected.cta?.buttonLabel ?? '',
                            buttonHref: selected.cta?.buttonHref ?? '/contacto',
                          },
                        })
                      }
                    />
                  </label>
                  <label className="mt-2 block">
                    <span className="text-[10px] font-semibold text-slate-600">Texto do CTA</span>
                    <textarea
                      className="mt-0.5 min-h-[56px] w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={selected.cta?.body ?? ''}
                      onChange={(e) =>
                        updateSelected({
                          cta: {
                            ...selected.cta,
                            enabled: selected.cta?.enabled ?? false,
                            title: selected.cta?.title ?? '',
                            body: e.target.value,
                            buttonLabel: selected.cta?.buttonLabel ?? '',
                            buttonHref: selected.cta?.buttonHref ?? '/contacto',
                          },
                        })
                      }
                    />
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-slate-600">Texto do botão</span>
                      <input
                        className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={selected.cta?.buttonLabel ?? ''}
                        onChange={(e) =>
                          updateSelected({
                            cta: {
                              ...selected.cta,
                              enabled: selected.cta?.enabled ?? false,
                              title: selected.cta?.title ?? '',
                              body: selected.cta?.body ?? '',
                              buttonLabel: e.target.value,
                              buttonHref: selected.cta?.buttonHref ?? '/contacto',
                            },
                          })
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold text-slate-600">Link (ex: /contacto)</span>
                      <input
                        className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                        value={selected.cta?.buttonHref ?? ''}
                        onChange={(e) =>
                          updateSelected({
                            cta: {
                              ...selected.cta,
                              enabled: selected.cta?.enabled ?? false,
                              title: selected.cta?.title ?? '',
                              body: selected.cta?.body ?? '',
                              buttonLabel: selected.cta?.buttonLabel ?? '',
                              buttonHref: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">Galeria (carrossel)</span>
                    <button
                      type="button"
                      onClick={addGalleryRow}
                      className="text-[10px] font-semibold text-emerald-700 hover:underline"
                    >
                      + linha
                    </button>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {(selected.gallery || []).map((g, idx) => (
                      <li key={idx} className="flex flex-wrap items-end gap-2 rounded border border-slate-200 p-2">
                        <input
                          className="min-w-[120px] flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                          value={g.src}
                          onChange={(e) => updateGalleryRow(idx, { src: e.target.value })}
                          placeholder="/images/…"
                        />
                        <input
                          className="min-w-[100px] flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                          value={g.alt || ''}
                          onChange={(e) => updateGalleryRow(idx, { alt: e.target.value })}
                          placeholder="alt"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaFor({ kind: 'gallery', index: idx })}
                          className="rounded border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-900"
                        >
                          Media
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryRow(idx)}
                          className="rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-600"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => {
          setMediaOpen(false);
          setMediaTarget(null);
        }}
        onSelect={onMediaPick}
        images={mediaImages}
        onRefresh={loadMediaImages}
      />

      <BlogTranslateModal
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        defaultSourceLocale={locale}
        onApplied={() => {
          onSaved?.();
          void loadPosts();
        }}
      />
    </div>
  );
}
