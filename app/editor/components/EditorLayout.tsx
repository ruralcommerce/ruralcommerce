'use client';

/**
 * EditorLayout - Layout principal do editor
 * Combina BlockPanel, Canvas e PropertyEditor
 */

import { useEditorStore } from '@/lib/editor-store';
import { BlockPanel } from './BlockPanel';
import { PropertyEditor } from './PropertyEditor';
import { PageSelector } from './PageSelector';
import { LocaleSelector } from './LocaleSelector';
import { TranslationPreviewModal } from './TranslationPreviewModal';
import { PublishScopeModal, type PublishScopeSelection } from './PublishScopeModal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Languages, Link2 } from 'lucide-react';
import { PageSchema } from '@/lib/editor-types';
import { createDefaultLayoutForPage, getEditorPageConfig } from '@/lib/editor-pages';
import { detectTextChanges, fetchTranslationPreview, applyApprovedTranslations, TranslationPreview, TranslationChange } from '@/lib/translation-utils';
import { applyLinkSyncFromSource } from '@/lib/link-sync-utils';
import { locales as editorLocales } from '@/i18n/request';
import { toast } from 'sonner';

function hasInvalidJsonProps(page: PageSchema | null): boolean {
  if (!page) return false;

  return page.blocks.some((block) => {
    return Object.entries(block.props).some(([key, value]) => {
      if (!key.endsWith('Json') || typeof value !== 'string') {
        return false;
      }

      try {
        const parsed = JSON.parse(value);
        return !Array.isArray(parsed);
      } catch {
        return true;
      }
    });
  });
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
  const translationBaselinePage = useEditorStore((s) => s.translationBaselinePage);
  const translationBaselineKey = useEditorStore((s) => s.translationBaselineKey);
  const setTranslationBaseline = useEditorStore((s) => s.setTranslationBaseline);
  const setIsDirty = useEditorStore((s) => s.setIsDirty);
  const isDirty = useEditorStore((s) => s.isDirty);
  const selectBlock = useEditorStore((s) => s.selectBlock);
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
  const [isSyncingLinks, setIsSyncingLinks] = useState(false);
  const [translationPreviews, setTranslationPreviews] = useState<TranslationPreview[]>([]);
  const [isGeneratingTranslations, setIsGeneratingTranslations] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const invalidJson = hasInvalidJsonProps(currentPage);
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
    setCurrentPage(pagePayload as PageSchema);
    setIsDirty(false);
    setPreviewTick((value) => value + 1);
    if (_sync?.git === 'failed' && _sync.message) {
      toast.warning('Layout salvo no servidor, mas o envio para o Git falhou.', {
        description: _sync.message,
        duration: 20000,
      });
    }
    return pagePayload as PageSchema;
  };

  const syncLinksToOtherLocales = async () => {
    if (!currentPage) return;
    if (invalidJson) {
      toast.error('JSON inválido', { description: 'Corrija antes de sincronizar links.' });
      return;
    }

    const slug = currentPage.slug || currentPageSlug;
    const targets = editorLocales.filter((l) => l !== currentLocale);
    if (targets.length === 0) {
      toast.message('Nada a sincronizar', { description: 'Só há um idioma na configuração.' });
      return;
    }

    setIsSyncingLinks(true);
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

          const { page: merged, warnings } = applyLinkSyncFromSource(currentPage, target);
          allWarnings.push(...warnings.map((w) => `${loc}: ${w}`));

          const putBody = {
            ...merged,
            locale: loc,
            status: statusBefore,
            publishedAt: publishedAtBefore,
            createdAt: createdAtBefore,
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
        toast.success(`Links sincronizados: ${savedOk.join(', ')}.`, {
          description:
            'Copiados só URLs e hrefs (menu, rodapé, botões, imagens, parceiros). Textos de cada idioma foram mantidos.',
          duration: 9000,
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
      setIsSyncingLinks(false);
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
        setCurrentPage(lastCurrentPayload);
        setIsDirty(false);
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
    const baselineKey = `${currentPageSlug}:${currentLocale}`;
    if (!currentPage || !translationBaselinePage || translationBaselineKey !== baselineKey || currentLocale !== 'es') {
      if (currentLocale !== 'es') {
        toast.info('Tradução assistida só está disponível com o idioma do editor em Español (ES).');
      } else if (!translationBaselinePage) {
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
    if (!currentPage) return;

    try {
      // Agrupa mudanças por locale
      const changesByLocale: Record<string, TranslationChange[]> = {};
      approvedChanges.forEach(change => {
        if (!changesByLocale[change.targetLocale]) {
          changesByLocale[change.targetLocale] = [];
        }
        changesByLocale[change.targetLocale].push(change);
      });

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
    if (!currentPage || !isDirty || invalidJson || isSaving || isSyncingLinks) {
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
    }, 700);

    return () => clearTimeout(timer);
  }, [currentPage, isDirty, invalidJson, isSaving, isSyncingLinks]);

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
      };

      if (normalized in aliases) {
        return aliases[normalized];
      }

      return normalized;
    };

    const getInspectableAreas = (doc: Document): HTMLElement[] => {
      return Array.from(doc.querySelectorAll('[data-editor-section], main section')) as HTMLElement[];
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

          const sectionEl = target.closest('[data-editor-section], section[id], header, footer') as HTMLElement | null;
          if (!sectionEl) return;

          event.preventDefault();
          event.stopPropagation();

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
    };

    const sections = Array.from(doc.querySelectorAll('[data-editor-section], main section')) as HTMLElement[];
    sections.forEach((section) => {
      section.removeAttribute('data-editor-selected');
    });

    if (!selectedBlockId) {
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
        className="relative flex min-h-0 flex-col overflow-hidden bg-slate-50 border-r border-slate-200 transition-[width] duration-200"
        style={{ width: sidebarCollapsed ? 56 : sidebarWidth }}
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            {!sidebarCollapsed ? (
              <>
                <h2 className="text-sm font-semibold text-slate-900">Painel</h2>
                <span className="text-[11px] text-slate-500">{pageConfig.name}</span>
              </>
            ) : (
              <div className="flex w-full items-center justify-center text-[11px] font-semibold text-slate-500">RC</div>
            )}
          </div>
          {!sidebarCollapsed ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSidebarMode('blocks')}
                className={`rounded border px-3 py-2 text-xs font-semibold transition ${
                  sidebarMode === 'blocks'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Blocos
              </button>
              <button
                type="button"
                onClick={() => setSidebarMode('properties')}
                className={`rounded border px-3 py-2 text-xs font-semibold transition ${
                  sidebarMode === 'properties'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Propriedades
              </button>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {sidebarCollapsed ? (
            <div className="flex h-full flex-col items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarMode('blocks');
                }}
                className={`rounded-lg border px-2 py-3 text-[11px] font-semibold transition ${
                  sidebarMode === 'blocks'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarCollapsed(false);
                  setSidebarMode('properties');
                }}
                className={`rounded-lg border px-2 py-3 text-[11px] font-semibold transition ${
                  sidebarMode === 'properties'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                P
              </button>
            </div>
          ) : sidebarMode === 'blocks' ? (
            <BlockPanel currentPageSlug={currentPageSlug} />
          ) : (
            <PropertyEditor embedded />
          )}
        </div>

        {!sidebarCollapsed ? (
          <>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="absolute right-2 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Minimizar sidebar"
              title="Minimizar sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div
              role="separator"
              aria-orientation="vertical"
              onMouseDown={() => setIsResizingSidebar(true)}
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-blue-400/30"
              title="Arraste para redimensionar"
            />
          </>
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

      <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h1 className="font-bold text-lg text-slate-900">
                {currentPage?.title || 'Editor'}
              </h1>
              {isDirty && <span className="text-xs text-orange-500 ml-2">• Não salvo</span>}
            </div>
            {onPageChange && (
              <PageSelector
                currentPageSlug={currentPageSlug}
                onPageChange={onPageChange}
                disabled={isSaving || isPublishingBulk || isSyncingLinks}
              />
            )}
            {onLocaleChange && (
              <LocaleSelector
                currentLocale={currentLocale}
                onLocaleChange={onLocaleChange}
                disabled={isSaving || isPublishingBulk || isSyncingLinks}
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.open(previewUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition"
            >
              Visualizar
            </button>
            <button
              disabled={!currentPage || isSaving || invalidJson || isPublishingBulk || isSyncingLinks}
              onClick={() => saveLayout('draft')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              disabled={!currentPage || isSaving || currentLocale !== 'es' || isGeneratingTranslations || isPublishingBulk || isSyncingLinks}
              onClick={generateTranslationPreviews}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition disabled:opacity-60 flex items-center gap-2"
              title="Traduzir mudanças para outros idiomas"
            >
              <Languages className="h-4 w-4" />
              {isGeneratingTranslations ? 'Traduzindo...' : 'Traduzir'}
            </button>
            <button
              disabled={
                !currentPage ||
                isSaving ||
                invalidJson ||
                isGeneratingTranslations ||
                isPublishingBulk ||
                isSyncingLinks
              }
              onClick={syncLinksToOtherLocales}
              className="px-4 py-2 text-sm font-medium text-cyan-900 bg-cyan-100 border border-cyan-300 rounded hover:bg-cyan-200 transition disabled:opacity-60 flex items-center gap-2"
              title="Copia só URLs e hrefs da página aberta para os outros idiomas desta mesma página (mantém textos e labels)."
            >
              <Link2 className="h-4 w-4" />
              {isSyncingLinks ? 'Sincronizando...' : 'Sincronizar links'}
            </button>
            <button
              disabled={!currentPage || isSaving || invalidJson || isPublishingBulk || isSyncingLinks}
              onClick={() => setPublishModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-60"
            >
              Publicar
            </button>
            <button
              disabled={!currentPage || isSaving || isPublishingBulk || isSyncingLinks}
              onClick={restoreDefaultLayout}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition disabled:opacity-60"
            >
              Restaurar padrao
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-sky-50/60 px-6 py-2 text-xs text-slate-700 flex items-center justify-between gap-4">
          <span className="flex flex-wrap items-center gap-2">
            <span>
              Modo espelho ativo: o preview central recarrega automaticamente apos cada alteracao salva.
            </span>
            {esTranslationChangeCount > 0 ? (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-800">
                Texto em ES alterado ({esTranslationChangeCount} campo{esTranslationChangeCount !== 1 ? 's' : ''}) — use Traduzir para PT/EN
              </span>
            ) : null}
            <span className="rounded-full bg-cyan-100 px-2 py-0.5 font-medium text-cyan-900">
              URLs e botões: use <strong>Sincronizar links</strong> para copiar só hrefs para os outros idiomas desta página.
            </span>
          </span>
          <span className="text-[11px] text-slate-600">
            {isAutoSaving ? 'Autosave...' : autoSaveError ? autoSaveError : 'Sincronizado'}
          </span>
        </div>

        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <div className="editor-scroll flex gap-2 overflow-x-auto">
            {currentPage?.blocks.map((block, index) => (
              <button
                key={block.id}
                type="button"
                onClick={() => {
                  selectBlock(block.id);
                  setSidebarMode('properties');
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <GripVertical className="mr-1 inline h-3.5 w-3.5 opacity-60" />
                #{index + 1} {block.type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-slate-100 p-4">
          <div className="h-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <iframe
              ref={iframeRef}
              title="Espelho do site"
              src={previewUrl}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>

      <PublishScopeModal
        isOpen={publishModalOpen}
        onClose={() => {
          if (!isPublishingBulk && !isSyncingLinks) setPublishModalOpen(false);
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
    </div>
  );
}
