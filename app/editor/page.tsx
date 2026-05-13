'use client';

/**
 * /app/editor - Página principal do editor
 * Carrega ou cria um layout inicial
 */

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { BlockData, PageSchema } from '@/lib/editor-types';
import { EditorLayout } from './components/EditorLayout';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import { createDefaultLayoutForPage, reconcilePageBlocks } from '@/lib/editor-pages';
import { locales, type Locale } from '@/i18n/request';

function normalizeLayout(rawLayout: PageSchema): PageSchema {
  const pageSlug = rawLayout.slug || 'homepage';
  const pageLocale = rawLayout.locale || 'es';
  const hasUnknownBlock = rawLayout.blocks.some((block) => !(block.type in BLOCK_LIBRARY));

  const mergeBlockDefaults = (block: BlockData): BlockData => {
    const definition = BLOCK_LIBRARY[block.type];
    return {
      ...block,
      props: {
        ...definition.defaultProps,
        ...block.props,
      },
      children: block.children?.map(mergeBlockDefaults),
    };
  };

  if (!hasUnknownBlock) {
    return {
      ...rawLayout,
      locale: pageLocale,
      blocks: reconcilePageBlocks(pageSlug, rawLayout.blocks.map(mergeBlockDefaults)),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...createDefaultLayoutForPage(pageSlug),
    id: rawLayout.id || 'homepage',
    name: rawLayout.name || 'Homepage',
    slug: pageSlug,
    locale: pageLocale,
    title: rawLayout.title || 'Homepage',
    createdAt: rawLayout.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: rawLayout.status || 'draft',
    publishedAt: rawLayout.publishedAt,
    blocks: reconcilePageBlocks(
      pageSlug,
      rawLayout.blocks
        .filter((block) => block.type in BLOCK_LIBRARY)
        .map(mergeBlockDefaults)
    ),
  };
}

export default function EditorPage() {
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const [loading, setLoading] = useState(true);
  const [currentPageSlug, setCurrentPageSlug] = useState('homepage');
  const [currentLocale, setCurrentLocale] = useState<Locale>(locales[0]);

  useEffect(() => {
    let cancelled = false;
    const pageKey = `${currentPageSlug}:${currentLocale}`;

    useEditorStore.getState().clearTranslationBaseline();

    async function loadPageLayout() {
      try {
        setLoading(true);
        const response = await fetch(`/api/editor/layouts/${currentPageSlug}?locale=${encodeURIComponent(currentLocale)}`);

        if (response.ok) {
          const rawLayout = await response.json();
          const layout = normalizeLayout(rawLayout);
          if (cancelled) return;
          setCurrentPage(layout);
          useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(layout)));

          if (JSON.stringify(layout.blocks) !== JSON.stringify(rawLayout.blocks)) {
            const putRes = await fetch(`/api/editor/layouts/${layout.slug}?locale=${encodeURIComponent(currentLocale)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(layout),
            });
            if (putRes.ok) {
              const body = (await putRes.json()) as PageSchema & { _sync?: unknown };
              const { _sync: _ignored, ...saved } = body;
              const normalized = normalizeLayout(saved as PageSchema);
              if (!cancelled) {
                setCurrentPage(normalized);
                useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(normalized)));
              }
            }
          }
        } else {
          const newPage: PageSchema = {
            ...createDefaultLayoutForPage(currentPageSlug),
            locale: currentLocale,
          };
          if (cancelled) return;
          setCurrentPage(newPage);

          await fetch(`/api/editor/layouts?locale=${encodeURIComponent(currentLocale)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPage),
          });

          if (!cancelled) {
            useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(newPage)));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar página:', error);
        const fallback: PageSchema = {
          ...createDefaultLayoutForPage(currentPageSlug),
          locale: currentLocale,
        };
        if (!cancelled) {
          setCurrentPage(fallback);
          useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(fallback)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPageLayout();
    return () => {
      cancelled = true;
    };
  }, [currentPageSlug, currentLocale, setCurrentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Carregando editor...</div>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      currentPageSlug={currentPageSlug}
      currentLocale={currentLocale}
      onLocaleChange={(locale) => setCurrentLocale(locale as Locale)}
      onPageChange={setCurrentPageSlug}
    />
  );
}
