/**
 * Store global do editor usando Zustand
 * Gerencia estado do editor, blocos selecionados, e layout
 */

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { PageSchema, BlockData } from './editor-types';

/** Máximo de snapshots no undo (evita memória ilimitada). */
const MAX_EDITOR_HISTORY = 20;

function commitHistory(
  history: PageSchema[],
  historyIndex: number,
  nextPage: PageSchema
): { history: PageSchema[]; historyIndex: number } {
  const snapshot = JSON.parse(JSON.stringify(nextPage)) as PageSchema;
  let branch = [...history.slice(0, historyIndex + 1), snapshot];
  let nextIndex = branch.length - 1;
  if (branch.length > MAX_EDITOR_HISTORY) {
    const excess = branch.length - MAX_EDITOR_HISTORY;
    branch = branch.slice(excess);
    nextIndex = branch.length - 1;
  }
  return { history: branch, historyIndex: nextIndex };
}

interface EditorStore {
  // Estado da página
  currentPage: PageSchema | null;
  setCurrentPage: (page: PageSchema) => void;
  /** Troca de página/idioma ou carga inicial: histórico limpo (undo não volta ao layout anterior). */
  bootstrapEditorPage: (page: PageSchema) => void;
  /** Resposta do servidor após PUT (manual/autosave): substitui o estado atual sem empilhar novo passo no histórico. */
  syncPageFromPersist: (page: PageSchema) => void;

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
  /** Insere na posição (0 = topo); para anexar ao fim use `blocks.length`. */
  addBlockAt: (block: BlockData, index: number, parentId?: string) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, props: Partial<BlockData>) => void;
  moveBlock: (id: string, targetIndex: number, parentId?: string) => void;
  duplicateBlock: (id: string) => void;

  // Editor state
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  /** Modo extra: editar textos diretamente no canvas (Lista), sem depender só da barra lateral. */
  canvasDirectEdit: boolean;
  setCanvasDirectEdit: (on: boolean) => void;

  /** Zoom da lista de blocos (75–125 %), estilo Figma/Framer. */
  canvasListZoom: number;
  setCanvasListZoom: (pct: number) => void;
  /** Grelha de fundo no canvas da lista (referência visual). */
  canvasListGrid: boolean;
  setCanvasListGrid: (on: boolean) => void;

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
    const clone = JSON.parse(JSON.stringify(page)) as PageSchema;
    set((state) => {
      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, clone);
      return {
        currentPage: clone,
        history,
        historyIndex,
        isDirty: false,
      };
    });
  },

  bootstrapEditorPage: (page) => {
    const clone = JSON.parse(JSON.stringify(page)) as PageSchema;
    set({
      currentPage: clone,
      history: [clone],
      historyIndex: 0,
      isDirty: false,
      selectedBlockId: null,
    });
  },

  syncPageFromPersist: (page) => {
    const clone = JSON.parse(JSON.stringify(page)) as PageSchema;
    set((state) => {
      if (state.history.length === 0) {
        return {
          currentPage: clone,
          history: [clone],
          historyIndex: 0,
          isDirty: false,
          selectedBlockId:
            state.selectedBlockId && findBlockById(clone.blocks, state.selectedBlockId)
              ? state.selectedBlockId
              : null,
        };
      }
      const history = state.history.slice(0, state.historyIndex + 1);
      history[history.length - 1] = clone;
      const nextSel =
        state.selectedBlockId && findBlockById(clone.blocks, state.selectedBlockId)
          ? state.selectedBlockId
          : null;
      return {
        currentPage: clone,
        history,
        historyIndex: history.length - 1,
        isDirty: false,
        selectedBlockId: nextSel,
      };
    });
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

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        history,
        historyIndex,
      };
    });
  },

  addBlockAt: (block, index, parentId) => {
    set((state) => {
      if (!state.currentPage) return state;
      if (parentId) {
        return state;
      }

      const blocks = [...state.currentPage.blocks];
      const i = Math.max(0, Math.min(index, blocks.length));
      blocks.splice(i, 0, block);
      const newPage = { ...state.currentPage, blocks };

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        selectedBlockId: block.id,
        history,
        historyIndex,
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

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        history,
        historyIndex,
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

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        history,
        historyIndex,
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

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        history,
        historyIndex,
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

      const { history, historyIndex } = commitHistory(state.history, state.historyIndex, newPage);
      return {
        currentPage: newPage,
        isDirty: true,
        history,
        historyIndex,
      };
    });
  },

  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  canvasDirectEdit: false,
  setCanvasDirectEdit: (on) => set({ canvasDirectEdit: on }),

  canvasListZoom: 100,
  setCanvasListZoom: (pct) =>
    set({
      canvasListZoom: Math.min(160, Math.max(50, Math.round(pct))),
    }),
  canvasListGrid: false,
  setCanvasListGrid: (on) => set({ canvasListGrid: on }),

  history: [],
  historyIndex: -1,

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const nextIndex = state.historyIndex - 1;
        const nextPage = state.history[nextIndex];
        return {
          currentPage: nextPage ? (JSON.parse(JSON.stringify(nextPage)) as PageSchema) : state.currentPage,
          historyIndex: nextIndex,
          isDirty: true,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const nextIndex = state.historyIndex + 1;
        const nextPage = state.history[nextIndex];
        return {
          currentPage: nextPage ? (JSON.parse(JSON.stringify(nextPage)) as PageSchema) : state.currentPage,
          historyIndex: nextIndex,
          isDirty: true,
        };
      }
      return state;
    });
  },
}));
