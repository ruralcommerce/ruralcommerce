'use client';

import { normalizeToneLabel } from '@/lib/marca/labels';
import type { FinalWorkshopMoodboard as FinalMoodboard } from '@/lib/marca/moodboard';

const SECTION_LABEL: Record<string, string> = {
  palette: 'Paleta',
  logo: 'Logo',
  packaging: 'Embalaje',
};

export function FinalWorkshopMoodboardView({
  board,
  onClose,
}: {
  board: FinalMoodboard;
  onClose?: () => void;
}) {
  const tiles = board.collage;
  const hero = tiles[0];
  const side = tiles.slice(1, 5);
  const rest = tiles.slice(5, 9);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--rc-primary)]/10 bg-[#F4F6F8] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--rc-primary)]/8 bg-white px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Moodboard final de la oficina
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--rc-primary)] sm:text-2xl">{board.clientName}</h2>
          <p className="mt-1 text-xs text-[var(--rc-text)]/60">
            Sistematización del taller · {board.completedCount}/{board.participantCount} respuestas · tono{' '}
            <span className="font-semibold text-[var(--rc-primary)]">{normalizeToneLabel(board.dominantTone)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--rc-primary)]/15 bg-white px-3 py-2 text-xs font-semibold text-[var(--rc-primary)]"
            >
              Cerrar
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[var(--rc-primary)] px-3 py-2 text-xs font-semibold text-white"
          >
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Dense collage — created board, not a flat gallery */}
      <div className="grid grid-cols-12 gap-1 p-1 sm:gap-1.5 sm:p-1.5">
        <div className="col-span-12 grid grid-cols-12 gap-1 sm:col-span-8 sm:gap-1.5">
          <div className="relative col-span-12 aspect-[16/10] overflow-hidden bg-[#EEF3F7] sm:col-span-7 sm:aspect-auto sm:min-h-[280px]">
            {hero?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.src} alt={hero.alt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--rc-text)]/50">Sin imagen líder</div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Imagen más elegida</p>
              <p className="text-sm font-semibold">{hero?.alt || '—'}</p>
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-1 sm:col-span-5 sm:grid-cols-1 sm:gap-1.5">
            {side.map((tile) => (
              <div key={tile.id} className="relative min-h-[88px] overflow-hidden bg-[#EEF3F7] sm:min-h-0 sm:flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tile.src} alt={tile.alt} className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  {tile.section ? SECTION_LABEL[tile.section] || tile.section : normalizeToneLabel(tile.tone || '')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-1 sm:col-span-4 sm:gap-1.5">
          <div className="rounded-none bg-[var(--rc-primary)] p-4 text-white sm:min-h-[160px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Palabras del taller</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {board.topWords.length ? (
                board.topWords.map((w) => (
                  <span
                    key={w.word}
                    className="rounded-md bg-white/15 px-2 py-1 text-xs font-semibold"
                    style={{ fontSize: `${Math.min(16, 11 + w.count)}px` }}
                  >
                    {w.word}
                  </span>
                ))
              ) : (
                <span className="text-sm text-white/70">Aún no hay palabras elegidas</span>
              )}
            </div>
          </div>

          <div className="bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--rc-accent)]">Paleta sugerida</p>
            <div className="mt-2 flex h-14 overflow-hidden rounded-lg sm:h-16">
              {board.paletteColors.map((color) => (
                <div key={color} className="flex-1" style={{ background: color }} title={color} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {board.paletteColors.map((color) => (
                <span key={`hex-${color}`} className="font-mono text-[10px] text-[var(--rc-text)]/55">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            {(['palette', 'logo', 'packaging'] as const).map((section) => {
              const winner = board.winnersBySection[section];
              return (
                <div key={section} className="overflow-hidden bg-white">
                  <p className="px-1.5 pt-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--rc-accent)]">
                    {SECTION_LABEL[section]}
                  </p>
                  <div className="relative aspect-square bg-[#EEF3F7]">
                    {winner?.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={winner.src} alt={winner.alt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[var(--rc-text)]/40">—</div>
                    )}
                  </div>
                  <p className="truncate px-1.5 py-1 text-[10px] text-[var(--rc-primary)]">
                    {winner ? normalizeToneLabel(winner.tone || '') : 'sin voto'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {rest.map((tile) => (
          <div key={tile.id} className="relative col-span-6 aspect-[4/3] overflow-hidden bg-[#EEF3F7] sm:col-span-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.src} alt={tile.alt} className="h-full w-full object-cover" />
          </div>
        ))}

        <div className="col-span-12 bg-white p-4 sm:col-span-7 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--rc-accent)]">
            One-page sugerido de marca
          </p>
          <h3 className="mt-2 text-lg font-bold text-[var(--rc-primary)]">{board.onePage.headline}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{board.onePage.promise}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{board.onePage.personality}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{board.onePage.voice}</p>
        </div>

        <div className="col-span-12 bg-[var(--rc-primary)] p-4 text-white sm:col-span-5 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Síntesis de las historias</p>
          <p className="mt-3 text-sm leading-6 text-white/90">{board.synthesis}</p>
        </div>
      </div>
    </div>
  );
}
