'use client';

/**
 * Controlo de vista do canvas (Lista): zoom e grelha — referência tipo Figma/Framer.
 */

import { useEditorStore } from '@/lib/editor-store';
import { Grid3x3, ZoomIn } from 'lucide-react';

const ZOOM_STEPS = [75, 90, 100, 110, 125] as const;

export function CanvasListChrome() {
  const zoom = useEditorStore((s) => s.canvasListZoom);
  const setZoom = useEditorStore((s) => s.setCanvasListZoom);
  const grid = useEditorStore((s) => s.canvasListGrid);
  const setGrid = useEditorStore((s) => s.setCanvasListGrid);

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-3 py-1.5"
      data-editor-no-escape-deselect
    >
      <div className="flex items-center gap-1.5">
        <ZoomIn className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Zoom</span>
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
        >
          {ZOOM_STEPS.map((z) => (
            <option key={z} value={z}>
              {z}%
            </option>
          ))}
        </select>
      </div>
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">
        <input
          type="checkbox"
          className="h-3 w-3 rounded border-slate-300 text-violet-600"
          checked={grid}
          onChange={(e) => setGrid(e.target.checked)}
        />
        <Grid3x3 className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        Grelha
      </label>
      <span className="hidden text-[10px] text-slate-400 sm:inline">Atalhos: Ctrl+D duplicar · Del apagar bloco</span>
    </div>
  );
}
