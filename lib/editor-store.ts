/**
 * Store global do editor usando Zustand
 * Gerencia estado do editor, blocos selecionados, e layout
 */

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { PageSchema, BlockData } from './editor-types';

interface EditorStore {
  // Estado da página
  currentPage: PageSchema | null;
  setCurrentPage: (page: PageSchema) => void;

  /** Snapshot para diff de tradução (ES): definido ao carregar slug+idioma no editor; sobrevive a remounts. */
  translationBaselineKey: string | null;
  translationBaselinePage: PageSchema | null;
  setTranslationBaseline: (key: string, page: PageSchema) => void;
  clearTranslationBaseline: () => void;

  // Seleção de blocos
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;

  // Operações em blocos
  addBlock: (block: BlockData, parentId?: string) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, props: Partial<BlockData>) => void;
  moveBlock: (id: string, targetIndex: number, parentId?: string) => void;
  duplicateBlock: (id: string) => void;

  // Editor state
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Undo/Redo
  history: PageSchema[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
}

function findBlockById(blocks: BlockData[], id: string): BlockData | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateBlockInTree(
  blocks: BlockData[],
  id: string,
  updates: Partial<BlockData>
): BlockData[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, ...updates };
    }
    if (block.children) {
      return {
        ...block,
        children: updateBlockInTree(block.children, id, updates),
      };
    }
    return block;
  });
}

function removeBlockFromTree(blocks: BlockData[], id: string): BlockData[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => ({
      ...block,
      children: block.children ? removeBlockFromTree(block.children, id) : block.children,
    }));
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentPage: null,
  setCurrentPage: (page) => {
    set((state) => ({
      currentPage: page,
      history: [...state.history, page],
      historyIndex: state.history.length,
      isDirty: false,
    }));
  },

  translationBaselineKey: null,
  translationBaselinePage: null,
  setTranslationBaseline: (key, page) =>
    set({
      translationBaselineKey: key,
      translationBaselinePage: JSON.parse(JSON.stringify(page)) as PageSchema,
    }),
  clearTranslationBaseline: () =>
    set({
      translationBaselineKey: null,
      translationBaselinePage: null,
    }),

  selectedBlockId: null,
  selectBlock: (id) => set({ selectedBlockId: id }),

  addBlock: (block, parentId) => {
    set((state) => {
      if (!state.currentPage) return state;

      const newPage = { ...state.currentPage };

      if (!parentId) {
        newPage.blocks = [...newPage.blocks, block];
      } else {
        newPage.blocks = newPage.blocks.map((b) => {
          if (b.id === parentId && b.children) {
            return { ...b, children: [...b.children, block] };
          }
          return b;
        });
      }

      return {
        currentPage: newPage,
        isDirty: true,
        history: [...state.history.slice(0, state.historyIndex + 1), newPage],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  removeBlock: (id) => {
    set((state) => {
      if (!state.currentPage) return state;

      const newPage = {
        ...state.currentPage,
        blocks: removeBlockFromTree(state.currentPage.blocks, id),
      };

      return {
        currentPage: newPage,
        isDirty: true,
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        history: [...state.history.slice(0, state.historyIndex + 1), newPage],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  updateBlock: (id, updates) => {
    set((state) => {
      if (!state.currentPage) return state;

      const newPage = {
        ...state.currentPage,
        blocks: updateBlockInTree(state.currentPage.blocks, id, updates),
      };

      return {
        currentPage: newPage,
        isDirty: true,
        history: [...state.history.slice(0, state.historyIndex + 1), newPage],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  moveBlock: (id, targetIndex, parentId) => {
    set((state) => {
      if (!state.currentPage) return state;
      if (parentId) {
        return state;
      }

      const currentIndex = state.currentPage.blocks.findIndex((b) => b.id === id);
      if (currentIndex < 0 || currentIndex === targetIndex) {
        return state;
      }

      const reorderedBlocks = arrayMove(state.currentPage.blocks, currentIndex, targetIndex);
      const newPage = {
        ...state.currentPage,
        blocks: reorderedBlocks,
      };

      return {
        currentPage: newPage,
        isDirty: true,
        history: [...state.history.slice(0, state.historyIndex + 1), newPage],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  duplicateBlock: (id) => {
    set((state) => {
      if (!state.currentPage) return state;

      const block = findBlockById(state.currentPage.blocks, id);
      if (!block) return state;

      const duplicated: BlockData = {
        ...block,
        id: `${block.id}-copy-${Date.now()}`,
      };

      const newPage = { ...state.currentPage };
      newPage.blocks = [...newPage.blocks, duplicated];

      return {
        currentPage: newPage,
        isDirty: true,
        history: [...state.history.slice(0, state.historyIndex + 1), newPage],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  history: [],
  historyIndex: -1,

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          currentPage: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          currentPage: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    });
  },
}));
