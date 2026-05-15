'use client';

import { useCallback, useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { BLOCK_LIBRARY, type BlockType } from '@/lib/editor-types';
import { createBlock } from '@/lib/editor-utils';

const MIME = 'application/x-rc-block-type';

function hasPalettePayload(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes(MIME);
}

/** Faixa fina entre blocos: soltar um tipo da paleta (arrastar) insere neste índice. */
export function PaletteInsertZone({ insertIndex }: { insertIndex: number }) {
  const addBlockAt = useEditorStore((s) => s.addBlockAt);
  const [over, setOver] = useState(false);

  const endDrag = useCallback(() => setOver(false), []);

  return (
    <div
      className={`group/zone rounded-md border border-dashed transition-all ${
        over ? 'border-emerald-500 bg-emerald-50 py-2 shadow-sm' : 'border-transparent py-0.5 hover:border-slate-200 hover:bg-slate-50'
      }`}
      onDragEnter={(e) => {
        if (hasPalettePayload(e)) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) endDrag();
      }}
      onDragOver={(e) => {
        if (!hasPalettePayload(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setOver(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        endDrag();
        const raw = e.dataTransfer.getData(MIME);
        if (!raw || !(raw in BLOCK_LIBRARY)) return;
        const newBlock = createBlock(raw as BlockType);
        addBlockAt(newBlock, insertIndex);
      }}
    >
      <p
        className={`text-center text-[10px] font-semibold uppercase tracking-wide transition-opacity ${
          over ? 'text-emerald-700 opacity-100' : 'text-slate-400 opacity-0 group-hover/zone:opacity-100'
        }`}
      >
        {over ? 'Largar para inserir' : 'Inserir da paleta'}
      </p>
    </div>
  );
}
