'use client';

/**
 * BlockPanel - Painel lateral com blocos disponíveis
 * Permite arrastar novos blocos para o canvas
 */

import { BLOCK_LIBRARY } from '@/lib/editor-types';
import { getBlockLabelForPage } from '@/lib/editor-types';
import { getPaletteBlockTypesForPage } from '@/lib/editor-pages';
import { createBlock } from '@/lib/editor-utils';
import { useEditorStore } from '@/lib/editor-store';

export function BlockPanel({ currentPageSlug = 'homepage' }: { currentPageSlug?: string }) {
  const addBlock = useEditorStore((s) => s.addBlock);
  const availableBlocks = getPaletteBlockTypesForPage(currentPageSlug);

  const handleAddBlock = (blockType: any) => {
    const newBlock = createBlock(blockType);
    addBlock(newBlock);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-sm text-slate-900">Blocos</h2>
      </div>

      <div className="editor-scroll flex-1 space-y-2 p-3">
        {availableBlocks.map((blockType) => {
          const block = BLOCK_LIBRARY[blockType];

          return (
          <div
            key={blockType}
            className="w-full rounded-lg bg-white border border-slate-200 p-3 text-left text-sm"
            title={block.description}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{block.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{getBlockLabelForPage(blockType, currentPageSlug)}</div>
                <div className="text-xs text-slate-500">{block.description}</div>
              </div>
              <button
                type="button"
                onClick={() => handleAddBlock(blockType)}
                className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
