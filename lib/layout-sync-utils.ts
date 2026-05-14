import type { BlockData, PageSchema } from './editor-types';

function cloneBlocks(blocks: BlockData[]): BlockData[] {
  return JSON.parse(JSON.stringify(blocks)) as BlockData[];
}

export type FullLayoutSyncResult = {
  page: PageSchema;
  warnings: string[];
};

/**
 * Substitui todos os blocos do destino pelos da origem (estrutura, cores, textos, JSON).
 * Mantém no objeto de destino: slug, locale, id, name, title, status, publishedAt, createdAt.
 */
export function applyFullLayoutBlocksFromSource(source: PageSchema, target: PageSchema): FullLayoutSyncResult {
  const warnings: string[] = [];
  if (!Array.isArray(source.blocks) || source.blocks.length === 0) {
    warnings.push('Layout de origem sem blocos; nada foi copiado.');
  }
  return {
    page: {
      ...target,
      blocks: cloneBlocks(source.blocks),
      updatedAt: new Date().toISOString(),
    },
    warnings,
  };
}
