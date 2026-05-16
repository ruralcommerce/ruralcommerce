'use client';

/**
 * EditorLayout - Layout principal do editor
 * Combina BlockPanel, Canvas e PropertyEditor
 */

import { useEditorStore } from '@/lib/editor-store';
import { BlockNavigatorSelect } from './BlockNavigatorSelect';
import { BlockPanel } from './BlockPanel';
import { Canvas } from './Canvas';
import { CanvasListChrome } from './CanvasListChrome';
import { SelectionDesignBar } from './SelectionDesignBar';
import { PropertyEditor } from './PropertyEditor';
import { PageSelector } from './PageSelector';
import { LocaleSelector } from './LocaleSelector';
import { TranslationPreviewModal } from './TranslationPreviewModal';
import { PublishScopeModal, type PublishScopeSelection } from './PublishScopeModal';
import { BlogPostsEditorModal } from './BlogPostsEditorModal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Languages,
  LayoutGrid,
  LayoutTemplate,
  Redo2,
  SlidersHorizontal,
  Undo2,
  Newspaper,
} from 'lucide-react';
import { PageSchema } from '@/lib/editor-types';
import { isInvalidJsonProp } from '@/lib/json-prop-validation';
import { createDefaultLayoutForPage, getEditorPageConfig } from '@/lib/editor-pages';
import { detectTextChanges, fetchTranslationPreview, applyApprovedTranslations, TranslationPreview, TranslationChange } from '@/lib/translation-utils';
import { blogPostsToEnvelope, applyApprovedBlogTranslations } from '@/lib/blog-translation';
import type { BlogPostRecord } from '@/lib/blog-posts-shared';
import { applyStructureSyncFromSource } from '@/lib/structure-sync-utils';
import { locales as editorLocales } from '@/i18n/request';
import { toast } from 'sonner';
import { useEditorCanvasShortcuts } from '../hooks/useEditorCanvasShortcuts';

function hasInvalidJsonProps(page: PageSchema | null): boolean {
  if (!page) return false;

  return page.blocks.some((block) =>
    Object.entries(block.props).some(([key, value]) => isInvalidJsonProp(key, value))
  );
}

export function EditorLayout({
  currentPageSlug = 'homepage',
  currentLocale = 'es',
  onPageChange,
  onLocaleChange,
}: {
  currentPageSlug?: string;
  currentLocale?: string;
  onPageChange?: (slug: string) => void;
  onLocaleChange?: (locale: string) => void;
} = {}) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const syncPageFromPersist = useEditorStore((s) => s.syncPageFromPersist);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const translationBaselinePage = useEditorStore((s) => s.translationBaselinePage);
  const translationBaselineKey = useEditorStore((s) => s.translationBaselineKey);
  const setTranslationBaseline = useEditorStore((s) => s.setTranslationBaseline);
  const setIsDirty = useEditorStore((s) => s.setIsDirty);
  const isDirty = useEditorStore((s) => s.isDirty);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const canvasDirectEdit = useEditorStore((s) => s.canvasDirectEdit);
  const setCanvasDirectEdit = useEditorStore((s) => s.setCanvasDirectEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'blocks' | 'properties'>('blocks');
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [previewTick, setPreviewTick] = useState(0);
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishingBulk, setIsPublishingBulk] = useState(false);
  const [isSyncingLayout, setIsSyncingLayout] = useState(false);
  const [translationPreviews, setTranslationPreviews] = useState<TranslationPreview[]>([]);
  const [isGeneratingTranslations, setIsGeneratingTranslations] = useState(false);
  const [centerTab, setCenterTab] = useState<'preview' | 'blocks'>('preview');
  const [previewFrame, setPreviewFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [blogPostsModalOpen, setBlogPostsModalOpen] = useState(false);
  const [blogEnvelopeBaseline, setBlogEnvelopeBaseline] = useState<unknown>(null);

  const refreshBlogEnvelopeBaselineEs = useCallback(async () => {
    try {
      const res = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent('es')}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = (await res.json()) as { posts?: unknown };
      const posts = Array.isArray(data.posts) ? data.posts : [];
      setBlogEnvelopeBaseline(blogPostsToEnvelope(posts as BlogPostRecord[]));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (currentPageSlug !== 'blog' || currentLocale !== 'es') {
      setBlogEnvelopeBaseline(null);
      return;
    }
    void refreshBlogEnvelopeBaselineEs();
  }, [currentPageSlug, currentLocale, refreshBlogEnvelopeBaselineEs]);
  useEditorCanvasShortcuts(centerTab === 'blocks');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const maisMenuRef = useRef<HTMLDetailsElement>(null);
  const invalidJson = hasInvalidJsonProps(currentPage);
  const canUndo = historyIndex > 0;
  const canRedo = historyLength > 0 && historyIndex < historyLength - 1;
  const pageConfig = getEditorPageConfig(currentPageSlug);

  const previewUrl = `/${currentLocale}${pageConfig.previewPath}?preview=draft&key=rural-preview&t=${previewTick}`;

  const baselineKeyForPage = `${currentPageSlug}:${currentLocale}`;
  const esTranslationChangeCount = useMemo(() => {
    if (currentLocale !== 'es' || !translationBaselinePage || !currentPage) return 0;
    if (translationBaselineKey !== baselineKeyForPage) return 0;
    return detectTextChanges(translationBaselinePage, currentPage).length;
  }, [baselineKeyForPage, currentLocale, currentPage, translationBaselineKey, translationBaselinePage]);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem('editor-sidebar-width');
    const savedCollapsed = window.localStorage.getItem('editor-sidebar-collapsed');

    if (savedWidth) {
      const parsedWidth = Number(savedWidth);
      if (!Number.isNaN(parsedWidth)) {
        setSidebarWidth(Math.min(520, Math.max(280, parsedWidth)));
      }
    }

    if (savedCollapsed === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('editor-sidebar-width', String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    window.localStorage.setItem('editor-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const onMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(520, Math.max(280, event.clientX));
      setSidebarWidth(nextWidth);
      setSidebarCollapsed(false);
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizingSidebar]);

  const persistLayout = async (status: 'draft' | 'published') => {
    if (!currentPage) {
      return null;
    }

    const payload = {
      ...currentPage,
      locale: currentLocale,
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : currentPage.publishedAt,
    };

    const response = await fetch(`/api/editor/layouts/${currentPage.slug}?locale=${encodeURIComponent(currentLocale)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar layout');
    }

    const updated = (await response.json()) as PageSchema & {
      _sync?: { git: string; message?: string };
    };
    const { _sync, ...pagePayload } = updated;
    syncPageFromPersist(pagePayload as PageSchema);
    setPreviewTick((value) => value + 1);
    if (_sync?.git === 'failed' && _sync.message) {
      toast.warning('Layout salvo no servidor, mas o envio para o Git falhou.', {
        description: _sync.message,
        duration: 20000,
      });
    }
    return pagePayload as PageSchema;
  };

  const syncStructureToOtherLocales = async () => {
    if (!currentPage) return;
    if (invalidJson) {
      toast.error('JSON inválido', { description: 'Corrija antes de sincronizar o layout.' });
      return;
    }

    const slug = currentPage.slug || currentPageSlug;
    const targets = editorLocales.filter((l) => l !== currentLocale);
    if (targets.length === 0) {
      toast.message('Nada a sincronizar', { description: 'Só há um idioma na configuração.' });
      return;
    }

    const ok = window.confirm(
      `Atualizar estrutura desta página em ${targets.join(' e ')} a partir do idioma aberto (${currentLocale})?\n\n` +
        'Serão copiados: cores, imagens, URLs de botões, hrefs do menu/rodapé (sem trocar os textos já traduzidos nos outros idiomas). ' +
        'Links internos com /es/... no JSON serão normalizados para rota sem prefixo de idioma.'
    );
    if (!ok) return;

    setIsSyncingLayout(true);
    const savedOk: string[] = [];
    const errors: string[] = [];
    const allWarnings: string[] = [];

    try {
      for (const loc of targets) {
        try {
          const res = await fetch(
            `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(loc)}`
          );
          let target: PageSchema;
          if (res.ok) {
            const raw = (await res.json()) as PageSchema & { _sync?: unknown };
            const { _sync: _r, ...rest } = raw;
            void _r;
            target = rest as PageSchema;
          } else if (res.status === 404) {
            const postRes = await fetch(
              `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(loc)}`,
              { method: 'POST' }
            );
            const postText = await postRes.text();
            if (!postRes.ok) {
              let detail = postText.slice(0, 180);
              try {
                const j = JSON.parse(postText) as { error?: string };
                if (typeof j.error === 'string') detail = j.error;
              } catch {
                /* manter detail */
              }
              errors.push(`${loc}: ${detail}`);
              continue;
            }
            let created: PageSchema & { _sync?: { git: string; message?: string } };
            try {
              created = JSON.parse(postText) as PageSchema & { _sync?: { git: string; message?: string } };
            } catch {
              errors.push(`${loc}: resposta inválida ao criar layout`);
              continue;
            }
            if (created._sync?.git === 'failed' && created._sync.message) {
              errors.push(`${loc} — Git (criação): ${created._sync.message}`);
            }
            const { _sync: _ig, ...crest } = created;
            void _ig;
            target = crest as PageSchema;
          } else {
            errors.push(`${loc}: leitura falhou (HTTP ${res.status})`);
            continue;
          }

          const statusBefore = target.status;
          const publishedAtBefore = target.publishedAt;
          const createdAtBefore = target.createdAt;
          const nameBefore = target.name;
          const titleBefore = target.title;

          const { page: merged, warnings } = applyStructureSyncFromSource(currentPage, target);
          allWarnings.push(...warnings.map((w) => `${loc}: ${w}`));

          const putBody = {
            ...merged,
            locale: loc,
            status: statusBefore,
            publishedAt: publishedAtBefore,
            createdAt: createdAtBefore,
            name: nameBefore,
            title: titleBefore,
          };

          const put = await fetch(
            `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(loc)}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(putBody),
            }
          );
          if (!put.ok) {
            errors.push(`${loc}: ${(await put.text()).slice(0, 160)}`);
            continue;
          }
          const updated = (await put.json()) as PageSchema & {
            _sync?: { git: string; message?: string };
          };
          if (updated._sync?.git === 'failed' && updated._sync.message) {
            errors.push(`${loc} — Git: ${updated._sync.message}`);
          }
          savedOk.push(loc);
        } catch (e) {
          errors.push(`${loc}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      if (savedOk.length > 0) {
        toast.success(`Estrutura sincronizada: ${savedOk.join(', ')}.`, {
          description:
            'Cores, imagens e rotas internas alinhadas; textos e labels dos outros idiomas foram preservados nos JSON.',
          duration: 10000,
        });
      }
      if (allWarnings.length > 0) {
        toast.warning('Avisos na sincronização', {
          description: allWarnings.slice(0, 8).join('\n') + (allWarnings.length > 8 ? '\n…' : ''),
          duration: 14000,
        });
      }
      if (errors.length > 0) {
        toast.error('Alguns idiomas falharam', {
          description: errors.slice(0, 8).join('\n'),
          duration: 16000,
        });
      } else if (savedOk.length === 0 && allWarnings.length === 0) {
        toast.message('Nada foi salvo.');
      }
    } finally {
      setIsSyncingLayout(false);
    }
  };

  const runBulkPublish = async (scope: PublishScopeSelection) => {
    const pairs: { slug: string; locale: string }[] = [];
    for (const slug of scope.pageSlugs) {
      for (const locale of scope.locales) {
        pairs.push({ slug, locale });
      }
    }

    const touchesCurrent =
      currentPage &&
      pairs.some((p) => p.slug === (currentPage.slug || currentPageSlug) && p.locale === currentLocale);

    if (touchesCurrent && invalidJson) {
      toast.error('JSON inválido', {
        description: 'Corrija os campos na página atual antes de publicar.',
      });
      return;
    }

    setIsPublishingBulk(true);
    const failures: string[] = [];
    const successes: string[] = [];
    let autoCreatedLayouts = 0;
    let lastCurrentPayload: PageSchema | null = null;
    const publishedAt = new Date().toISOString();

    try {
      for (const { slug, locale } of pairs) {
        try {
          const isCurrent = currentPage && slug === (currentPage.slug || currentPageSlug) && locale === currentLocale;

          let payload: PageSchema;
          if (isCurrent && currentPage) {
            payload = {
              ...currentPage,
              locale,
              status: 'published',
              publishedAt,
              updatedAt: new Date().toISOString(),
            };
          } else {
            const res = await fetch(
              `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`
            );
            let source: PageSchema;

            if (res.ok) {
              source = (await res.json()) as PageSchema;
            } else if (res.status === 404) {
              const postRes = await fetch(
                `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
                { method: 'POST' }
              );
              const postText = await postRes.text();
              if (!postRes.ok) {
                let detail = postText.slice(0, 200);
                try {
                  const errJson = JSON.parse(postText) as { error?: string };
                  if (typeof errJson.error === 'string') detail = errJson.error;
                } catch {
                  /* usar postText */
                }
                failures.push(`${slug} / ${locale}: criar layout — ${detail}`);
                continue;
              }
              let created: PageSchema & { _sync?: { git: string; message?: string } };
              try {
                created = JSON.parse(postText) as PageSchema & { _sync?: { git: string; message?: string } };
              } catch {
                failures.push(`${slug} / ${locale}: resposta inválida ao criar layout.`);
                continue;
              }
              if (created._sync?.git === 'failed' && created._sync.message) {
                failures.push(`${slug} / ${locale} — Git (criação): ${created._sync.message}`);
              }
              const { _sync: _ignored, ...rest } = created;
              void _ignored;
              source = rest as PageSchema;
              autoCreatedLayouts += 1;
            } else {
              failures.push(`${slug} / ${locale}: leitura falhou (HTTP ${res.status}).`);
              continue;
            }

            payload = {
              ...source,
              locale,
              status: 'published',
              publishedAt,
              updatedAt: new Date().toISOString(),
            };
          }

          const put = await fetch(
            `/api/editor/layouts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (!put.ok) {
            const txt = await put.text();
            failures.push(`${slug} / ${locale}: ${txt.slice(0, 120)}`);
            continue;
          }

          const updated = (await put.json()) as PageSchema & {
            _sync?: { git: string; message?: string };
          };
          const { _sync, ...pagePayload } = updated;
          successes.push(`${slug} (${locale})`);
          if (_sync?.git === 'failed' && _sync.message) {
            failures.push(`${slug} / ${locale} — Git: ${_sync.message}`);
          }
          if (slug === currentPageSlug && locale === currentLocale) {
            lastCurrentPayload = pagePayload as PageSchema;
          }
        } catch (e) {
          failures.push(`${slug} / ${locale}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      if (lastCurrentPayload) {
        syncPageFromPersist(lastCurrentPayload);
        setPreviewTick((t) => t + 1);
      }

      if (successes.length === 0) {
        toast.error('Nenhuma publicação concluída.', {
          description: failures.length
            ? failures.slice(0, 16).join('\n') + (failures.length > 16 ? '\n…' : '')
            : 'Verifique a consola e tente novamente.',
          duration: 22000,
        });
      } else {
        toast.success(`Publicado(s): ${successes.length} de ${pairs.length}.`, {
          description: [
            autoCreatedLayouts > 0
              ? `${autoCreatedLayouts} ficheiro(s) criado(s) a partir de outro idioma/modelo.`
              : null,
            successes.length <= 8 ? `OK: ${successes.join(', ')}` : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined,
          duration: 9000,
        });
        if (failures.length > 0) {
          toast.warning(`Avisos ou falhas: ${failures.length}`, {
            description: failures.slice(0, 14).join('\n') + (failures.length > 14 ? '\n…' : ''),
            duration: 22000,
          });
        }
      }
    } finally {
      setIsPublishingBulk(false);
      setPublishModalOpen(false);
    }
  };

  // Função para gerar preview das traduções
  const generateTranslationPreviews = async () => {
    if (currentLocale !== 'es') {
      toast.info('Tradução assistida só está disponível com o idioma do editor em Español (ES).');
      return;
    }

    if (currentPageSlug === 'blog') {
      if (!blogEnvelopeBaseline) {
        toast.warning('Baseline do blog (ES) ainda não carregou.', {
          description: 'Recarregue o editor ou aguarde um momento.',
        });
        return;
      }

      setIsGeneratingTranslations(true);
      try {
        const res = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent('es')}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Não foi possível ler o blog em ES.');
        }
        const data = (await res.json()) as { posts?: unknown };
        const currentEnv = blogPostsToEnvelope(Array.isArray(data.posts) ? (data.posts as BlogPostRecord[]) : []);
        const changedFields = detectTextChanges(blogEnvelopeBaseline, currentEnv);

        if (changedFields.length === 0) {
          toast.message('Sem alterações de texto no blog', {
            description: 'Guarde o painel «Artigos» em ES se fez alterações.',
          });
          return;
        }

        const previews = await fetchTranslationPreview(currentEnv, ['pt-BR', 'en'], changedFields);
        setTranslationPreviews(previews);
        setTranslationModalOpen(true);
      } catch (error) {
        console.error('Erro ao gerar previews de tradução (blog):', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao gerar traduções. Verifique o console.');
      } finally {
        setIsGeneratingTranslations(false);
      }
      return;
    }

    const baselineKey = `${currentPageSlug}:${currentLocale}`;
    if (!currentPage || !translationBaselinePage || translationBaselineKey !== baselineKey) {
      if (!translationBaselinePage) {
        toast.warning('Baseline de tradução ainda não carregou.', {
          description: 'Recarregue a página do editor.',
        });
      }
      return;
    }

    setIsGeneratingTranslations(true);
    try {
      const changedFields = detectTextChanges(translationBaselinePage, currentPage);

      if (changedFields.length === 0) {
        toast.message('Sem alterações de texto', {
          description: 'Nada mudou em relação ao último carregamento desta página em ES.',
        });
        return;
      }

      const previews = await fetchTranslationPreview(currentPage, ['pt-BR', 'en'], changedFields);

      setTranslationPreviews(previews);
      setTranslationModalOpen(true);
    } catch (error) {
      console.error('Erro ao gerar previews de tradução:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar traduções. Verifique o console.');
    } finally {
      setIsGeneratingTranslations(false);
    }
  };

  // Função para aplicar traduções aprovadas
  const applyApprovedTranslationsToLayouts = async (approvedChanges: TranslationChange[]) => {
    const changesByLocale: Record<string, TranslationChange[]> = {};
    approvedChanges.forEach((change) => {
      if (!changesByLocale[change.targetLocale]) {
        changesByLocale[change.targetLocale] = [];
      }
      changesByLocale[change.targetLocale].push(change);
    });

    if (currentPageSlug === 'blog') {
      try {
        for (const [locale, changes] of Object.entries(changesByLocale)) {
          try {
            const response = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent(locale)}`, {
              credentials: 'include',
              cache: 'no-store',
            });
            if (!response.ok) continue;

            const store = await response.json();
            const merged = applyApprovedBlogTranslations(store, changes);

            const saveResponse = await fetch(`/api/editor/blog-posts?locale=${encodeURIComponent(locale)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'draft',
                posts: merged.posts,
              }),
            });

            if (!saveResponse.ok) {
              console.error(`Erro ao salvar blog ${locale}:`, await saveResponse.text());
            }
          } catch (error) {
            console.error(`Erro ao processar traduções do blog para ${locale}:`, error);
          }
        }

        toast.success(`Tradução do blog aplicada em ${Object.keys(changesByLocale).length} idioma(s).`);
        await refreshBlogEnvelopeBaselineEs();
      } catch (error) {
        console.error('Erro ao aplicar traduções (blog):', error);
        toast.error('Erro ao aplicar traduções do blog. Verifique o console.');
      }
      return;
    }

    if (!currentPage) return;

    try {
      // Para cada locale, carrega o layout atual, aplica as mudanças e salva
      for (const [locale, changes] of Object.entries(changesByLocale)) {
        try {
          // Carrega o layout atual do locale
          const response = await fetch(`/api/editor/layouts/${currentPage.slug}?locale=${encodeURIComponent(locale)}`);
          if (!response.ok) continue;

          const targetLayout = await response.json();

          // Aplica as traduções aprovadas
          const updatedLayout = applyApprovedTranslations(targetLayout, changes) as PageSchema;

          // Salva o layout atualizado
          const saveResponse = await fetch(`/api/editor/layouts/${currentPage.slug}?locale=${encodeURIComponent(locale)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...updatedLayout,
              status: 'draft',
            }),
          });

          if (!saveResponse.ok) {
            console.error(`Erro ao salvar layout ${locale}:`, await saveResponse.text());
          }
        } catch (error) {
          console.error(`Erro ao processar traduções para ${locale}:`, error);
        }
      }

      toast.success(`Tradução aplicada em ${Object.keys(changesByLocale).length} idioma(s).`);

      const page = useEditorStore.getState().currentPage;
      if (page && currentLocale === 'es') {
        setTranslationBaseline(`${currentPageSlug}:${currentLocale}`, JSON.parse(JSON.stringify(page)) as PageSchema);
      }
    } catch (error) {
      console.error('Erro ao aplicar traduções:', error);
      toast.error('Erro ao aplicar traduções. Verifique o console.');
    }
  };

  useEffect(() => {
    if (!currentPage || !isDirty || invalidJson || isSaving || isSyncingLayout || isPublishingBulk) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        setAutoSaveError(null);
        await persistLayout('draft');
      } catch {
        setAutoSaveError('Falha no autosave. Use o botao Salvar.');
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentPage, isDirty, invalidJson, isSaving, isSyncingLayout, isPublishingBulk]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const direct = e.target as HTMLElement | null;
      const active = document.activeElement as HTMLElement | null;
      const typing =
        (direct &&
          (direct.closest('[contenteditable="true"]') ||
            direct.tagName === 'INPUT' ||
            direct.tagName === 'TEXTAREA' ||
            direct.tagName === 'SELECT' ||
            direct.isContentEditable)) ||
        (active &&
          (active.closest('[contenteditable="true"]') ||
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable));
      if (typing) {
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentPage) {
      return;
    }

    const mapToBlockType = (value: string | null): string | null => {
      if (!value) return null;

      const normalized = value.toLowerCase();
      const aliases: Record<string, string> = {
        hero: 'hero-section',
        sistema: 'system-section',
        system: 'system-section',
        segmentos: 'segments-section',
        segments: 'segments-section',
        soluciones: 'solutions-section',
        solucoes: 'solutions-section',
        numeros: 'stats-section',
        stats: 'stats-section',
        parceiros: 'partners-section',
        partners: 'partners-section',
        'site-header': 'site-header',
        'site-footer': 'site-footer',
        'contact-hero': 'contact-hero-split',
        'contact-form': 'contact-form-split',
        'contact-map': 'contact-map-split',
        'contact-social': 'contact-social-strip',
        'blog-featured': 'blog-featured',
        'blog-posts': 'blog-posts-grid',
        'blog-posts-grid': 'blog-posts-grid',
      };

      if (normalized in aliases) {
        return aliases[normalized];
      }

      return normalized;
    };

    const getInspectableAreas = (doc: Document): HTMLElement[] => {
      return Array.from(
        doc.querySelectorAll('[data-editor-block-id], [data-editor-section], main section')
      ) as HTMLElement[];
    };

    const bindInspector = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const styleTag = doc.createElement('style');
        styleTag.setAttribute('data-editor-inspector-style', 'true');
        styleTag.textContent =
          '[data-editor-selected="true"]{outline:3px solid #2563eb;outline-offset:-2px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.45);}';
        doc.head.appendChild(styleTag);

        const onClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement | null;
          if (!target) return;

          const sectionEl = target.closest(
            '[data-editor-block-id], [data-editor-section], section[id], header, footer'
          ) as HTMLElement | null;
          if (!sectionEl) return;

          event.preventDefault();
          event.stopPropagation();

          const blockIdAttr = sectionEl.getAttribute('data-editor-block-id');
          if (blockIdAttr) {
            const byId = currentPage.blocks.find((b) => b.id === blockIdAttr);
            if (byId) {
              selectBlock(byId.id);
              setSidebarMode('properties');
              return;
            }
          }

          const explicit = sectionEl.getAttribute('data-editor-section');
          const fallback = sectionEl.getAttribute('id');
          const blockType = mapToBlockType(explicit || fallback);
          let matchedBlock = blockType
            ? currentPage.blocks.find((block) => block.type === blockType)
            : undefined;

          if (!matchedBlock) {
            const sections = getInspectableAreas(doc);
            const sectionIndex = sections.findIndex((section) => section === sectionEl);
            if (sectionIndex >= 0) {
              matchedBlock = currentPage.blocks[sectionIndex];
            }
          }

          if (!matchedBlock) return;

          selectBlock(matchedBlock.id);
          setSidebarMode('properties');
        };

        doc.addEventListener('click', onClick, true);

        return () => {
          doc.removeEventListener('click', onClick, true);
          styleTag.remove();
        };
      } catch {
        return;
      }
    };

    const cleanup = bindInspector();
    iframe.addEventListener('load', bindInspector);

    return () => {
      if (cleanup) cleanup();
      iframe.removeEventListener('load', bindInspector);
    };
  }, [currentPage, previewTick, selectBlock]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc || !currentPage) {
      return;
    }

    const mapBlockTypeToSectionSelector: Record<string, string> = {
      'site-header': '[data-editor-section="site-header"]',
      'hero-section': '[data-editor-section="hero-section"]',
      'system-section': '[data-editor-section="system-section"]',
      'segments-section': '[data-editor-section="segments-section"]',
      'solutions-section': '[data-editor-section="solutions-section"]',
      'stats-section': '[data-editor-section="stats-section"]',
      'partners-section': '[data-editor-section="partners-section"]',
      'site-footer': '[data-editor-section="site-footer"]',
      'contact-hero-split': '[data-editor-section="contact-hero"]',
      'contact-form-split': '[data-editor-section="contact-form"]',
      'contact-map-split': '[data-editor-section="contact-map"]',
      'contact-social-strip': '[data-editor-section="contact-social"]',
      'blog-featured': '[data-editor-section="blog-featured"]',
      'blog-posts-grid': '[data-editor-section="blog-posts-grid"]',
    };

    const sections = Array.from(
      doc.querySelectorAll('[data-editor-block-id], [data-editor-section], main section')
    ) as HTMLElement[];
    sections.forEach((section) => {
      section.removeAttribute('data-editor-selected');
    });

    if (!selectedBlockId) {
      return;
    }

    const byBlockId = doc.querySelector(`[data-editor-block-id="${CSS.escape(selectedBlockId)}"]`) as HTMLElement | null;
    if (byBlockId) {
      byBlockId.setAttribute('data-editor-selected', 'true');
      byBlockId.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const selectedIndex = currentPage.blocks.findIndex((block) => block.id === selectedBlockId);
    if (selectedIndex < 0) {
      return;
    }

    const selectedBlock = currentPage.blocks[selectedIndex];
    const mappedSelector = mapBlockTypeToSectionSelector[selectedBlock.type];
    const mappedSection = mappedSelector
      ? (doc.querySelector(mappedSelector) as HTMLElement | null)
      : null;
    const fallbackSection = sections[selectedIndex] || null;
    const sectionToHighlight = mappedSection || fallbackSection;

    if (!sectionToHighlight) {
      return;
    }

    sectionToHighlight.setAttribute('data-editor-selected', 'true');
    sectionToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentPage, selectedBlockId, previewTick]);

  const restoreDefaultLayout = () => {
    if (!currentPage) return;

    const confirmRestore = window.confirm(
      `Restaurar o layout padrao de ${pageConfig.name}? Isso vai substituir os blocos atuais (nao publicados ainda).`
    );

    if (!confirmRestore) return;

    const defaults = createDefaultLayoutForPage(currentPage.slug || currentPageSlug);

    setCurrentPage({
      ...currentPage,
      blocks: defaults.blocks,
      updatedAt: new Date().toISOString(),
      status: 'draft',
    });
    setIsDirty(true);
  };

  const saveLayout = async (status: 'draft' | 'published') => {
    if (!currentPage) return;
    if (invalidJson) {
      toast.error('JSON inválido', { description: 'Corrija antes de salvar ou publicar.' });
      return;
    }

    setIsSaving(true);
    try {
      await persistLayout(status);
      if (status === 'draft') {
        toast.success('Rascunho guardado no servidor.');
      } else {
        toast.success('Página publicada com sucesso.', {
          description: currentPage.title || currentPage.slug,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar layout. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 bg-white">
      <div
        className={`flex shrink-0 transition-[width] duration-200 ${sidebarCollapsed ? '' : 'min-w-0'}`}
        style={{ width: sidebarCollapsed ? 56 : sidebarWidth }}
      >
        <div
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-slate-200/90 bg-gradient-to-b from-slate-100/90 via-white to-slate-50 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)]"
        >
        {!sidebarCollapsed ? (
          <div className="border-b border-slate-200/80 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
            <div className="flex rounded-xl bg-slate-100/80 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setSidebarMode('blocks')}
                className={`relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  sidebarMode === 'blocks'
                    ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Widgets
              </button>
              <button
                type="button"
                onClick={() => setSidebarMode('properties')}
                className={`relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  sidebarMode === 'properties'
                    ? 'bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Propriedades
              </button>
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden">
          {sidebarCollapsed ? (
            <div className="flex h-full flex-col items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarMode('blocks');
                }}
                className={`rounded-xl border p-2.5 transition ${
                  sidebarMode === 'blocks'
                    ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="Widgets"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarMode('properties');
                }}
                className={`rounded-xl border p-2.5 transition ${
                  sidebarMode === 'properties'
                    ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                title="Propriedades"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          ) : sidebarMode === 'blocks' ? (
            <BlockPanel currentPageSlug={currentPageSlug} />
          ) : (
            <PropertyEditor
              embedded
              editorLocale={currentLocale}
              onBlogFilesChanged={() => {
                if (currentPageSlug === 'blog' && currentLocale === 'es') {
                  void refreshBlogEnvelopeBaselineEs();
                }
              }}
            />
          )}
        </div>

        {!sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/80 hover:text-violet-700"
            aria-label="Minimizar sidebar"
            title="Minimizar sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="absolute inset-y-0 right-0 flex w-8 items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Expandir sidebar"
            title="Expandir sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        </div>
        {!sidebarCollapsed ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Redimensionar painel"
            onMouseDown={() => setIsResizingSidebar(true)}
            className="w-2.5 shrink-0 cursor-col-resize self-stretch border-l border-slate-200/80 bg-slate-100/90 hover:bg-violet-200/35 active:bg-violet-300/45"
            title="Arraste para redimensionar (não sobrepõe o scroll)"
          />
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-slate-200/90 bg-[#f8fafc] px-3 py-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {onPageChange ? (
              <PageSelector
                compact
                currentPageSlug={currentPageSlug}
                onPageChange={onPageChange}
                disabled={isSaving || isPublishingBulk || isSyncingLayout}
              />
            ) : (
              <span className="max-w-[12rem] truncate text-xs font-semibold text-slate-900">
                {currentPage?.title || 'Editor'}
              </span>
            )}
            {isDirty ? (
              <span className="text-[10px] font-medium text-orange-600" title="Alterações não guardadas">
                •
              </span>
            ) : null}
            {onLocaleChange ? (
              <LocaleSelector
                compact
                currentLocale={currentLocale}
                onLocaleChange={onLocaleChange}
                disabled={isSaving || isPublishingBulk || isSyncingLayout}
              />
            ) : null}
            <span className="hidden h-4 w-px bg-slate-200 sm:inline-block" aria-hidden />
            <BlockNavigatorSelect
              currentPageSlug={currentPageSlug}
              onPickBlock={() => setSidebarMode('properties')}
            />
            {currentPageSlug === 'blog' ? (
              <button
                type="button"
                onClick={() => setBlogPostsModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-900 shadow-sm hover:bg-emerald-100"
                title="Editar notícias, corpo do texto, destaque e galeria"
              >
                <Newspaper className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Artigos
              </button>
            ) : null}
            {esTranslationChangeCount > 0 ? (
              <span className="hidden rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-900 sm:inline">
                ES {esTranslationChangeCount}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-px shadow-sm">
              <button
                type="button"
                onClick={() => setCenterTab('preview')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  centerTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setCenterTab('blocks')}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  centerTab === 'blocks' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Lista
              </button>
            </div>
            {centerTab === 'blocks' ? (
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50/90 px-2 py-0.5 text-[10px] font-semibold text-violet-900 shadow-sm hover:bg-violet-100">
                <input
                  type="checkbox"
                  className="h-3 w-3 shrink-0 rounded border-violet-400 text-violet-600 focus:ring-violet-400"
                  checked={canvasDirectEdit}
                  onChange={(e) => setCanvasDirectEdit(e.target.checked)}
                />
                Editar na lista
              </label>
            ) : null}
            {centerTab === 'preview' ? (
              <label className="inline-flex items-center gap-1">
                <span className="sr-only">Largura do preview</span>
                <select
                  value={previewFrame}
                  onChange={(e) => setPreviewFrame(e.target.value as 'desktop' | 'tablet' | 'mobile')}
                  className="rounded-md border border-slate-200 bg-white py-1 pl-2 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                >
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                  <option value="mobile">Mobile</option>
                </select>
              </label>
            ) : null}
            <span
              className="text-[10px] text-slate-400"
              title={autoSaveError || undefined}
            >
              {isAutoSaving ? '…' : autoSaveError ? '!' : '✓'}
            </span>
            <details ref={maisMenuRef} className="relative">
              <summary className="cursor-pointer list-none rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                Mais
              </summary>
              <div className="absolute right-0 top-full z-[70] mt-1 min-w-[12rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  disabled={!canUndo || isSaving || isPublishingBulk || isSyncingLayout}
                  onClick={() => {
                    undo();
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Undo2 className="h-3.5 w-3.5 shrink-0" />
                  Desfazer
                </button>
                <button
                  type="button"
                  disabled={!canRedo || isSaving || isPublishingBulk || isSyncingLayout}
                  onClick={() => {
                    redo();
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Redo2 className="h-3.5 w-3.5 shrink-0" />
                  Refazer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(previewUrl, '_blank', 'noopener,noreferrer');
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  Visualizar (nova aba)
                </button>
                <button
                  type="button"
                  disabled={
                    (!currentPage || (currentPageSlug === 'blog' && !blogEnvelopeBaseline)) ||
                    isSaving ||
                    currentLocale !== 'es' ||
                    isGeneratingTranslations ||
                    isPublishingBulk ||
                    isSyncingLayout
                  }
                  onClick={() => {
                    generateTranslationPreviews();
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Languages className="h-3.5 w-3.5 shrink-0" />
                  Traduzir
                </button>
                <button
                  type="button"
                  disabled={
                    !currentPage ||
                    isSaving ||
                    invalidJson ||
                    isGeneratingTranslations ||
                    isPublishingBulk ||
                    isSyncingLayout
                  }
                  onClick={() => {
                    syncStructureToOtherLocales();
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
                  Sincronizar estrutura
                </button>
                <button
                  type="button"
                  disabled={!currentPage || isSaving || isPublishingBulk || isSyncingLayout}
                  onClick={() => {
                    restoreDefaultLayout();
                    if (maisMenuRef.current) maisMenuRef.current.open = false;
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Restaurar padrão
                </button>
              </div>
            </details>
            <button
              type="button"
              disabled={!currentPage || isSaving || invalidJson || isPublishingBulk || isSyncingLayout}
              onClick={() => saveLayout('draft')}
              className="rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? '…' : 'Salvar'}
            </button>
            <button
              type="button"
              disabled={!currentPage || isSaving || invalidJson || isPublishingBulk || isSyncingLayout}
              onClick={() => setPublishModalOpen(true)}
              className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              Publicar
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 bg-slate-100/80 p-2">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {centerTab === 'blocks' ? (
              <div className="flex h-full min-h-[420px] min-h-0 flex-col">
                <CanvasListChrome />
                <SelectionDesignBar onOpenPanel={() => setSidebarMode('properties')} />
                <div className="min-h-0 flex-1">
                  <Canvas />
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] justify-center overflow-auto bg-slate-200/30 p-2">
                <div
                  className={`h-full min-h-0 transition-[max-width] duration-200 ${
                    previewFrame === 'desktop'
                      ? 'w-full max-w-none'
                      : previewFrame === 'tablet'
                        ? 'w-full max-w-[834px] shadow-lg'
                        : 'w-full max-w-[390px] shadow-lg'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    title="Espelho do site"
                    src={previewUrl}
                    className="h-full min-h-[480px] w-full rounded-md border-0 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublishScopeModal
        isOpen={publishModalOpen}
        onClose={() => {
          if (!isPublishingBulk && !isSyncingLayout) setPublishModalOpen(false);
        }}
        currentPageSlug={currentPageSlug}
        currentLocale={currentLocale}
        onConfirm={runBulkPublish}
        isPublishing={isPublishingBulk}
      />

      {/* Modal de Preview de Traduções */}
      <TranslationPreviewModal
        isOpen={translationModalOpen}
        onClose={() => setTranslationModalOpen(false)}
        previews={translationPreviews}
        onApprove={applyApprovedTranslationsToLayouts}
        isTranslating={isGeneratingTranslations}
      />

      <BlogPostsEditorModal
        open={blogPostsModalOpen}
        onClose={() => setBlogPostsModalOpen(false)}
        locale={currentLocale}
        onSaved={() => {
          if (currentPageSlug === 'blog' && currentLocale === 'es') {
            void refreshBlogEnvelopeBaselineEs();
          }
        }}
      />
    </div>
  );
}
