'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Languages, X } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogPostRecord } from '@/lib/blog-posts-shared';

const LOCALES = [
  { id: 'es', label: 'Español (ES)' },
  { id: 'pt-BR', label: 'Português (pt-BR)' },
  { id: 'en', label: 'English (EN)' },
] as const;

type Tab = 'translate' | 'compare';

function stripHtmlPreview(html: string, maxLen: number): string {
  const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

export function BlogTranslateModal({
  open,
  onClose,
  defaultSourceLocale,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  defaultSourceLocale: string;
  onApplied?: () => void;
}) {
  const [tab, setTab] = useState<Tab>('translate');
  const [sourceLocale, setSourceLocale] = useState('es');
  const [targetEnabled, setTargetEnabled] = useState<Record<string, boolean>>({
    es: false,
    'pt-BR': true,
    en: true,
  });
  const [mode, setMode] = useState<'missing' | 'all'>('missing');
  const [busy, setBusy] = useState(false);

  const [postsByLocale, setPostsByLocale] = useState<Record<string, BlogPostRecord[]>>({});
  const [compareSlug, setCompareSlug] = useState('');
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (!open) return;
    const key =
      defaultSourceLocale === 'pt-BR' || defaultSourceLocale === 'en' ? defaultSourceLocale : 'es';
    setSourceLocale(key);
  }, [open, defaultSourceLocale]);

  useEffect(() => {
    setTargetEnabled({
      es: sourceLocale !== 'es',
      'pt-BR': sourceLocale !== 'pt-BR',
      en: sourceLocale !== 'en',
    });
  }, [sourceLocale]);

  const loadAllLocales = useCallback(async () => {
    setLoadingCompare(true);
    try {
      const entries = await Promise.all(
        LOCALES.map(async (l) => {
          const res = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent(l.id)}`, {
            cache: 'no-store',
            credentials: 'include',
          });
          if (!res.ok) return [l.id, []] as const;
          const data = (await res.json()) as { posts?: BlogPostRecord[] };
          return [l.id, Array.isArray(data.posts) ? data.posts : []] as const;
        })
      );
      setPostsByLocale(Object.fromEntries(entries));
      const first = entries[0][1][0]?.slug ?? '';
      setCompareSlug((s) => s || first);
    } finally {
      setLoadingCompare(false);
    }
  }, []);

  useEffect(() => {
    if (!open || tab !== 'compare') return;
    void loadAllLocales();
  }, [open, tab, loadAllLocales]);

  const slugOptions = useMemo(() => {
    const src = postsByLocale[sourceLocale] ?? postsByLocale.es ?? [];
    return src.map((p) => p.slug);
  }, [postsByLocale, sourceLocale]);

  const compareRow = useMemo(() => {
    const slug = compareSlug;
    if (!slug) return null;
    const row: Record<string, BlogPostRecord | undefined> = {};
    for (const l of LOCALES) {
      row[l.id] = postsByLocale[l.id]?.find((p) => p.slug === slug);
    }
    return row;
  }, [compareSlug, postsByLocale]);

  const runTranslate = async () => {
    const targets = LOCALES.map((l) => l.id).filter((id) => id !== sourceLocale && targetEnabled[id]);
    if (targets.length === 0) {
      toast.message('Selecione pelo menos um idioma de destino.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/editor/translate-blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceLocale,
          targetLocales: targets,
          mode,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || 'Falha na tradução');
        return;
      }
      toast.success('Tradução guardada (rascunho) nos ficheiros do blog.', {
        description: 'Revise em pt / en no painel «Artigos» ou no separador Comparar.',
      });
      onApplied?.();
      void loadAllLocales();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro de rede');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3" role="dialog" aria-modal>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">Blog — tradução e comparar idiomas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-100 px-3 pt-2">
          <button
            type="button"
            onClick={() => setTab('translate')}
            className={`rounded-t-md px-3 py-2 text-xs font-semibold ${
              tab === 'translate' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Traduzir e guardar
          </button>
          <button
            type="button"
            onClick={() => setTab('compare')}
            className={`rounded-t-md px-3 py-2 text-xs font-semibold ${
              tab === 'compare' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Comparar 3 idiomas
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === 'translate' ? (
            <div className="space-y-4 text-sm text-slate-800">
              <p className="text-xs text-slate-600">
                Não depende do botão «Traduzir» global nem do histórico de alterações. Lê os artigos no idioma de
                origem (ficheiro ou conteúdo por defeito), gera texto nos destinos e grava{' '}
                <code className="rounded bg-slate-100 px-1">posts.pt-BR.json</code> /{' '}
                <code className="rounded bg-slate-100 px-1">posts.en.json</code> como rascunho.
              </p>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Idioma de origem</span>
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"
                  value={sourceLocale}
                  onChange={(e) => setSourceLocale(e.target.value)}
                >
                  {LOCALES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="text-xs font-semibold text-slate-700">Traduzir para</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {LOCALES.filter((l) => l.id !== sourceLocale).map((l) => (
                    <label key={l.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(targetEnabled[l.id])}
                        onChange={(e) =>
                          setTargetEnabled((prev) => ({ ...prev, [l.id]: e.target.checked }))
                        }
                      />
                      {l.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700">Modo</span>
                <div className="mt-2 space-y-2">
                  <label className="flex items-start gap-2 text-xs">
                    <input
                      type="radio"
                      name="tr-mode"
                      checked={mode === 'missing'}
                      onChange={() => setMode('missing')}
                    />
                    <span>
                      <strong>Só preencher vazios</strong> — mantém o que já está escrito no idioma de destino.
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-xs">
                    <input type="radio" name="tr-mode" checked={mode === 'all'} onChange={() => setMode('all')} />
                    <span>
                      <strong>Substituir tudo</strong> — voltar a traduzir todos os campos de texto (use com cuidado).
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void runTranslate()}
                className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {busy ? 'A traduzir…' : 'Traduzir e guardar ficheiros'}
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadAllLocales()}
                  disabled={loadingCompare}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                >
                  {loadingCompare ? 'A carregar…' : 'Recarregar'}
                </button>
                <span className="text-xs text-slate-500">Artigo (slug)</span>
                <select
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  value={compareSlug}
                  onChange={(e) => setCompareSlug(e.target.value)}
                >
                  {slugOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {compareRow ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {LOCALES.map((l) => {
                    const p = compareRow[l.id];
                    return (
                      <div key={l.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                        <p className="text-[10px] font-bold uppercase text-violet-700">{l.label}</p>
                        {!p ? (
                          <p className="mt-2 text-xs text-amber-800">Sem dados (guarde ou traduza para este idioma).</p>
                        ) : (
                          <div className="mt-2 space-y-2 text-xs">
                            <div>
                              <span className="font-semibold text-slate-600">Título</span>
                              <p className="mt-0.5 whitespace-pre-wrap text-slate-900">{p.title || '—'}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-600">Resumo</span>
                              <p className="mt-0.5 whitespace-pre-wrap text-slate-800">{p.excerpt || '—'}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-600">Corpo (pré-visualização)</span>
                              <p className="mt-0.5 text-slate-700">{stripHtmlPreview(p.body || '', 280)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Selecione um slug.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
