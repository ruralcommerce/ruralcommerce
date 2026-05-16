/**
 * Utilitários de caminho no layout (blocos) — tradução em translation-field-paths.ts.
 */

import type { BlockData } from './editor-types';

/** Prefixo tipo `blocks.0` ou `blocks.0.children.1` dentro do JSON da página. */
export function findBlockLayoutPath(blocks: BlockData[], blockId: string): string | null {
  function walk(list: BlockData[], prefix: string): string | null {
    for (let i = 0; i < list.length; i++) {
      const p = `${prefix}.${i}`;
      if (list[i].id === blockId) return p;
      if (list[i].children?.length) {
        const hit = walk(list[i].children!, `${p}.children`);
        if (hit) return hit;
      }
    }
    return null;
  }
  return walk(blocks, 'blocks');
}

export function getValueAtDottedPath(root: unknown, dotted: string): unknown {
  const parts = dotted.split('.');
  let cur: unknown = root;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export {
  listBlockTranslationFieldPaths,
  filterFieldPathsMissingInTarget,
  listPageTranslationFieldPaths,
  getTranslationTextAt,
  setTranslationTextAt,
  decodeTranslationFieldPath,
} from './translation-field-paths';
