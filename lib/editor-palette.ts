/**
 * Paleta do editor: blocos atómicos primeiro, secções da página por último.
 */

import type { BlockType } from '@/lib/editor-types';
import { BLOCK_LIBRARY, getBlockLabelForPage } from '@/lib/editor-types';
import { getTemplateBlockTypes } from '@/lib/editor-pages';

/** Estrutura: onde o conteúdo “morre”. */
export const PALETTE_STRUCTURE: readonly BlockType[] = [
  'layout-section',
  'layout-columns',
  'layout-divider',
  'spacer',
];

/** Conteúdo básico. */
export const PALETTE_CONTENT: readonly BlockType[] = [
  'heading-block',
  'rich-text',
  'free-text',
  'image',
  'video-embed',
  'map-embed',
  'button-block',
];

/** Interação / composição. */
export const PALETTE_INTERACTION: readonly BlockType[] = [
  'accordion-block',
  'tabs-simple',
  'progress-block',
  'pricing-table',
  'rich-html',
];

export function isBlockAllowedOnPage(type: BlockType, pageSlug: string): boolean {
  const def = BLOCK_LIBRARY[type];
  if (!def) return false;
  return !def.pageSlugs || def.pageSlugs.includes(pageSlug);
}

export type PaletteSections = {
  structure: BlockType[];
  content: BlockType[];
  interaction: BlockType[];
  sections: BlockType[];
};

export function getPaletteSectionBlocks(pageSlug: string): PaletteSections {
  const structure = PALETTE_STRUCTURE.filter((t) => isBlockAllowedOnPage(t, pageSlug));
  const content = PALETTE_CONTENT.filter((t) => isBlockAllowedOnPage(t, pageSlug));
  const interaction = PALETTE_INTERACTION.filter((t) => isBlockAllowedOnPage(t, pageSlug));
  const sections = getTemplateBlockTypes(pageSlug).filter((t) => isBlockAllowedOnPage(t, pageSlug));
  return { structure, content, interaction, sections };
}

/** Ordem única (ex.: reconciliação / ferramentas). */
export function getPaletteBlockTypesForPage(pageSlug: string): BlockType[] {
  const { structure, content, interaction, sections } = getPaletteSectionBlocks(pageSlug);
  return Array.from(new Set([...structure, ...content, ...interaction, ...sections]));
}

/**
 * Rótulo no cartão da paleta: widgets atómicos usam o nome curto do catálogo
 * (evita «Sección (Inicio)»); secções do modelo mantêm o nome por página.
 */
export function getPaletteCardLabel(type: BlockType, pageSlug: string, kind: 'atomic' | 'section'): string {
  if (kind === 'section') {
    return getBlockLabelForPage(type, pageSlug);
  }
  const def = BLOCK_LIBRARY[type];
  return def?.label ?? getBlockLabelForPage(type, pageSlug);
}
