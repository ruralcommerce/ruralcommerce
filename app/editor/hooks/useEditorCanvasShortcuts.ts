'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';

function isTypingTarget(e: KeyboardEvent): boolean {
  const candidates = [e.target as HTMLElement | null, document.activeElement as HTMLElement | null];
  for (const el of candidates) {
    if (!el) continue;
    if (el.closest('[data-editor-no-escape-deselect]')) return true;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
  }
  return false;
}

/**
 * Atalhos na aba Lista: Ctrl/Cmd+D duplicar, Delete apagar bloco selecionado.
 */
export function useEditorCanvasShortcuts(enabled: boolean) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return;
      if (!selectedBlockId) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        removeBlock(selectedBlockId);
        selectBlock(null);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, selectedBlockId, duplicateBlock, removeBlock, selectBlock]);
}
