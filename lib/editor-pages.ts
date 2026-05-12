import { BlockData, BLOCK_LIBRARY, BlockType, PageSchema } from '@/lib/editor-types';
import { createBlock } from '@/lib/editor-utils';

export type EditorPageConfig = {
  slug: string;
  name: string;
  title: string;
  icon: string;
  previewPath: string;
};

export const EDITOR_PAGES: EditorPageConfig[] = [
  { slug: 'homepage', name: 'Homepage', title: 'Homepage', icon: '🏠', previewPath: '/' },
  { slug: 'solucoes', name: 'Solucoes', title: 'Solucoes', icon: '🛠️', previewPath: '/solucoes' },
  { slug: 'sobre', name: 'Sobre', title: 'Sobre Nos', icon: 'ℹ️', previewPath: '/sobre' },
  { slug: 'aliados', name: 'Aliados', title: 'Aliados e Inversores', icon: '🤝', previewPath: '/aliados' },
  { slug: 'blog', name: 'Blog', title: 'Blog', icon: '📰', previewPath: '/blog' },
];

const PAGE_BLOCK_TEMPLATES: Record<string, BlockType[]> = {
  homepage: [
    'site-header',
    'hero-section',
    'system-section',
    'segments-section',
    'solutions-section',
    'stats-section',
    'partners-section',
    'site-footer',
  ],
  solucoes: ['hero-section', 'solutions-section', 'stats-section', 'free-text', 'image'],
  sobre: ['hero-section', 'segments-section', 'system-section', 'stats-section', 'free-text', 'image'],
  aliados: ['hero-section', 'system-section', 'solutions-section', 'stats-section', 'free-text', 'image'],
  blog: ['hero-section', 'segments-section'],
};

function getTemplateBlockTypes(slug: string): BlockType[] {
  return PAGE_BLOCK_TEMPLATES[slug] || PAGE_BLOCK_TEMPLATES.homepage;
}

export function getPaletteBlockTypesForPage(slug: string): BlockType[] {
  const genericExtras: BlockType[] = ['free-text', 'image', 'spacer'];
  return Array.from(new Set([...getTemplateBlockTypes(slug), ...genericExtras]));
}

function createDefaultBlocksForPage(slug: string): BlockData[] {
  return getTemplateBlockTypes(slug).map((type) => createBlock(type));
}

export function getEditorPageConfig(slug: string): EditorPageConfig {
  return EDITOR_PAGES.find((page) => page.slug === slug) || EDITOR_PAGES[0];
}

export function reconcilePageBlocks(slug: string, blocks: BlockData[]): BlockData[] {
  const templateTypes = getTemplateBlockTypes(slug);
  const seenSingletons = new Set<BlockType>();

  const filteredBlocks = blocks.filter((block) => {
    const definition = BLOCK_LIBRARY[block.type];
    if (!definition) {
      return false;
    }

    if (definition.pageSlugs && !definition.pageSlugs.includes(slug)) {
      return false;
    }

    if (definition.singleton) {
      if (seenSingletons.has(block.type)) {
        return false;
      }
      seenSingletons.add(block.type);
    }

    return true;
  });

  const blockByType = new Map<BlockType, BlockData>();
  for (const block of filteredBlocks) {
    if (!blockByType.has(block.type)) {
      blockByType.set(block.type, block);
    }
  }

  const ordered: BlockData[] = [];

  for (const type of templateTypes) {
    ordered.push(blockByType.get(type) || createBlock(type));
    blockByType.delete(type);
  }

  for (const block of filteredBlocks) {
    if (blockByType.has(block.type) || !templateTypes.includes(block.type)) {
      ordered.push(block);
      blockByType.delete(block.type);
    }
  }

  return ordered;
}

export function createDefaultLayoutForPage(slug: string): PageSchema {
  const page = getEditorPageConfig(slug);

  return {
    id: page.slug,
    name: page.name,
    title: page.title,
    slug: page.slug,
    blocks: createDefaultBlocksForPage(page.slug),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
}
