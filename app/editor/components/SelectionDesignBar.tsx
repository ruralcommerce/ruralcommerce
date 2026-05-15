'use client';

/**
 * Barra contextual compacta (Figma/Framer/Elementor): ajustes visuais,
 * espaçamento genérico, ações rápidas e atalhos.
 */

import { useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { BLOCK_LIBRARY, type BlockData, type BlockDefinition } from '@/lib/editor-types';
import { findBlockPath } from '@/lib/editor-utils';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  PanelRightOpen,
  Trash2,
} from 'lucide-react';

function MiniColor({ value, onChange, title }: { value: string; onChange: (v: string) => void; title: string }) {
  const t = (value || '').trim();
  const safe = /^#([0-9A-Fa-f]{6})$/.test(t)
    ? t.toLowerCase()
    : /^#([0-9A-Fa-f]{3})$/.test(t)
      ? `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase()
      : '#009179';
  return (
    <label
      className="inline-flex h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
      title={title}
    >
      <span className="sr-only">{title}</span>
      <input
        type="color"
        value={safe}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        className="h-full w-full min-h-[28px] min-w-[28px] cursor-pointer border-0 p-0"
      />
    </label>
  );
}

const RADIUS_PRESETS: { label: string; value: string }[] = [
  { label: '0', value: '0' },
  { label: 'S', value: '0.25rem' },
  { label: 'M', value: '0.5rem' },
  { label: 'L', value: '0.75rem' },
  { label: 'XL', value: '1rem' },
  { label: 'Pill', value: '9999px' },
];

const SPACE_PRESETS = ['', '8px', '12px', '16px', '24px', '32px', '48px', '64px', '96px'] as const;

function hasEditable(def: BlockDefinition | undefined, key: string): boolean {
  return Boolean(def?.editableProps?.includes(key));
}

function patchBlockProps(block: BlockData, updateBlock: (id: string, u: Partial<BlockData>) => void, partial: Record<string, unknown>) {
  updateBlock(block.id, { props: { ...block.props, ...partial } });
}

function SpacingPair({
  block,
  def,
  p,
  updateBlock,
}: {
  block: BlockData;
  def: BlockDefinition | undefined;
  p: Record<string, unknown>;
  updateBlock: (id: string, u: Partial<BlockData>) => void;
}) {
  const mt = hasEditable(def, 'marginTop');
  const mb = hasEditable(def, 'marginBottom');
  if (!mt && !mb) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Espaço</span>
      {mt ? (
        <select
          value={String(p.marginTop ?? '')}
          onChange={(e) => patchBlockProps(block, updateBlock, { marginTop: e.target.value })}
          title="Margem superior"
          className="max-w-[5.5rem] rounded-md border border-slate-200 bg-white py-0.5 pl-1 pr-5 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
        >
          <option value="">↑ auto</option>
          {SPACE_PRESETS.filter(Boolean).map((s) => (
            <option key={`mt-${s}`} value={s}>
              ↑ {s}
            </option>
          ))}
        </select>
      ) : null}
      {mb ? (
        <select
          value={String(p.marginBottom ?? '')}
          onChange={(e) => patchBlockProps(block, updateBlock, { marginBottom: e.target.value })}
          title="Margem inferior"
          className="max-w-[5.5rem] rounded-md border border-slate-200 bg-white py-0.5 pl-1 pr-5 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
        >
          <option value="">↓ auto</option>
          {SPACE_PRESETS.filter(Boolean).map((s) => (
            <option key={`mb-${s}`} value={s}>
              ↓ {s}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

export function SelectionDesignBar({ onOpenPanel }: { onOpenPanel: () => void }) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (
        t?.closest('[data-editor-no-escape-deselect]') ||
        t?.tagName === 'INPUT' ||
        t?.tagName === 'TEXTAREA' ||
        t?.tagName === 'SELECT' ||
        (t && (t as HTMLElement).isContentEditable)
      ) {
        return;
      }
      if (selectedBlockId) selectBlock(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedBlockId, selectBlock]);

  if (!currentPage || !selectedBlockId) return null;

  const path = findBlockPath(currentPage.blocks, selectedBlockId);
  const block = path?.[path.length - 1];
  if (!block) return null;

  const def = BLOCK_LIBRARY[block.type];
  const label = def?.label ?? block.type;
  const p = block.props as Record<string, unknown>;

  const handleDelete = () => {
    if (!window.confirm('Eliminar este bloco? (Pode desfazer no menu Mais)')) return;
    removeBlock(block.id);
    selectBlock(null);
  };

  return (
    <div
      data-editor-no-escape-deselect
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-3 py-2"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[11px] font-semibold text-slate-800">{label}</span>
        <span className="hidden font-mono text-[10px] text-slate-400 sm:inline">{block.type}</span>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

      <SpacingPair block={block} def={def} p={p} updateBlock={updateBlock} />

      {block.type === 'button-block' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Fundo</span>
            <MiniColor
              title="Cor de fundo"
              value={String(p.backgroundColor ?? '#009179')}
              onChange={(v) => patchBlockProps(block, updateBlock, { backgroundColor: v })}
            />
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Texto</span>
            <MiniColor
              title="Cor do texto"
              value={String(p.textColor ?? '#ffffff')}
              onChange={(v) => patchBlockProps(block, updateBlock, { textColor: v })}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Estilo</span>
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-px shadow-sm">
              <button
                type="button"
                title="Preenchido"
                onClick={() => patchBlockProps(block, updateBlock, { variant: 'solid' })}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  String(p.variant ?? 'solid') !== 'outline' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cheio
              </button>
              <button
                type="button"
                title="Contorno"
                onClick={() => patchBlockProps(block, updateBlock, { variant: 'outline' })}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  String(p.variant ?? 'solid') === 'outline' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contorno
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Raio</span>
            <div className="flex flex-wrap gap-0.5">
              {RADIUS_PRESETS.map((r) => {
                const cur = String(p.borderRadius ?? '0.5rem');
                const active = cur === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    title={r.value}
                    onClick={() => patchBlockProps(block, updateBlock, { borderRadius: r.value })}
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                      active
                        ? 'border-violet-500 bg-violet-50 text-violet-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {block.type === 'heading-block' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Cor</span>
            <MiniColor
              title="Cor do título"
              value={String(p.color ?? '#0f172a')}
              onChange={(v) => patchBlockProps(block, updateBlock, { color: v })}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Nível</span>
            <select
              value={String(Math.min(6, Math.max(1, Number(p.level) || 2)))}
              onChange={(e) => patchBlockProps(block, updateBlock, { level: Number(e.target.value) })}
              className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  H{n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-px shadow-sm">
            {(
              [
                { v: 'left', Icon: AlignLeft },
                { v: 'center', Icon: AlignCenter },
                { v: 'right', Icon: AlignRight },
              ] as const
            ).map(({ v, Icon }) => {
              const cur = String(p.align ?? 'left');
              const active = cur === v;
              return (
                <button
                  key={v}
                  type="button"
                  title={v}
                  onClick={() => patchBlockProps(block, updateBlock, { align: v })}
                  className={`rounded p-1 ${active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {block.type === 'free-text' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Alinhar</span>
            <select
              value={String(p.textAlign ?? 'left')}
              onChange={(e) => patchBlockProps(block, updateBlock, { textAlign: e.target.value })}
              className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
              <option value="justify">Justificado</option>
            </select>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Tamanho</span>
            <select
              value={String(p.fontSize ?? '16px')}
              onChange={(e) => patchBlockProps(block, updateBlock, { fontSize: e.target.value })}
              className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
            >
              {['14px', '16px', '18px', '20px', '24px', '30px'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      {block.type === 'image' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-px shadow-sm">
            {(
              [
                { v: 'left', Icon: AlignLeft },
                { v: 'center', Icon: AlignCenter },
                { v: 'right', Icon: AlignRight },
              ] as const
            ).map(({ v, Icon }) => {
              const cur = String(p.align ?? 'center');
              const active = cur === v;
              return (
                <button
                  key={v}
                  type="button"
                  title={v}
                  onClick={() => patchBlockProps(block, updateBlock, { align: v })}
                  className={`rounded p-1 ${active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Largura</span>
            <select
              value={String(p.maxWidth ?? '48rem')}
              onChange={(e) => patchBlockProps(block, updateBlock, { maxWidth: e.target.value })}
              className="max-w-[7rem] rounded-md border border-slate-200 bg-white py-0.5 pl-1 pr-5 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
            >
              {['100%', '36rem', '48rem', '56rem', '72rem', '80rem'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      {block.type === 'spacer' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Altura</span>
            <select
              value={String(p.height ?? '32px')}
              onChange={(e) => patchBlockProps(block, updateBlock, { height: e.target.value })}
              className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
            >
              {['16px', '24px', '32px', '48px', '64px', '96px', '128px', '192px'].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      {block.type === 'layout-divider' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Cor</span>
            <MiniColor
              title="Cor da linha"
              value={String(p.color ?? '#e2e8f0')}
              onChange={(v) => patchBlockProps(block, updateBlock, { color: v })}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Espessura</span>
            <select
              value={String(p.thickness ?? '1px')}
              onChange={(e) => patchBlockProps(block, updateBlock, { thickness: e.target.value })}
              className="rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-6 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
            >
              {['1px', '2px', '3px', '4px', '6px'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      {block.type === 'layout-section' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Fundo</span>
            <MiniColor
              title="Cor de fundo"
              value={String(p.backgroundColor ?? '#f8fafc')}
              onChange={(v) => patchBlockProps(block, updateBlock, { backgroundColor: v })}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Largura máx.</span>
            <select
              value={String(p.maxWidth ?? '72rem')}
              onChange={(e) => patchBlockProps(block, updateBlock, { maxWidth: e.target.value })}
              className="max-w-[7rem] rounded-md border border-slate-200 bg-white py-0.5 pl-1 pr-5 text-[10px] font-semibold text-slate-800 shadow-sm outline-none focus:border-violet-400"
            >
              {['100%', '48rem', '56rem', '64rem', '72rem', '80rem', '96rem'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-slate-600">
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-slate-300"
              checked={Boolean(p.showBorder)}
              onChange={(e) => patchBlockProps(block, updateBlock, { showBorder: e.target.checked })}
            />
            Borda
          </label>
        </>
      ) : null}

      {block.type === 'system-section' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Fundo</span>
            <MiniColor
              title="Cor de fundo da secção"
              value={String(p.backgroundColor ?? '#071F5E')}
              onChange={(v) => patchBlockProps(block, updateBlock, { backgroundColor: v })}
            />
          </div>
        </>
      ) : null}

      {block.type === 'segments-section' || block.type === 'solutions-section' || block.type === 'stats-section' ? (
        <>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Fundo</span>
            <MiniColor
              title="Cor de fundo"
              value={String(p.backgroundColor ?? '#ffffff')}
              onChange={(v) => patchBlockProps(block, updateBlock, { backgroundColor: v })}
            />
          </div>
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => duplicateBlock(block.id)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          title="Duplicar (Ctrl+D)"
        >
          <Copy className="h-3.5 w-3.5" />
          Dup
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-[10px] font-semibold text-red-700 shadow-sm hover:bg-red-50"
          title="Eliminar bloco (Del)"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onOpenPanel}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          title="Abrir todas as propriedades no painel"
        >
          <PanelRightOpen className="h-3.5 w-3.5" />
          Painel
        </button>
        <button
          type="button"
          onClick={() => selectBlock(null)}
          className="rounded-md px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          title="Desmarcar (Esc)"
        >
          Esc
        </button>
      </div>
    </div>
  );
}
