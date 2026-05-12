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

function normalizeLayout(rawLayout: PageSchema): PageSchema {
  const pageSlug = rawLayout.slug || 'homepage';
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
      blocks: reconcilePageBlocks(pageSlug, rawLayout.blocks.map(mergeBlockDefaults)),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...createDefaultLayoutForPage(pageSlug),
    id: rawLayout.id || 'homepage',
    name: rawLayout.name || 'Homepage',
    slug: pageSlug,
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

  // Efeito para carregar página quando slug mudar
  useEffect(() => {
    async function loadPageLayout() {
      try {
        setLoading(true);
        const response = await fetch(`/api/editor/layouts/${currentPageSlug}`);

        if (response.ok) {
          const rawLayout = await response.json();
          const layout = normalizeLayout(rawLayout);
          setCurrentPage(layout);

          if (JSON.stringify(layout.blocks) !== JSON.stringify(rawLayout.blocks)) {
            await fetch(`/api/editor/layouts/${layout.slug}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(layout),
            });
          }
        } else {
          // Criar página padrão
          const newPage: PageSchema = createDefaultLayoutForPage(currentPageSlug);
          setCurrentPage(newPage);

          // Salvar página
          await fetch('/api/editor/layouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPage),
          });
        }
      } catch (error) {
        console.error('Erro ao carregar página:', error);
        const fallback: PageSchema = createDefaultLayoutForPage(currentPageSlug);
        setCurrentPage(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadPageLayout();
  }, [currentPageSlug, setCurrentPage]);

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
      onPageChange={setCurrentPageSlug}
    />
  );
}
