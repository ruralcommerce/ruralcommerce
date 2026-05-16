'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Languages, X } from 'lucide-react';
import { toast } from 'sonner';
import type { BlockType, PageSchema } from '@/lib/editor-types';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import {
  listBlockTranslationFieldPaths,
  filterFieldPathsMissingInTarget,
} from '@/lib/block-translate';
import {
  formatTranslationFieldLabel,
  getTranslationTextAt,
  setTranslationTextAt,
} from '@/lib/translation-field-paths';
import {
  fetchTranslationPreview,
  applyApprovedTranslations,
  type TranslationChange,
  type TranslationPreview,
} from '@/lib/translation-utils';
import { TranslationPreviewModal } from './TranslationPreviewModal';

const LOCALES = [
  { id: 'es', label: 'Español (ES)' },
  { id: 'pt-BR', label: 'Português (pt-BR)' },
  { id: 'en', label: 'English (EN)' },
] as const;

type Tab = 'translate' | 'compare';

function textareaRows(text: string): number {
  const lines = (text || '').split('\n').length;
  const approx = Math.ceil((text || '').length / 48);
  return Math.min(8, Math.max(2, lines, approx));
}

async function fetchLayoutJson(slug: string, locale: string): Promise<PageSchema | null> {
  const res = await fetch(
    `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
    { credentials: 'include', cache: 'no-store' }
  );
  if (!res.ok) return null;
  return (await res.json()) as PageSchema;
}

export function BlockTranslateModal({
  open,
  onClose,
  pageSlug,
  blockId,
  blockType,
  editorLocale,
  currentPage,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  pageSlug: string;
  blockId: string;
  blockType: BlockType;
  editorLocale: string;
  currentPage: PageSchema | null;
  onApplied?: (affectedLocales: string[]) => void;
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previews, setPreviews] = useState<TranslationPreview[]>([]);

  const [layoutsByLocale, setLayoutsByLocale] = useState<Record<string, PageSchema | null>>({});
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [dirtyCompareLocales, setDirtyCompareLocales] = useState<Set<string>>(() => new Set());
  const [savingCompare, setSavingCompare] = useState(false);

  useEffect(() => {
    if (!open) return;
    const key =
      editorLocale === 'pt-BR' || editorLocale === 'en' || editorLocale === 'es' ? editorLocale : 'es';
    setSourceLocale(key);
  }, [open, editorLocale]);

  useEffect(() => {
    setTargetEnabled({
      es: sourceLocale !== 'es',
      'pt-BR': sourceLocale !== 'pt-BR',
      en: sourceLocale !== 'en',
    });
  }, [sourceLocale]);

  useEffect(() => {
    if (!open) {
      setPreviewOpen(false);
      setPreviews([]);
      setTab('translate');
      setDirtyCompareLocales(new Set());
    }
  }, [open]);

  const loadSourcePage = useCallback(async (): Promise<PageSchema> => {
    const slugOk = currentPage && (currentPage.slug || '') === pageSlug;
    if (slugOk && editorLocale === sourceLocale && currentPage) {
      return JSON.parse(JSON.stringify(currentPage)) as PageSchema;
    }
    const remote = await fetchLayoutJson(pageSlug, sourceLocale);
    if (!remote) {
      throw new Error(
        `Não foi possível ler o layout em ${sourceLocale}. Guarde a página ou crie o ficheiro deste idioma.`
      );
    }
    return remote;
  }, [currentPage, pageSlug, sourceLocale, editorLocale]);

  const runGeneratePreview = async () => {
    const targets = LOCALES.map((l) => l.id).filter((id) => id !== sourceLocale && targetEnabled[id]);
    if (targets.length === 0) {
      toast.message('Selecione pelo menos um idioma de destino.');
      return;
    }

    setBusy(true);
    try {
      const sourcePage = await loadSourcePage();
      const basePaths = listBlockTranslationFieldPaths(sourcePage, blockId);
      if (!basePaths || basePaths.length === 0) {
        toast.message('Sem texto traduzível neste bloco', {
          description:
            'Preencha títulos, descrições ou listas JSON (ex.: indicadores em statsJson) no idioma de origem e guarde antes de traduzir.',
        });
        return;
      }

      const merged: TranslationPreview[] = [];

      for (const loc of targets) {
        const targetPage = await fetchLayoutJson(pageSlug, loc);
        if (!targetPage) {
          toast.warning(`Layout em falta: ${loc}`, {
            description: `Crie ou sincronize o ficheiro desta página em ${loc} antes de traduzir.`,
          });
          continue;
        }

        const fields =
          mode === 'missing' ? filterFieldPathsMissingInTarget(targetPage, basePaths) : [...basePaths];

        if (fields.length === 0) continue;

        const batch = await fetchTranslationPreview(sourcePage, [loc], fields, sourceLocale);
        merged.push(...batch);
      }

      if (merged.length === 0) {
        toast.message('Nada a traduzir para os destinos', {
          description:
            mode === 'missing'
              ? 'Em «Só vazios», todos os campos já têm texto nos destinos escolhidos. Experimente «Substituir tudo».'
              : 'Verifique os ficheiros de layout dos idiomas de destino.',
        });
        return;
      }

      setPreviews(merged);
      setPreviewOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao gerar traduções');
    } finally {
      setBusy(false);
    }
  };

  const applyBlockTranslations = async (approvedChanges: TranslationChange[]) => {
    const changesByLocale: Record<string, TranslationChange[]> = {};
    for (const c of approvedChanges) {
      if (!changesByLocale[c.targetLocale]) changesByLocale[c.targetLocale] = [];
      changesByLocale[c.targetLocale].push(c);
    }

    const affected = Object.keys(changesByLocale);
    for (const locale of affected) {
      const changes = changesByLocale[locale];
      try {
        const response = await fetch(
          `/api/editor/layouts/${encodeURIComponent(pageSlug)}?locale=${encodeURIComponent(locale)}`,
          { credentials: 'include', cache: 'no-store' }
        );
        if (!response.ok) {
          console.error(`GET layout ${locale}`, await response.text());
          continue;
        }
        const targetLayout = (await response.json()) as PageSchema;
        const updatedLayout = applyApprovedTranslations(targetLayout, changes) as PageSchema;
        const saveResponse = await fetch(
          `/api/editor/layouts/${encodeURIComponent(pageSlug)}?locale=${encodeURIComponent(locale)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              ...updatedLayout,
              status: 'draft',
            }),
          }
        );
        if (!saveResponse.ok) {
          console.error(`PUT layout ${locale}`, await saveResponse.text());
        }
      } catch (err) {
        console.error(`Erro ao aplicar traduções (${locale}):`, err);
      }
    }

    toast.success(`Tradução do bloco aplicada em ${affected.length} idioma(s).`, {
      description: 'Os ficheiros em public/page-layouts foram atualizados.',
    });
    onApplied?.(affected);
    setPreviewOpen(false);
    setPreviews([]);
    onClose();
  };

  const loadCompareLayouts = useCallback(async () => {
    setLoadingCompare(true);
    try {
      const entries = await Promise.all(
        LOCALES.map(async (l) => {
          const slugOk = currentPage && (currentPage.slug || '') === pageSlug;
          if (slugOk && editorLocale === l.id && currentPage) {
            return [l.id, JSON.parse(JSON.stringify(currentPage)) as PageSchema] as const;
          }
          const layout = await fetchLayoutJson(pageSlug, l.id);
          return [l.id, layout] as const;
        })
      );
      setLayoutsByLocale(Object.fromEntries(entries));
      setDirtyCompareLocales(new Set());
    } finally {
      setLoadingCompare(false);
    }
  }, [pageSlug, currentPage, editorLocale]);

  useEffect(() => {
    if (!open || tab !== 'compare') return;
    void loadCompareLayouts();
  }, [open, tab, loadCompareLayouts]);

  const compareFields = useMemo(() => {
    const paths = new Set<string>();
    if (currentPage) {
      for (const p of listBlockTranslationFieldPaths(currentPage, blockId) ?? []) paths.add(p);
    }
    for (const l of LOCALES) {
      const layout = layoutsByLocale[l.id];
      if (!layout) continue;
      for (const p of listBlockTranslationFieldPaths(layout, blockId) ?? []) paths.add(p);
    }
    return Array.from(paths);
  }, [currentPage, blockId, layoutsByLocale]);

  const updateCompareCell = (localeId: string, field: string, text: string) => {
    setLayoutsByLocale((prev) => {
      const layout = prev[localeId];
      if (!layout) return prev;
      const next = JSON.parse(JSON.stringify(layout)) as PageSchema;
      setTranslationTextAt(next, field, text);
      return { ...prev, [localeId]: next };
    });
    setDirtyCompareLocales((prev) => {
      const n = new Set(prev);
      n.add(localeId);
      return n;
    });
  };

  const saveCompareEdits = async () => {
    if (dirtyCompareLocales.size === 0) return;
    setSavingCompare(true);
    const saved: string[] = [];
    try {
      for (const locale of dirtyCompareLocales) {
        const layout = layoutsByLocale[locale];
        if (!layout) continue;
        const saveResponse = await fetch(
          `/api/editor/layouts/${encodeURIComponent(pageSlug)}?locale=${encodeURIComponent(locale)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...layout, status: 'draft' }),
          }
        );
        if (!saveResponse.ok) {
          toast.error(`Não foi possível guardar ${locale}`);
          continue;
        }
        saved.push(locale);
      }
      if (saved.length > 0) {
        toast.success(`Alterações guardadas (${saved.join(', ')}).`);
        setDirtyCompareLocales((prev) => {
          const n = new Set(prev);
          for (const loc of saved) n.delete(loc);
          return n;
        });
        onApplied?.(saved);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao guardar');
    } finally {
      setSavingCompare(false);
    }
  };

  const handleOuterClose = () => {
    if (previewOpen) {
      setPreviewOpen(false);
      setPreviews([]);
      return;
    }
    onClose();
  };

  if (!open) return null;

  const blockLabel = BLOCK_LIBRARY[blockType]?.label ?? blockType;

  return (
    <>
      <div
        className="fixed inset-0 z-[88] flex items-center justify-center bg-black/45 p-3"
        role="dialog"
        aria-modal
      >
        <div
          className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ${
            tab === 'compare' ? 'max-w-[min(96vw,1280px)]' : 'max-w-3xl'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Languages className="h-5 w-5 shrink-0 text-violet-600" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900">Bloco — tradução explícita</h2>
                <p className="truncate text-[11px] text-slate-600">{blockLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOuterClose}
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
                  Não usa o botão «Traduzir» global nem o histórico de alterações. Escolhe o idioma de origem, os
                  destinos e o modo; só este bloco (mesmo <code className="rounded bg-slate-100 px-1">id</code>) é
                  atualizado nos ficheiros de layout.
                </p>
                <p className="text-[11px] text-slate-500">
                  Se o idioma de origem for o mesmo que o editor tem aberto, usa o rascunho na memória (inclui alterações
                  não guardadas). Outro idioma lê sempre do disco — guarde antes se precisar dessa versão.
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
                      <label key={l.id} className="inline-flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={Boolean(targetEnabled[l.id])}
                          onChange={(e) =>
                            setTargetEnabled((prev) => ({
                              ...prev,
                              [l.id]: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300"
                        />
                        {l.label}
                      </label>
                    ))}
                  </div>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold text-slate-700">Modo</legend>
                  <label className="flex cursor-pointer items-start gap-2 text-xs">
                    <input
                      type="radio"
                      name="block-tr-mode"
                      checked={mode === 'missing'}
                      onChange={() => setMode('missing')}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-slate-800">Só campos vazios no destino</span>
                      <span className="mt-0.5 block text-slate-600">Não sobrescreve texto já preenchido noutro idioma.</span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 text-xs">
                    <input
                      type="radio"
                      name="block-tr-mode"
                      checked={mode === 'all'}
                      onChange={() => setMode('all')}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-slate-800">Substituir tudo</span>
                      <span className="mt-0.5 block text-slate-600">Volta a gerar todos os campos de cópia deste bloco nos destinos.</span>
                    </span>
                  </label>
                </fieldset>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runGeneratePreview()}
                  className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                >
                  {busy ? 'A gerar…' : 'Gerar pré-visualização e rever…'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-800">
                <p className="text-xs text-slate-600">
                  Edite o texto em cada idioma lado a lado. Use <strong>Guardar alterações</strong> para gravar nos
                  ficheiros de layout.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void loadCompareLayouts()}
                    disabled={loadingCompare}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 disabled:opacity-50"
                  >
                    {loadingCompare ? 'A recarregar…' : 'Recarregar do disco'}
                  </button>
                  <button
                    type="button"
                    disabled={savingCompare || dirtyCompareLocales.size === 0}
                    onClick={() => void saveCompareEdits()}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {savingCompare
                      ? 'A guardar…'
                      : dirtyCompareLocales.size > 0
                        ? `Guardar alterações (${dirtyCompareLocales.size})`
                        : 'Guardar alterações'}
                  </button>
                  {dirtyCompareLocales.size > 0 ? (
                    <span className="text-[11px] text-amber-800">Alterações por guardar</span>
                  ) : null}
                </div>
                {loadingCompare ? (
                  <p className="text-xs text-slate-500">A carregar…</p>
                ) : compareFields.length === 0 ? (
                  <p className="text-xs text-slate-500">Sem campos traduzíveis neste bloco.</p>
                ) : (
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full min-w-[720px] border-collapse text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="w-[140px] p-2 font-semibold text-slate-700">Campo</th>
                          {LOCALES.map((l) => (
                            <th key={l.id} className="min-w-[200px] p-2 font-semibold text-slate-700">
                              {l.id}
                              {dirtyCompareLocales.has(l.id) ? (
                                <span className="ml-1 font-normal text-amber-700">•</span>
                              ) : null}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compareFields.slice(0, 64).map((field) => (
                          <tr key={field} className="border-b border-slate-100 align-top">
                            <td className="p-2 font-mono text-[10px] text-slate-600">
                              {formatTranslationFieldLabel(field)}
                            </td>
                            {LOCALES.map((l) => {
                              const layout = layoutsByLocale[l.id];
                              const value = layout ? getTranslationTextAt(layout, field) ?? '' : '';
                              const missing = !layout;
                              return (
                                <td key={l.id} className="p-2">
                                  {missing ? (
                                    <span className="text-slate-400">—</span>
                                  ) : (
                                    <textarea
                                      value={value}
                                      rows={textareaRows(value)}
                                      onChange={(e) => updateCompareCell(l.id, field, e.target.value)}
                                      onKeyDown={(e) => e.stopPropagation()}
                                      className={`w-full min-w-[180px] resize-y rounded border bg-white p-2 text-[11px] leading-snug text-slate-900 ${
                                        dirtyCompareLocales.has(l.id)
                                          ? 'border-amber-300 ring-1 ring-amber-100'
                                          : 'border-slate-300'
                                      }`}
                                      placeholder="(vazio)"
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TranslationPreviewModal
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviews([]);
        }}
        previews={previews}
        onApprove={(approved) => void applyBlockTranslations(approved)}
        isTranslating={false}
        sourceLocale={sourceLocale}
        overlayClassName="z-[95]"
      />
    </>
  );
}
