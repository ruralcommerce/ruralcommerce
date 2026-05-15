'use client';

/**
 * Navegação compacta da ordem dos blocos: um select + subir/descer o bloco selecionado.
 */

import { useEditorStore } from '@/lib/editor-store';
import { getBlockLabelForPage, type BlockType } from '@/lib/editor-types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function BlockNavigatorSelect({
  currentPageSlug,
  onPickBlock,
}: {
  currentPageSlug: string;
  /** Chamado após escolher um bloco (ex.: abrir painel Propriedades). */
  onPickBlock?: () => void;
}) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);

  if (!currentPage?.blocks.length) {
    return (
      <span className="text-[11px] text-slate-400" title="Sem blocos nesta página">
        —
      </span>
    );
  }

  const blocks = currentPage.blocks;
  const selectedIndex = selectedBlockId ? blocks.findIndex((b) => b.id === selectedBlockId) : -1;
  const value =
    selectedIndex >= 0 && selectedBlockId != null && selectedBlockId !== ''
      ? selectedBlockId
      : '';

  const moveSelected = (dir: -1 | 1) => {
    if (!selectedBlockId || selectedIndex < 0) return;
    const next = selectedIndex + dir;
    if (next < 0 || next >= blocks.length) return;
    moveBlock(selectedBlockId, next);
  };

  return (
    <div className="flex max-w-full items-center gap-0.5">
      <label htmlFor="editor-block-nav" className="sr-only">
        Ir para bloco
      </label>
      <select
        id="editor-block-nav"
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) {
            selectBlock(null);
            return;
          }
          selectBlock(id);
          onPickBlock?.();
        }}
        className="max-w-[min(100vw-12rem,14rem)] truncate rounded-md border border-slate-200 bg-white py-1 pl-2 pr-6 text-[11px] font-medium text-slate-800 shadow-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
        title="Escolher bloco na ordem da página"
      >
        <option value="">Bloco…</option>
        {blocks.map((block, index) => {
          const label = getBlockLabelForPage(block.type as BlockType, currentPageSlug);
          const short = label.length > 36 ? `${label.slice(0, 34)}…` : label;
          return (
            <option key={block.id} value={block.id}>
              {index + 1}. {short}
            </option>
          );
        })}
      </select>
      <button
        type="button"
        title="Subir bloco selecionado"
        disabled={selectedIndex <= 0}
        onClick={() => moveSelected(-1)}
        className="rounded border border-slate-200 bg-white p-1 text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-30"
      >
        <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        title="Descer bloco selecionado"
        disabled={selectedIndex < 0 || selectedIndex >= blocks.length - 1}
        onClick={() => moveSelected(1)}
        className="rounded border border-slate-200 bg-white p-1 text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-30"
      >
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
