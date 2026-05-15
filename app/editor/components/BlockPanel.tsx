'use client';

/**
 * Paleta de widgets — visual compacto e legível (referência: Elementor / editores modernos).
 */

import { useMemo, useState } from 'react';
import { BLOCK_LIBRARY, getBlockLabelForPage, type BlockType } from '@/lib/editor-types';
import { getPaletteCardLabel, getPaletteSectionBlocks, type PaletteSections } from '@/lib/editor-palette';
import { EDITOR_PALETTE_ICONS } from '@/lib/editor-palette-icons';
import { createBlock } from '@/lib/editor-utils';
import { useEditorStore } from '@/lib/editor-store';
import { Plus, Search } from 'lucide-react';

const MIME = 'application/x-rc-block-type';

const SECTIONS: {
  key: keyof Pick<PaletteSections, 'structure' | 'content' | 'interaction'>;
  title: string;
  hint: string;
  defaultOpen: boolean;
}[] = [
  {
    key: 'structure',
    title: 'Estrutura',
    hint: 'Container, colunas, divisor, espaço.',
    defaultOpen: true,
  },
  {
    key: 'content',
    title: 'Conteúdo',
    hint: 'Título, texto, imagem, vídeo, mapa, botão.',
    defaultOpen: true,
  },
  {
    key: 'interaction',
    title: 'Interação',
    hint: 'Acordeão, abas, progresso, preços, HTML.',
    defaultOpen: true,
  },
];

function paletteSearchMatch(blockType: BlockType, pageSlug: string, q: string, kind: 'atomic' | 'section'): boolean {
  if (!q) return true;
  const def = BLOCK_LIBRARY[blockType];
  const card = getPaletteCardLabel(blockType, pageSlug, kind).toLowerCase();
  const catalog = (def?.label ?? '').toLowerCase();
  const pageLabel = getBlockLabelForPage(blockType, pageSlug).toLowerCase();
  const desc = (def?.description ?? '').toLowerCase();
  const slug = blockType.replace(/-/g, ' ').toLowerCase();
  return (
    card.includes(q) ||
    catalog.includes(q) ||
    pageLabel.includes(q) ||
    desc.includes(q) ||
    slug.includes(q)
  );
}

export function BlockPanel({ currentPageSlug = 'homepage' }: { currentPageSlug?: string }) {
  const addBlock = useEditorStore((s) => s.addBlock);
  const palette = getPaletteSectionBlocks(currentPageSlug);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return {
      structure: palette.structure.filter((t) => paletteSearchMatch(t, currentPageSlug, q, 'atomic')),
      content: palette.content.filter((t) => paletteSearchMatch(t, currentPageSlug, q, 'atomic')),
      interaction: palette.interaction.filter((t) => paletteSearchMatch(t, currentPageSlug, q, 'atomic')),
      sections: palette.sections.filter((t) => paletteSearchMatch(t, currentPageSlug, q, 'section')),
    };
  }, [palette, query, currentPageSlug]);

  const handleAddBlock = (blockType: BlockType) => {
    addBlock(createBlock(blockType));
  };

  const totalMatches =
    filtered.structure.length +
    filtered.content.length +
    filtered.interaction.length +
    filtered.sections.length;

  const renderWidgetCard = (blockType: BlockType, kind: 'atomic' | 'section') => {
    const block = BLOCK_LIBRARY[blockType];
    const Icon = EDITOR_PALETTE_ICONS[blockType];
    const label = getPaletteCardLabel(blockType, currentPageSlug, kind);

    return (
      <div
        key={`${kind}-${blockType}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(MIME, blockType);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        title={`${block.description} — Arraste para a lista ou use +.`}
        className="group relative"
      >
        <div className="flex min-h-[4.5rem] cursor-grab flex-col items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-1.5 py-2 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all active:cursor-grabbing hover:border-violet-400/55 hover:shadow-[0_4px_14px_rgba(109,40,217,0.08)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200/90 bg-slate-50 text-slate-700 shadow-sm transition-[border-color,background-color,color] group-hover:border-violet-300/70 group-hover:bg-violet-50 group-hover:text-violet-700">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </div>
          <span className="line-clamp-2 w-full px-0.5 text-[10px] font-medium leading-snug tracking-tight text-slate-800">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAddBlock(blockType);
          }}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border border-slate-200/90 bg-white text-slate-600 opacity-100 shadow-sm transition hover:border-violet-400 hover:bg-violet-600 hover:text-white md:opacity-0 md:group-hover:opacity-100"
          title="Adicionar ao fim"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f6f8]">
      <div className="shrink-0 space-y-2.5 border-b border-slate-200/70 bg-white px-3 pb-3 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">Widgets</h2>
            <p className="mt-0.5 max-w-[240px] text-[10px] leading-snug text-slate-500">
              Arraste para a lista ou toque em <span className="font-medium text-slate-700">+</span>.
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" strokeWidth={2.25} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="editor-scroll min-h-0 flex-1 space-y-0.5 px-2 pb-3 pt-2">
        {query.trim() && totalMatches === 0 ? (
          <p className="px-1 py-10 text-center text-[11px] text-slate-500">Nenhum resultado.</p>
        ) : null}

        {SECTIONS.map(({ key, title, hint, defaultOpen }) => {
          const types = filtered[key];
          if (!types.length) return null;
          return (
            <details key={key} open={defaultOpen || Boolean(query.trim())} className="rounded-lg bg-transparent">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 py-1.5 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-tight text-slate-800">{title}</p>
                  <p className="text-[10px] leading-snug text-slate-500">{hint}</p>
                </div>
                <span className="shrink-0 rounded-md bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600">
                  {types.length}
                </span>
              </summary>
              <div className="mt-1 grid grid-cols-2 gap-1.5 px-0.5 pb-2">{types.map((t) => renderWidgetCard(t, 'atomic'))}</div>
            </details>
          );
        })}

        {filtered.sections.length > 0 ? (
          <details
            open={Boolean(query.trim())}
            className="mt-1 rounded-lg border border-dashed border-slate-300/80 bg-white/60"
          >
            <summary className="cursor-pointer list-none rounded-lg px-2 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
              <p className="text-[11px] font-semibold text-slate-800">Secções do modelo</p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">Hero, menu, rodapé… Ajuste textos; layouts novos: widgets acima.</p>
            </summary>
            <div className="grid grid-cols-2 gap-1.5 border-t border-slate-200/70 p-2">{filtered.sections.map((t) => renderWidgetCard(t, 'section'))}</div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
