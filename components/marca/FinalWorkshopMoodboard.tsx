'use client';

import { useEffect, useMemo, useState } from 'react';
import { normalizeToneLabel } from '@/lib/marca/labels';
import type { FinalWorkshopMoodboard as FinalMoodboard, MoodboardTile } from '@/lib/marca/moodboard';

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

async function sampleImageColors(src: string, max = 4): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve([]);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 200) continue;
          const lum = (r + g + b) / 3;
          if (lum < 18 || lum > 245) continue;
          const key = `${Math.round(r / 24)}_${Math.round(g / 24)}_${Math.round(b / 24)}`;
          const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
          cur.r += r;
          cur.g += g;
          cur.b += b;
          cur.n += 1;
          buckets.set(key, cur);
        }
        const ranked = [...buckets.values()]
          .sort((a, b) => b.n - a.n)
          .slice(0, max)
          .map((c) => rgbToHex(Math.round(c.r / c.n), Math.round(c.g / c.n), Math.round(c.b / c.n)));
        resolve(ranked);
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}

function mergePalettes(base: string[], sampled: string[], max = 6): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (hex: string) => {
    const key = hex.toUpperCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(hex.toUpperCase());
  };
  for (const c of sampled) push(c);
  for (const c of base) push(c);
  return out.slice(0, max);
}

function Tile({
  tile,
  className = '',
  label,
}: {
  tile?: MoodboardTile;
  className?: string;
  label?: string;
}) {
  if (!tile?.src) {
    return <div className={`bg-[#DDE3EA] ${className}`} />;
  }
  return (
    <div className={`relative overflow-hidden bg-[#111] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tile.src} alt={tile.alt} className="absolute inset-0 h-full w-full object-cover" />
      {label ? (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Dense magazine-style moodboard (no card gaps) — palette + logos + packaging + words + copy.
 * Inspired by the workshop reference collages the team shared.
 */
export function FinalWorkshopMoodboardView({
  board,
  onClose,
}: {
  board: FinalMoodboard;
  onClose?: () => void;
}) {
  const [paletteColors, setPaletteColors] = useState(board.paletteColors);

  const imgs = useMemo(() => {
    const list = [...board.collage];
    const push = (t?: MoodboardTile) => {
      if (!t?.src) return;
      if (!list.find((x) => x.id === t.id)) list.unshift(t);
    };
    push(board.winnersBySection.packaging);
    push(board.winnersBySection.logo);
    push(board.winnersBySection.palette);
    return list;
  }, [board]);

  const a = imgs[0];
  const b = imgs[1];
  const c = imgs[2];
  const d = imgs[3];
  const e = imgs[4];
  const f = imgs[5];
  const g = imgs[6];
  const h = imgs[7];
  const accent = paletteColors[0] || '#071F5E';
  const accent2 = paletteColors[1] || '#009179';
  const accent3 = paletteColors[2] || '#E85D04';
  const words = board.topWords.slice(0, 14);

  useEffect(() => {
    let cancelled = false;
    setPaletteColors(board.paletteColors);
    const sources = imgs
      .slice(0, 5)
      .map((t) => t.src)
      .filter(Boolean);
    void (async () => {
      const sampled: string[] = [];
      for (const src of sources) {
        sampled.push(...(await sampleImageColors(src, 3)));
      }
      if (!cancelled) setPaletteColors(mergePalettes(board.paletteColors, sampled, 6));
    })();
    return () => {
      cancelled = true;
    };
  }, [board, imgs]);

  function printMoodboardOnly() {
    const cleanup = () => {
      document.body.classList.remove('printing-marca-moodboard');
      window.removeEventListener('afterprint', cleanup);
    };
    document.body.classList.add('printing-marca-moodboard');
    window.addEventListener('afterprint', cleanup);
    // Fallback if afterprint never fires (some browsers)
    window.setTimeout(cleanup, 60_000);
    window.print();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--rc-primary)]/10 bg-white shadow-sm">
      <div className="marca-moodboard-toolbar flex flex-wrap items-start justify-between gap-3 border-b border-[var(--rc-primary)]/8 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Moodboard final{board.generatedByAi ? ' · Gemini' : ''}
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--rc-primary)] sm:text-2xl">{board.clientName}</h2>
          <p className="mt-1 text-xs text-[var(--rc-text)]/60">
            Composición a partir de las elecciones del taller · {board.completedCount}/{board.participantCount}{' '}
            respuestas
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
            onClick={printMoodboardOnly}
            className="rounded-xl bg-[var(--rc-primary)] px-3 py-2 text-xs font-semibold text-white"
          >
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Full collage — zero gap, widescreen (this is what prints) */}
      <div
        id="marca-moodboard-sheet"
        className="marca-moodboard-sheet grid aspect-[16/11] w-full grid-cols-12 grid-rows-6 bg-[#0B1220] sm:aspect-[16/10]"
        style={{ gap: 0 }}
      >
        {/* Left: vertical color stack like reference moodboards */}
        <div className="col-span-2 row-span-6 flex flex-col sm:col-span-1">
          {(paletteColors.length ? paletteColors : ['#071F5E', '#009179', '#E8D5D0', '#2F3336', '#E85D04']).map(
            (color, i) => (
              <div key={`${color}-${i}`} className="relative min-h-0 flex-1" style={{ background: color }}>
                <span
                  className={`absolute bottom-1 left-1 font-mono text-[7px] sm:text-[8px] ${
                    i === 0 || i === paletteColors.length - 1 ? 'text-white/80' : 'text-black/50'
                  }`}
                >
                  {color.replace('#', '')}
                </span>
              </div>
            )
          )}
        </div>

        {/* Hero image */}
        <Tile tile={a} className="col-span-6 row-span-3 sm:col-span-5" label="líder" />

        {/* Stacked logo / packaging */}
        <Tile
          tile={b}
          className="col-span-4 row-span-2 sm:col-span-3"
          label={b?.section === 'logo' ? 'logo' : undefined}
        />
        <Tile tile={c} className="col-span-4 row-span-1 sm:col-span-3" />

        {/* Words block — typographic panel */}
        <div
          className="col-span-5 row-span-2 flex flex-col justify-between p-2.5 text-white sm:col-span-4 sm:p-3"
          style={{ background: accent }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">Taller</p>
          <div className="mt-1 flex flex-wrap content-start gap-1">
            {words.length ? (
              words.map((w) => (
                <span
                  key={w.word}
                  className="rounded-sm bg-white/15 px-1.5 py-0.5 font-semibold uppercase leading-none"
                  style={{ fontSize: `${Math.min(13, 9 + w.count * 1.5)}px` }}
                >
                  {w.word}
                </span>
              ))
            ) : (
              <span className="text-xs text-white/70">sin palabras</span>
            )}
          </div>
        </div>

        <Tile tile={d} className="col-span-5 row-span-2 sm:col-span-3" />

        {/* Accent color slab */}
        <div className="col-span-2 row-span-1 sm:col-span-1" style={{ background: accent2 }} />

        <Tile tile={e} className="col-span-4 row-span-2 sm:col-span-3" />

        {/* One-page / synthesis integrated in collage */}
        <div className="col-span-6 row-span-2 flex flex-col justify-between bg-white p-2.5 sm:col-span-5 sm:p-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: accent2 }}>
              Marca sugerida
            </p>
            <h3 className="mt-1 text-sm font-bold leading-tight text-[#071F5E] sm:text-base">
              {board.onePage.headline}
            </h3>
            <p className="mt-1 line-clamp-3 text-[10px] leading-4 text-[#1E1E1E]/75 sm:text-[11px] sm:leading-4">
              {board.onePage.promise}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#1E1E1E]/65">{board.onePage.personality}</p>
        </div>

        <div className="col-span-2 row-span-2 flex flex-col sm:col-span-1">
          <div className="flex-1" style={{ background: accent3 }} />
          <div className="flex-1" style={{ background: accent }} />
        </div>

        <Tile tile={f} className="col-span-4 row-span-1 sm:col-span-3" />
        <Tile tile={g} className="col-span-4 row-span-1 hidden sm:block sm:col-span-2" />
        <Tile tile={h} className="col-span-4 row-span-1 hidden sm:block sm:col-span-2" />

        {/* Bottom strip: synthesis + tone */}
        <div
          className="col-span-12 row-span-1 flex items-center gap-3 overflow-hidden px-3 py-2 text-white"
          style={{ background: '#071F5E' }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
              Síntesis · {(board.contributingTones || []).map(normalizeToneLabel).join(' + ') || board.dominantTone}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-white/90 sm:text-[11px]">
              {board.synthesis}
              {board.visualDirection ? ` · ${board.visualDirection}` : ''}
            </p>
          </div>
          <div className="hidden shrink-0 gap-0.5 sm:flex">
            {paletteColors.slice(0, 5).map((color) => (
              <div key={`foot-${color}`} className="h-8 w-8" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
