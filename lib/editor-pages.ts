import { BlockData, BLOCK_LIBRARY, BlockType, PageSchema } from '@/lib/editor-types';
import { getBlogDefaultBlocks, getBlogLocaleKey } from '@/lib/blog-defaults';
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
  { slug: 'contacto', name: 'Contacto', title: 'Contacto', icon: '📬', previewPath: '/contacto' },
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
  blog: ['blog-featured', 'blog-posts-grid'],
  contacto: ['contact-hero-split', 'contact-form-split', 'contact-map-split', 'contact-social-strip'],
};

export function getTemplateBlockTypes(slug: string): BlockType[] {
  return PAGE_BLOCK_TEMPLATES[slug] || PAGE_BLOCK_TEMPLATES.homepage;
}

function createDefaultBlocksForPage(slug: string, locale?: string): BlockData[] {
  if (slug === 'blog') {
    return getBlogDefaultBlocks(getBlogLocaleKey(locale || 'es'));
  }
  return getTemplateBlockTypes(slug).map((type) => createBlock(type));
}

export function getEditorPageConfig(slug: string): EditorPageConfig {
  return EDITOR_PAGES.find((page) => page.slug === slug) || EDITOR_PAGES[0];
}

/** Preserva el orden del JSON; filtra tipos inválidos o no permitidos en la página; singletons: conserva la primera aparición. */
export function reconcilePageBlocks(slug: string, blocks: BlockData[]): BlockData[] {
  const seenSingletons = new Set<BlockType>();
  const out: BlockData[] = [];

  for (const block of blocks) {
    const definition = BLOCK_LIBRARY[block.type];
    if (!definition) continue;

    if (definition.pageSlugs && !definition.pageSlugs.includes(slug)) {
      continue;
    }

    if (definition.singleton) {
      if (seenSingletons.has(block.type)) continue;
      seenSingletons.add(block.type);
    }

    out.push(block);
  }

  return out;
}

export function createDefaultLayoutForPage(slug: string): PageSchema {
  const page = getEditorPageConfig(slug);

  return {
    id: page.slug,
    name: page.name,
    title: page.title,
    slug: page.slug,
    blocks: createDefaultBlocksForPage(page.slug, 'es'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
}
