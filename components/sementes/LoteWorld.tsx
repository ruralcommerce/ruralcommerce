'use client';

import type { ReactNode } from 'react';
import type { LoteKind } from '@/lib/lote-types';

export type LotePhase = 'empty' | 'pick' | 'sign' | 'price' | 'play';

const EMPTY = ['TTAAAAww', 'TgHHHHww', 'TggddddT', 'TggddddT', 'TffppffT', 'TFfppFFT', 'RRRRRRRR'];
const PICK = ['TTAAAAww', 'TgHHHHww', 'TggBbNnT', 'TggbbnnT', 'TffppffT', 'TFfppFFT', 'RRRRRRRR'];
const BUILT = ['TTAAAAww', 'TgHHHHww', 'TggWWSST', 'TggWWSST', 'TffppMMT', 'TFfppMMT', 'RRRRRRRR'];

const TILE: Record<string, string> = {
  T: 'is-tree',
  A: 'is-roof',
  H: 'is-house',
  g: 'is-grass',
  d: 'is-dirt',
  B: 'is-ghost is-ghost-banca is-label',
  b: 'is-ghost is-ghost-banca',
  N: 'is-ghost is-ghost-tenda is-label',
  n: 'is-ghost is-ghost-tenda',
  f: 'is-flower',
  F: 'is-fence',
  p: 'is-path',
  w: 'is-water',
  W: 'is-work',
  S: 'is-stall',
  M: 'is-market',
  R: 'is-road',
};

function mapFor(phase: LotePhase) {
  if (phase === 'empty') return EMPTY;
  if (phase === 'pick') return PICK;
  return BUILT;
}

export function LoteWorld({
  phase,
  kind,
  stallLevel,
  stock,
  you,
  pops,
  speech,
  children,
  onEmpty,
  onPick,
  onProduce,
  onSell,
  onStall,
  onRest,
}: {
  phase: LotePhase;
  kind: LoteKind;
  stallLevel: number;
  stock: number;
  you: { col: number; row: number };
  pops: { id: number; col: number; row: number; text: string }[];
  speech?: string;
  children?: ReactNode;
  onEmpty?: () => void;
  onPick?: (kind: LoteKind) => void;
  onProduce: () => void;
  onSell: () => void;
  onStall: () => void;
  onRest?: () => void;
}) {
  const map = mapFor(phase);
  const play = phase === 'play';

  return (
    <div className={`lote-board ${kind === 'servico' ? 'is-servico' : ''} is-${phase}`} aria-label="Mapa do lote">
      <div className="lote-hills" />
      <div className="lote-sun" />
      <div className="lote-cloud lote-cloud-a" />
      <div className="lote-cloud lote-cloud-b" />
      {phase === 'pick' ? (
        <>
          <b className="lote-pick-tag is-banca">Banca</b>
          <b className="lote-pick-tag is-tenda">Tenda</b>
        </>
      ) : null}
      {map.flatMap((row, y) =>
        row.split('').map((cell, x) => {
          const dirt = phase === 'empty' && cell === 'd';
          const pickB = phase === 'pick' && (cell === 'B' || cell === 'b');
          const pickN = phase === 'pick' && (cell === 'N' || cell === 'n');
          const hotPlay = play && (cell === 'W' || cell === 'M' || cell === 'S' || cell === 'H' || cell === 'A');
          const live = dirt || pickB || pickN || hotPlay || (phase === 'price' && cell === 'S');
          const level = cell === 'S' ? ` lv-${Math.min(3, stallLevel)}` : '';
          const label =
            dirt ? 'Terra vazia'
            : pickB ? 'Banca'
            : pickN ? 'Tenda'
            : cell === 'W' ? 'Produzir'
            : cell === 'M' ? 'Vender'
            : cell === 'S' && phase === 'price' ? 'Abrir o lote'
            : cell === 'S' ? 'Banca'
            : cell === 'H' || cell === 'A' ? 'Casa'
            : undefined;
          return (
            <button
              key={`${x}-${y}`}
              type="button"
              aria-label={label}
              className={`lote-tile ${TILE[cell] || 'is-grass'}${level}${live ? ' is-hot' : ''}${dirt ? ' is-pulse' : ''}`}
              disabled={!live}
              onClick={() => {
                if (dirt) onEmpty?.();
                if (pickB) onPick?.('produto');
                if (pickN) onPick?.('servico');
                if (play && cell === 'W') onProduce();
                if (play && cell === 'M') onSell();
                if ((play || phase === 'price') && cell === 'S') onStall();
                if (play && (cell === 'H' || cell === 'A')) onRest?.();
              }}
            >
              {cell === 'S' || cell === 'M' || cell === 'B' || cell === 'b' || cell === 'N' || cell === 'n' ? <span className="lote-build" /> : null}
              {cell === 'W' ? (
                <span className="lote-crates">
                  {Array.from({ length: Math.min(4, Math.max(1, play ? Math.ceil((stock || 1) / 3) : 1)) }).map((_, index) => (
                    <i key={index} />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })
      )}
      <div className="lote-home" aria-hidden="true">
        <span className="lote-home-roof" />
        <span className="lote-home-wall" />
        <span className="lote-home-door" />
      </div>
      <div
        className="lote-you"
        style={{ left: `${(you.col / 8) * 100 + 1.5}%`, top: `${(you.row / 7) * 100 + 2}%` }}
      >
        <i className="lote-head" />
        <i className="lote-torso" />
        <i className="lote-legs" />
        {speech ? <p className="lote-bubble">{speech}</p> : null}
      </div>
      {pops.map((pop) => (
        <b
          key={pop.id}
          className="lote-pop"
          style={{ left: `${((pop.col + 0.5) / 8) * 100}%`, top: `${((pop.row + 0.2) / 7) * 100}%` }}
        >
          {pop.text}
        </b>
      ))}
      {children}
    </div>
  );
}
