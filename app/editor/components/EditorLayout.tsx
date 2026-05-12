'use client';

/**
 * EditorLayout - Layout principal do editor
 * Combina BlockPanel, Canvas e PropertyEditor
 */

import { useEditorStore } from '@/lib/editor-store';
import { BlockPanel } from './BlockPanel';
import { PropertyEditor } from './PropertyEditor';
import { PageSelector } from './PageSelector';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { PageSchema } from '@/lib/editor-types';
import { createDefaultLayoutForPage, getEditorPageConfig } from '@/lib/editor-pages';

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
  onPageChange,
}: {
  currentPageSlug?: string;
  onPageChange?: (slug: string) => void;
} = {}) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const invalidJson = hasInvalidJsonProps(currentPage);
  const pageConfig = getEditorPageConfig(currentPageSlug);

  const previewUrl = `${pageConfig.previewPath}?preview=draft&key=rural-preview&t=${previewTick}`;

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
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : currentPage.publishedAt,
    };

    const response = await fetch(`/api/editor/layouts/${currentPage.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar layout');
    }

    const updated = await response.json();
    setCurrentPage(updated);
    setIsDirty(false);
    setPreviewTick((value) => value + 1);
    return updated;
  };

  useEffect(() => {
    if (!currentPage || !isDirty || invalidJson || isSaving) {
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
  }, [currentPage, isDirty, invalidJson, isSaving]);

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
      alert('Existem campos JSON invalidos. Corrija antes de salvar/publicar.');
      return;
    }

    setIsSaving(true);
    try {
      await persistLayout(status);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar layout. Verifique o console.');
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
          <div className="flex items-center gap-4">
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
                disabled={isSaving}
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
              disabled={!currentPage || isSaving || invalidJson}
              onClick={() => saveLayout('draft')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              disabled={!currentPage || isSaving || invalidJson}
              onClick={() => saveLayout('published')}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-60"
            >
              Publicar
            </button>
            <button
              disabled={!currentPage || isSaving}
              onClick={restoreDefaultLayout}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition disabled:opacity-60"
            >
              Restaurar padrao
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-sky-50/60 px-6 py-2 text-xs text-slate-700 flex items-center justify-between gap-4">
          <span>
            Modo espelho ativo: o preview central recarrega automaticamente apos cada alteracao salva.
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
    </div>
  );
}
