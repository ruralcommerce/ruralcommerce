'use client';

/**
 * Canvas - Área principal do editor
 * Exibe os blocos e permite seleção
 */

import { Fragment, useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { BlockRenderer } from './BlockRenderer';
import { PaletteInsertZone } from './PaletteInsertZone';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function Canvas() {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const canvasListZoom = useEditorStore((s) => s.canvasListZoom);
  const canvasListGrid = useEditorStore((s) => s.canvasListGrid);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverDragId(event.over ? String(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverDragId(null);
    if (!over || active.id === over.id || !currentPage) return;

    const targetIndex = currentPage.blocks.findIndex((b) => b.id === over.id);
    if (targetIndex >= 0) {
      moveBlock(String(active.id), targetIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setOverDragId(null);
  };

  const activeBlock =
    activeDragId && currentPage ? currentPage.blocks.find((b) => b.id === activeDragId) : null;

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

  const z = canvasListZoom / 100;

  return (
    <div
      onClick={() => selectBlock(null)}
      className="editor-scroll h-full min-h-0 bg-white p-8"
    >
      <div
        className="mx-auto max-w-4xl origin-top transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${z})`,
          ...(canvasListGrid
            ? {
                backgroundImage:
                  'radial-gradient(circle at center, rgb(203 213 225) 0.85px, transparent 0.95px)',
                backgroundSize: '14px 14px',
                borderRadius: '12px',
                padding: '6px',
              }
            : {}),
        }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{currentPage.title}</h1>
          <div className="text-sm text-slate-500 mt-1">
            {currentPage.blocks.length} bloco{currentPage.blocks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={currentPage.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {currentPage.blocks.map((block) => {
                const showInsertLine =
                  Boolean(activeDragId) &&
                  overDragId === block.id &&
                  activeDragId !== block.id;
                const dropTarget = showInsertLine;
                return (
                  <Fragment key={block.id}>
                    {showInsertLine ? (
                      <div
                        className="pointer-events-none -mb-1 h-1 w-full rounded-full bg-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.55)]"
                        aria-hidden
                      />
                    ) : null}
                    <BlockRenderer block={block} dropTarget={dropTarget} />
                  </Fragment>
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
            {activeBlock ? (
              <div className="max-w-md rounded-lg border-2 border-violet-400 bg-white/95 p-3 shadow-2xl backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">
                  {activeBlock.type}
                </p>
                <p className="mt-1 line-clamp-3 text-xs text-slate-700">
                  {String(
                    (activeBlock.props as { title?: string }).title ??
                      (activeBlock.props as { text?: string }).text ??
                      (activeBlock.props as { label?: string }).label ??
                      (activeBlock.props as { content?: string }).content ??
                      'Arrastar…'
                  )}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <PaletteInsertZone insertIndex={currentPage.blocks.length} />

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
