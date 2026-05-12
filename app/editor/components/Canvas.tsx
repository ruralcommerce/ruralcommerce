'use client';

/**
 * Canvas - Área principal do editor
 * Exibe os blocos e permite seleção
 */

import { useEditorStore } from '@/lib/editor-store';
import { BlockRenderer } from './BlockRenderer';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function Canvas() {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentPage) return;

    const targetIndex = currentPage.blocks.findIndex((b) => b.id === over.id);
    if (targetIndex >= 0) {
      moveBlock(String(active.id), targetIndex);
    }
  };

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-slate-500">
          <div className="text-lg font-semibold mb-2">Nenhuma página carregada</div>
          <div className="text-sm">Crie ou carregue uma página para começar</div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => selectBlock(null)}
      className="editor-scroll h-full min-h-0 bg-white p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{currentPage.title}</h1>
          <div className="text-sm text-slate-500 mt-1">
            {currentPage.blocks.length} bloco{currentPage.blocks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={currentPage.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {currentPage.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {currentPage.blocks.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-lg font-semibold mb-2">Página vazia</div>
            <div className="text-sm">Use o painel de blocos para adicionar elementos</div>
          </div>
        )}
      </div>
    </div>
  );
}
