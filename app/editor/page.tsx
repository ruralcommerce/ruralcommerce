'use client';

/**
 * /app/editor - Página principal do editor
 * Carrega ou cria um layout inicial
 */

import { useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { BlockData, PageSchema } from '@/lib/editor-types';
import { EditorLayout } from './components/EditorLayout';
import { EditorLoadingSkeleton } from './components/EditorLoadingSkeleton';
import { BLOCK_LIBRARY } from '@/lib/editor-types';
import { createDefaultLayoutForPage, reconcilePageBlocks } from '@/lib/editor-pages';
import { locales, type Locale } from '@/i18n/request';

function editorBackupKey(pageKey: string) {
  return `rc-editor-layout-backup:v1:${pageKey}`;
}

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
  const bootstrapEditorPage = useEditorStore((s) => s.bootstrapEditorPage);
  const syncPageFromPersist = useEditorStore((s) => s.syncPageFromPersist);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [currentPageSlug, setCurrentPageSlug] = useState('homepage');
  const [currentLocale, setCurrentLocale] = useState<Locale>(locales[0]);

  const bumpRetry = useCallback(() => {
    setLoadError(null);
    setRetryToken((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pageKey = `${currentPageSlug}:${currentLocale}`;

    useEditorStore.getState().clearTranslationBaseline();

    /** Stale-while-revalidate: mostrar cópia local imediata enquanto a API responde. */
    let startedFromBackup = false;
    if (typeof window !== 'undefined') {
      const backupRaw = localStorage.getItem(editorBackupKey(pageKey));
      if (backupRaw) {
        try {
          const parsed = normalizeLayout(JSON.parse(backupRaw) as PageSchema);
          bootstrapEditorPage(parsed);
          useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(parsed)));
          startedFromBackup = true;
          setLoading(false);
          setLoadError(null);
        } catch {
          /* backup inválido: seguir só com fetch */
        }
      }
    }

    async function loadPageLayout() {
      try {
        if (!startedFromBackup) {
          setLoading(true);
          setLoadError(null);
        }
        const response = await fetch(`/api/editor/layouts/${currentPageSlug}?locale=${encodeURIComponent(currentLocale)}`);

        if (response.ok) {
          const rawLayout = await response.json();
          const layout = normalizeLayout(rawLayout);
          if (cancelled) return;
          bootstrapEditorPage(layout);
          try {
            localStorage.setItem(editorBackupKey(pageKey), JSON.stringify(layout));
          } catch {
            /* quota ou modo privado */
          }
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
                syncPageFromPersist(normalized);
                try {
                  localStorage.setItem(editorBackupKey(pageKey), JSON.stringify(normalized));
                } catch {
                  /* ignore */
                }
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
          bootstrapEditorPage(newPage);

          await fetch(`/api/editor/layouts?locale=${encodeURIComponent(currentLocale)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPage),
          });

          if (!cancelled) {
            try {
              localStorage.setItem(editorBackupKey(pageKey), JSON.stringify(newPage));
            } catch {
              /* ignore */
            }
            useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(newPage)));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar página:', error);
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        const fallback: PageSchema = {
          ...createDefaultLayoutForPage(currentPageSlug),
          locale: currentLocale,
        };
        if (!cancelled) {
          setLoadError(message);
          if (!startedFromBackup) {
            bootstrapEditorPage(fallback);
            useEditorStore.getState().setTranslationBaseline(pageKey, JSON.parse(JSON.stringify(fallback)));
          }
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
  }, [currentPageSlug, currentLocale, bootstrapEditorPage, syncPageFromPersist, retryToken]);

  if (loading) {
    return <EditorLoadingSkeleton />;
  }

  return (
    <>
      {loadError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
          <span className="font-medium">Aviso:</span> não foi possível sincronizar com o servidor ({loadError}). Está a
          editar um <strong>layout local de segurança</strong>.{' '}
          <button type="button" className="font-semibold text-blue-700 underline hover:text-blue-900" onClick={bumpRetry}>
            Tentar novamente
          </button>
          {typeof window !== 'undefined' && localStorage.getItem(editorBackupKey(`${currentPageSlug}:${currentLocale}`)) ? (
            <>
              {' · '}
              <button
                type="button"
                className="font-semibold text-blue-700 underline hover:text-blue-900"
                onClick={() => {
                  const raw = localStorage.getItem(editorBackupKey(`${currentPageSlug}:${currentLocale}`));
                  if (!raw) return;
                  try {
                    const parsed = normalizeLayout(JSON.parse(raw) as PageSchema);
                    bootstrapEditorPage(parsed);
                    useEditorStore
                      .getState()
                      .setTranslationBaseline(`${currentPageSlug}:${currentLocale}`, JSON.parse(JSON.stringify(parsed)));
                    setLoadError(null);
                  } catch {
                    /* ignore */
                  }
                }}
              >
                Restaurar última cópia guardada neste browser
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      <EditorLayout
        currentPageSlug={currentPageSlug}
        currentLocale={currentLocale}
        onLocaleChange={(locale) => setCurrentLocale(locale as Locale)}
        onPageChange={setCurrentPageSlug}
      />
    </>
  );
}
