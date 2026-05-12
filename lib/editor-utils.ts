/**
 * Utilitários para o editor
 */

import { BlockData, BlockType, BLOCK_LIBRARY } from './editor-types';

export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createBlock(type: BlockType, overrides?: Partial<BlockData>): BlockData {
  const definition = BLOCK_LIBRARY[type];

  return {
    id: generateBlockId(),
    type,
    props: definition.defaultProps,
    ...overrides,
  };
}

export function findBlockPath(
  blocks: BlockData[],
  id: string,
  path: BlockData[] = []
): BlockData[] | null {
  for (const block of blocks) {
    const currentPath = [...path, block];
    if (block.id === id) return currentPath;
    if (block.children) {
      const found = findBlockPath(block.children, id, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function countBlocks(blocks: BlockData[]): number {
  let count = blocks.length;
  for (const block of blocks) {
    if (block.children) {
      count += countBlocks(block.children);
    }
  }
  return count;
}

export function flattenBlocks(blocks: BlockData[]): BlockData[] {
  const result: BlockData[] = [];
  for (const block of blocks) {
    result.push(block);
    if (block.children) {
      result.push(...flattenBlocks(block.children));
    }
  }
  return result;
}

export function validatePageSchema(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.id || !data.name || !data.blocks || !Array.isArray(data.blocks)) return false;
  return true;
}
