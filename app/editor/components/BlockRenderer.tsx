'use client';

/**
 * BlockRenderer - Renderiza um bloco individual
 * Renderização simples dos blocos no canvas
 */

import { BlockData } from '@/lib/editor-types';
import { useEditorStore } from '@/lib/editor-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function BlockRenderer({ block }: { block: BlockData }) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const isSelected = selectedBlockId === block.id;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(block.id);
  };

  const renderBlockContent = () => {
    const props = block.props;

    switch (block.type) {
      case 'hero-section':
        return (
          <div
            className="relative overflow-hidden p-8 bg-gradient-to-r from-[#071F5E] to-[#1d56c8] rounded-lg text-white min-h-56 flex flex-col justify-center"
            style={{
              backgroundImage: props.bgImage ? `linear-gradient(rgba(7,31,94,0.76), rgba(29,86,200,0.76)), url(${props.bgImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
            {props.bgImage ? (
              <p className="mb-2 text-[11px] font-medium text-white/80">Imagem de fundo configurada</p>
            ) : (
              <p className="mb-2 text-[11px] font-medium text-amber-200">Sem imagem de fundo</p>
            )}
            <h1 className="text-3xl font-bold mb-4">{props.title}</h1>
            <p className="text-base mb-6 text-white/90">{props.subtitle}</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded font-semibold w-fit">
              {props.ctaText}
            </button>
          </div>
        );

      case 'system-section':
        return (
          <div
            className="p-6 rounded-lg border border-[#071F5E]/15 text-white"
            style={{ backgroundColor: props.backgroundColor || '#071F5E' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
            <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
            <div className="text-white/85">{props.subtitle}</div>
          </div>
        );

      case 'segments-section':
      case 'solutions-section':
      case 'stats-section':
      case 'partners-section':
        return (
          <div
            className="p-6 rounded-lg border border-slate-200"
            style={{ backgroundColor: props.backgroundColor || '#ffffff' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Homepage</p>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{props.title}</h3>
            {props.subtitle ? <p className="text-slate-600">{props.subtitle}</p> : null}
          </div>
        );

      case 'free-text':
        return (
          <div className="p-4 rounded border border-slate-200 bg-white" style={{ fontSize: props.fontSize, textAlign: props.textAlign }}>
            {props.content}
          </div>
        );

      case 'image':
        return (
          <div className="rounded-lg overflow-hidden bg-slate-100 min-h-64 flex items-center justify-center">
            <div className="text-slate-400">
              {props.src ? <img src={props.src} alt={props.alt} /> : '📷 Imagem'}
            </div>
          </div>
        );

      case 'spacer':
        return <div style={{ height: props.height, backgroundColor: '#f0f0f0' }} />;

      default:
        return (
          <div className="p-4 bg-slate-100 rounded text-slate-600">
            Bloco tipo: {block.type}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={style}
      className={`relative mb-4 group cursor-pointer transition ${
        isSelected
          ? 'ring-2 ring-blue-500 rounded-lg'
          : 'hover:ring-2 hover:ring-blue-300 rounded-lg'
      }`}
    >
      <button
        type="button"
        className="absolute left-2 top-2 z-20 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100"
        title="Arrastar bloco"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        arrastar
      </button>
      <div className="relative">{renderBlockContent()}</div>

      {isSelected && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Deletar
          </button>
        </div>
      )}
    </div>
  );
}
