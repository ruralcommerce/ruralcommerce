'use client';

/**
 * BlockRenderer - Renderiza um bloco individual
 * Renderização simples dos blocos no canvas
 */

import { BlockData } from '@/lib/editor-types';
import { useEditorStore } from '@/lib/editor-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { PaletteInsertZone } from './PaletteInsertZone';
import type { CSSProperties, ElementType, FocusEvent, MouseEvent as ReactMouseEvent } from 'react';

export function BlockRenderer({ block, dropTarget }: { block: BlockData; dropTarget?: boolean }) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const canvasDirectEdit = useEditorStore((s) => s.canvasDirectEdit);
  const blocks = useEditorStore((s) => s.currentPage?.blocks ?? []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const isSelected = selectedBlockId === block.id;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const handleClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleDelete = (e: ReactMouseEvent) => {
    e.stopPropagation();
    removeBlock(block.id);
  };

  const blockIndex = blocks.findIndex((b) => b.id === block.id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex >= 0 && blockIndex < blocks.length - 1;

  const handleDuplicate = (e: ReactMouseEvent) => {
    e.stopPropagation();
    duplicateBlock(block.id);
  };

  const handleMoveUp = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!canMoveUp) return;
    moveBlock(block.id, blockIndex - 1);
  };

  const handleMoveDown = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!canMoveDown) return;
    moveBlock(block.id, blockIndex + 1);
  };

  const renderBlockContent = () => {
    const props = block.props;
    const directEdit = canvasDirectEdit;
    const stopPick = (e: ReactMouseEvent) => e.stopPropagation();
    const blurText =
      (field: string) =>
      (e: FocusEvent<HTMLElement>) => {
        const v = e.currentTarget.textContent ?? '';
        updateBlock(block.id, { props: { ...props, [field]: v } });
      };

    switch (block.type) {
      case 'hero-section': {
        const heroWrap = {
          className:
            'relative overflow-hidden p-8 bg-gradient-to-r from-[#071F5E] to-[#1d56c8] rounded-lg text-white min-h-56 flex flex-col justify-center',
          style: {
            backgroundImage: props.bgImage
              ? `linear-gradient(rgba(7,31,94,0.76), rgba(29,86,200,0.76)), url(${props.bgImage})`
              : undefined,
            backgroundSize: 'cover' as const,
            backgroundPosition: 'center' as const,
          },
        };
        if (directEdit) {
          return (
            <div {...heroWrap}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
              {props.bgImage ? (
                <p className="mb-2 text-[11px] font-medium text-white/80">Imagem de fundo configurada</p>
              ) : (
                <p className="mb-2 text-[11px] font-medium text-amber-200">Sem imagem de fundo</p>
              )}
              <h1
                key={`${block.id}-t-${props.title}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('title')}
                className="text-3xl font-bold mb-4 outline-none ring-offset-2 ring-offset-transparent focus:ring-2 focus:ring-white/80 rounded-sm"
              >
                {props.title}
              </h1>
              <p
                key={`${block.id}-s-${props.subtitle}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('subtitle')}
                className="text-base mb-4 text-white/90 outline-none min-h-[1.5em] focus:ring-2 focus:ring-white/80 rounded-sm"
              >
                {props.subtitle}
              </p>
              <span
                key={`${block.id}-cta-${props.ctaText}`}
                role="presentation"
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('ctaText')}
                className="inline-block bg-white text-blue-600 px-6 py-2 rounded font-semibold w-fit outline-none focus:ring-2 focus:ring-violet-300"
              >
                {props.ctaText}
              </span>
              <p
                key={`${block.id}-sec-${props.secondaryText}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('secondaryText')}
                className="mt-3 text-sm text-white/85 underline-offset-2 outline-none focus:ring-2 focus:ring-white/70 rounded-sm"
              >
                {props.secondaryText || 'Texto secundário'}
              </p>
            </div>
          );
        }
        return (
          <div className={heroWrap.className} style={heroWrap.style}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
            {props.bgImage ? (
              <p className="mb-2 text-[11px] font-medium text-white/80">Imagem de fundo configurada</p>
            ) : (
              <p className="mb-2 text-[11px] font-medium text-amber-200">Sem imagem de fundo</p>
            )}
            <h1 className="text-3xl font-bold mb-4">{props.title}</h1>
            <p className="text-base mb-6 text-white/90">{props.subtitle}</p>
            <button type="button" className="bg-white text-blue-600 px-6 py-2 rounded font-semibold w-fit">
              {props.ctaText}
            </button>
          </div>
        );
      }

      case 'system-section':
        if (directEdit) {
          return (
            <div
              className="p-6 rounded-lg border border-[#071F5E]/15 text-white"
              style={{ backgroundColor: props.backgroundColor || '#071F5E' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
              <h2
                key={`${block.id}-st-${props.title}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('title')}
                className="text-2xl font-bold mb-2 outline-none focus:ring-2 focus:ring-white/70 rounded-sm"
              >
                {props.title}
              </h2>
              <div
                key={`${block.id}-ss-${props.subtitle}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('subtitle')}
                className="text-white/85 outline-none min-h-[2em] focus:ring-2 focus:ring-white/60 rounded-sm"
              >
                {props.subtitle}
              </div>
            </div>
          );
        }
        return (
          <div
            className="p-6 rounded-lg border border-[#071F5E]/15 text-white"
            style={{ backgroundColor: props.backgroundColor || '#071F5E' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Homepage</p>
            <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
            <div className="text-white/85">{props.subtitle}</div>
            <div className="mt-3 overflow-hidden rounded-lg border border-white/25 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={String(props.sideImage || '').trim() || '/images/home/home-pic2.png'}
                alt=""
                className="h-36 w-full object-cover object-center opacity-95"
              />
            </div>
          </div>
        );

      case 'segments-section':
      case 'solutions-section':
      case 'stats-section':
      case 'partners-section':
        if (directEdit) {
          return (
            <div
              className="p-6 rounded-lg border border-slate-200"
              style={{ backgroundColor: props.backgroundColor || '#ffffff' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Homepage</p>
              <h3
                key={`${block.id}-seg-${props.title}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('title')}
                className="text-xl font-bold text-slate-900 mb-2 outline-none focus:ring-2 focus:ring-violet-400 rounded-sm"
              >
                {props.title}
              </h3>
              <p
                key={`${block.id}-segs-${props.subtitle}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('subtitle')}
                className="text-slate-600 outline-none min-h-[1.25em] focus:ring-2 focus:ring-violet-300 rounded-sm"
              >
                {props.subtitle || 'Subtítulo'}
              </p>
            </div>
          );
        }
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

      case 'contact-hero-split':
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 bg-[#F5F7FA] p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Contacto — Hero</p>
              <p className="text-center text-sm font-bold text-[#071F5E]">
                <span
                  key={`${block.id}-tl1-${props.titleLine1 || props.title}`}
                  className="block outline-none focus:ring-2 focus:ring-violet-400 rounded-sm"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={stopPick}
                  onBlur={blurText('titleLine1')}
                >
                  {props.titleLine1 || props.title}
                </span>
                <span
                  key={`${block.id}-tl2-${props.titleLine2}`}
                  className="block text-xs font-semibold outline-none focus:ring-2 focus:ring-violet-400 rounded-sm mt-0.5"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={stopPick}
                  onBlur={blurText('titleLine2')}
                >
                  {props.titleLine2 || 'Linha 2'}
                </span>
              </p>
              <p
                key={`${block.id}-chd-${props.description}`}
                className="mt-1 text-center text-xs text-slate-600 outline-none min-h-[2em] focus:ring-2 focus:ring-violet-300 rounded-sm"
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('description')}
              >
                {props.description || 'Descrição'}
              </p>
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-[#F5F7FA] p-4">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Contacto — Hero</p>
            <p className="text-center text-sm font-bold text-[#071F5E]">
              <span className="block">{props.titleLine1 || props.title}</span>
              {props.titleLine2 ? <span className="block text-xs font-semibold">{props.titleLine2}</span> : null}
            </p>
            {props.description ? (
              <p className="mt-1 line-clamp-2 text-center text-xs text-slate-600">{props.description}</p>
            ) : null}
          </div>
        );

      case 'contact-form-split':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Contacto — Formulario</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span className="rounded px-2 py-1 text-white" style={{ backgroundColor: props.leftPanelBg || '#071F5E' }}>
                Panel
              </span>
              <span>{props.phone || 'Teléfono'}</span>
              <span className="col-span-2 truncate">{props.email || 'Email'}</span>
            </div>
            {props.formCopyJson && String(props.formCopyJson).trim() ? (
              <p className="mt-2 text-[10px] text-violet-600">Textos personalizados (formCopyJson)</p>
            ) : (
              <p className="mt-2 text-[10px] text-slate-400">Etiquetas i18n o formCopyJson</p>
            )}
          </div>
        );

      case 'blog-featured':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Blog — Destaque</p>
            {props.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(props.image)} alt="" className="mb-2 h-24 w-full rounded object-cover" />
            ) : null}
            {props.category ? (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{props.category}</p>
            ) : null}
            <p className="line-clamp-2 text-sm font-bold text-slate-900">{props.title || 'Título do destaque'}</p>
            {props.excerpt ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{props.excerpt}</p> : null}
            {props.author ? <p className="mt-1 text-[10px] text-slate-500">{props.author}</p> : null}
          </div>
        );

      case 'blog-posts-grid': {
        let postCount = 0;
        try {
          const parsed = JSON.parse(String(props.postsJson || '[]'));
          postCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          postCount = 0;
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Blog — Grade</p>
            <p className="text-xs text-slate-600">{postCount} artigo(s) na grade</p>
          </div>
        );
      }

      case 'contact-map-split':
        if (directEdit) {
          return (
            <div className="rounded-lg p-4 text-white" style={{ backgroundColor: props.backgroundColor || '#071F5E' }}>
              <p className="mb-1 text-xs font-semibold uppercase text-white/70">Contacto — Mapa</p>
              <p
                key={`${block.id}-cmt-${props.title}`}
                className="text-sm font-bold outline-none focus:ring-2 focus:ring-white/70 rounded-sm"
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('title')}
              >
                {props.title}
              </p>
              <p className="mt-1 text-[11px] text-white/75">
                {props.territoriesGeoJson && String(props.territoriesGeoJson).trim().length > 20
                  ? 'GeoJSON (atendimento / intervencao) + leyenda'
                  : 'Iframe OSM si GeoJSON vacío'}
              </p>
            </div>
          );
        }
        return (
          <div className="rounded-lg p-4 text-white" style={{ backgroundColor: props.backgroundColor || '#071F5E' }}>
            <p className="mb-1 text-xs font-semibold uppercase text-white/70">Contacto — Mapa</p>
            <p className="text-sm font-bold">{props.title}</p>
            <p className="mt-1 text-[11px] text-white/75">
              {props.territoriesGeoJson && String(props.territoriesGeoJson).trim().length > 20
                ? 'GeoJSON (atendimento / intervencao) + leyenda'
                : 'Iframe OSM si GeoJSON vacío'}
            </p>
          </div>
        );

      case 'contact-social-strip':
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 p-4" style={{ backgroundColor: props.pageBg || '#F5F7FA' }}>
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Contacto — Redes</p>
              <p
                key={`${block.id}-cst-${props.title}`}
                className="text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-400 rounded-sm"
                style={{ color: props.titleColor || '#009179' }}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('title')}
              >
                {props.title}
              </p>
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 p-4" style={{ backgroundColor: props.pageBg || '#F5F7FA' }}>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Contacto — Redes</p>
            <p className="text-sm font-semibold" style={{ color: props.titleColor || '#009179' }}>
              {props.title}
            </p>
          </div>
        );

      case 'free-text':
        if (directEdit) {
          return (
            <div
              className="p-4 rounded border border-slate-200 bg-white min-h-[4rem]"
              style={{ fontSize: props.fontSize, textAlign: props.textAlign }}
            >
              <div
                key={`${block.id}-ft-${String(props.content).slice(0, 48)}`}
                className="min-h-[3rem] whitespace-pre-wrap text-slate-900 outline-none focus:ring-2 focus:ring-violet-400 rounded-sm"
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('content')}
              >
                {props.content}
              </div>
            </div>
          );
        }
        return (
          <div className="p-4 rounded border border-slate-200 bg-white" style={{ fontSize: props.fontSize, textAlign: props.textAlign }}>
            {props.content}
          </div>
        );

      case 'rich-text':
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">Texto rico (HTML) — edição direta</p>
              <textarea
                key={`${block.id}-rt-${String(props.contentHtml || '').length}`}
                defaultValue={String(props.contentHtml || '')}
                onMouseDown={stopPick}
                onBlur={(e) =>
                  updateBlock(block.id, {
                    props: { ...props, contentHtml: e.currentTarget.value },
                  })
                }
                className="mt-2 min-h-[120px] w-full resize-y rounded border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-violet-400"
                spellCheck={false}
              />
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">Texto rico (HTML)</p>
            <p className="mt-2 line-clamp-6 font-mono text-[11px] text-slate-700">{String(props.contentHtml || '').slice(0, 320)}</p>
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

      case 'layout-section':
        return (
          <div
            className="rounded-lg border border-dashed border-slate-300 p-4"
            style={{ backgroundColor: props.backgroundColor || '#f8fafc' }}
          >
            <p className="text-xs font-semibold uppercase text-slate-500">Seção</p>
            <p className="text-sm text-slate-700">{props.innerLabel || props.bodyText ? 'Conteúdo definido' : 'Vazio'}</p>
          </div>
        );

      case 'layout-columns': {
        const layout = String(props.layout ?? '50-50');
        const gtc = String(props.gridTemplateColumns ?? '').trim();
        const showThird = layout === '33-33-34' || gtc.split(/\s+/).filter(Boolean).length > 2;
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">
                Colunas — {props.layout || '50-50'}
                {props.gridTemplateColumns ? (
                  <span className="ml-1 font-mono text-[10px] text-slate-600">({String(props.gridTemplateColumns).slice(0, 28)}…)</span>
                ) : null}
              </p>
              <div
                className={`mt-2 grid gap-2 text-[11px] text-slate-700 ${showThird ? 'grid-cols-3' : 'grid-cols-2'}`}
              >
                <div
                  key={`${block.id}-lc-l-${props.leftText}`}
                  className="min-h-[2.5rem] whitespace-pre-wrap rounded bg-slate-50 p-2 outline-none focus:ring-2 focus:ring-violet-400"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={stopPick}
                  onBlur={blurText('leftText')}
                >
                  {props.leftText}
                </div>
                <div
                  key={`${block.id}-lc-r-${props.rightText}`}
                  className="min-h-[2.5rem] whitespace-pre-wrap rounded bg-slate-50 p-2 outline-none focus:ring-2 focus:ring-violet-400"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={stopPick}
                  onBlur={blurText('rightText')}
                >
                  {props.rightText}
                </div>
                {showThird ? (
                  <div
                    key={`${block.id}-lc-t-${props.thirdText}`}
                    className="min-h-[2.5rem] whitespace-pre-wrap rounded bg-slate-50 p-2 outline-none focus:ring-2 focus:ring-violet-400"
                    contentEditable
                    suppressContentEditableWarning
                    onMouseDown={stopPick}
                    onBlur={blurText('thirdText')}
                  >
                    {props.thirdText}
                  </div>
                ) : null}
              </div>
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">
              Colunas — {props.layout || '50-50'}
              {props.gridTemplateColumns ? (
                <span className="ml-1 font-mono text-[10px] text-slate-600">({String(props.gridTemplateColumns).slice(0, 28)}…)</span>
              ) : null}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="line-clamp-3 rounded bg-slate-50 p-2">{props.leftText}</div>
              <div className="line-clamp-3 rounded bg-slate-50 p-2">{props.rightText}</div>
            </div>
          </div>
        );
      }

      case 'layout-divider':
        return (
          <div className="py-2">
            <div style={{ height: props.thickness || '1px', backgroundColor: props.color || '#e2e8f0' }} />
          </div>
        );

      case 'heading-block': {
        const L = Math.min(6, Math.max(1, Number(props.level) || 2));
        const size = L <= 2 ? 'text-xl' : L === 3 ? 'text-lg' : 'text-base';
        const Heading = `h${L}` as ElementType;
        const align = String(props.align ?? 'left') as CSSProperties['textAlign'];
        const color = String(props.color ?? '#0f172a');
        const headingStyle: CSSProperties = { textAlign: align, color };
        if (directEdit) {
          return (
            <div className="rounded border border-slate-200 bg-white p-3">
              <Heading
                key={`${block.id}-hd-${props.text}`}
                contentEditable
                suppressContentEditableWarning
                onMouseDown={stopPick}
                onBlur={blurText('text')}
                style={headingStyle}
                className={`font-bold outline-none focus:ring-2 focus:ring-violet-400 rounded-sm ${size}`}
              >
                {props.text || 'Título'}
              </Heading>
            </div>
          );
        }
        return (
          <div className="rounded border border-slate-200 bg-white p-3">
            <p style={headingStyle} className={`font-bold ${size}`}>
              {props.text || 'Título'}
            </p>
          </div>
        );
      }

      case 'button-block': {
        const bg = String(props.backgroundColor ?? '#009179');
        const fg = String(props.textColor ?? '#ffffff');
        const radius = String(props.borderRadius ?? '0.5rem');
        const isOutline = String(props.variant ?? 'solid') === 'outline';
        const btnStyle: CSSProperties = {
          borderRadius: radius,
          backgroundColor: isOutline ? 'transparent' : bg,
          color: fg,
          border: isOutline ? `2px solid ${bg}` : undefined,
        };
        const btnClass = `inline-flex items-center justify-center gap-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
          isOutline ? 'bg-transparent' : ''
        }`;
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <span className={btnClass} style={btnStyle}>
                {props.iconChar ? <span className="text-base">{props.iconChar}</span> : null}
                <span
                  key={`${block.id}-btn-${props.label}`}
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={stopPick}
                  onBlur={blurText('label')}
                  className="outline-none focus:underline"
                >
                  {props.label || 'Botão'}
                </span>
              </span>
              <p className="mt-1 text-xs text-slate-500">{props.href || '#'}</p>
              {(props.hoverBackgroundColor || props.hoverTextColor) && (
                <p className="mt-0.5 text-[10px] text-violet-600">Com cores ao hover</p>
              )}
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <span className={btnClass} style={btnStyle}>
              {props.iconChar ? <span className="text-base">{props.iconChar}</span> : null}
              {props.label || 'Botão'}
            </span>
            <p className="mt-1 text-xs text-slate-500">{props.href || '#'}</p>
            {(props.hoverBackgroundColor || props.hoverTextColor) && (
              <p className="mt-0.5 text-[10px] text-violet-600">Com cores ao hover</p>
            )}
          </div>
        );
      }

      case 'video-embed':
        return (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Vídeo</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-700">{props.url || '(sin URL)'}</p>
          </div>
        );

      case 'map-embed':
        return (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Mapa</p>
            <p className="mt-1 line-clamp-2 font-mono text-[10px] text-slate-600">{String(props.embedSrc || '').slice(0, 72)}…</p>
            <p className="mt-1 text-[10px] text-slate-500">{props.title || 'Mapa'}</p>
          </div>
        );

      case 'accordion-block':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">Acordeón (JSON)</p>
            <p className="mt-1 text-xs text-slate-600">{String(props.itemsJson || '').slice(0, 80)}…</p>
          </div>
        );

      case 'tabs-simple':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-600">
              {props.tab1Label} / {props.tab2Label}
            </p>
          </div>
        );

      case 'progress-block':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-600">{props.label || 'Progreso'}</p>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(100, Math.max(0, Number(props.value) || 0))}%` }} />
            </div>
          </div>
        );

      case 'pricing-table':
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">Tabla de precios</p>
            <p className="mt-1 text-xs text-slate-600">{String(props.plansJson || '').slice(0, 100)}…</p>
          </div>
        );

      case 'rich-html':
        if (directEdit) {
          return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">HTML — edição direta</p>
              <textarea
                key={`${block.id}-rh-${String(props.htmlContent || '').length}`}
                defaultValue={String(props.htmlContent || '')}
                onMouseDown={stopPick}
                onBlur={(e) =>
                  updateBlock(block.id, {
                    props: { ...props, htmlContent: e.currentTarget.value },
                  })
                }
                className="mt-2 min-h-[100px] w-full resize-y rounded border border-slate-200 bg-white p-2 font-mono text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-violet-400"
                spellCheck={false}
              />
            </div>
          );
        }
        return (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">HTML</p>
            <p className="mt-1 line-clamp-3 font-mono text-[11px] text-slate-600">{String(props.htmlContent || '').slice(0, 160)}</p>
          </div>
        );

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
      className={`group relative mb-4 cursor-pointer transition ${dropTarget ? 'rounded-lg shadow-[inset_0_0_0_2px_rgba(124,58,237,0.65)]' : ''} ${isSelected ? 'pt-11' : ''} ${
        isSelected
          ? 'rounded-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50'
          : 'rounded-lg hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 hover:ring-offset-slate-50'
      }`}
    >
      {blockIndex >= 0 ? <PaletteInsertZone insertIndex={blockIndex} /> : null}
      {isSelected ? (
        <div className="absolute inset-x-0 top-0 z-30 flex justify-center px-1">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 py-0.5 shadow-md">
            <button
              type="button"
              title="Duplicar bloco"
              onClick={handleDuplicate}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Mover para cima"
              disabled={!canMoveUp}
              onClick={handleMoveUp}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-35"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Mover para baixo"
              disabled={!canMoveDown}
              onClick={handleMoveDown}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-35"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Eliminar bloco"
              onClick={handleDelete}
              className="rounded p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className={`absolute left-2 z-20 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 ${
          isSelected ? 'top-12' : 'top-2'
        }`}
        title="Arrastar bloco"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        arrastar
      </button>
      <div className="relative">{renderBlockContent()}</div>
    </div>
  );
}
