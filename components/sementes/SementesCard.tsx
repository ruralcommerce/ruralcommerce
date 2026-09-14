'use client';

import { Flame, Leaf, Sprout, Users } from 'lucide-react';
import type { SementeImpact, SementePath } from '@/lib/sementes-types';

export type SementesCardCopy = {
  produto: string;
  servico: string;
  cardIdea: string;
  cardProblem: string;
  cardImpact: string;
  cardTest: string;
  economico: string;
  ambiental: string;
  social: string;
};

export function SementesCard({
  path,
  problem,
  idea,
  impactNote,
  fuel,
  fuelChips,
  impacts,
  heat,
  compact = false,
  copy,
}: {
  path?: SementePath;
  problem?: string;
  idea?: string;
  impactNote?: string;
  fuel?: string;
  fuelChips?: string[];
  impacts: SementeImpact[];
  heat?: number;
  compact?: boolean;
  copy: SementesCardCopy;
}) {
  const pathLabel = path === 'servico' ? copy.servico : path === 'produto' ? copy.produto : 'Semente';
  const test = [fuel, ...(fuelChips || [])].filter((item) => item && item.trim()).join(' · ');

  return (
    <article className={`sem-live-card relative overflow-hidden text-white ${compact ? 'p-3.5' : 'sem-live-card-full p-4 sm:p-5'}`}>
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#009179]/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{pathLabel}</p>
        <Sprout className="h-4 w-4 shrink-0 text-[#52ADAD]" />
      </div>

      {idea?.trim() ? (
        <section className="relative mt-3">
          <p className="sem-idea-label">{copy.cardIdea}</p>
          <h3 className={`sem-idea-hero ${compact ? 'text-lg leading-6' : 'text-xl leading-7 sm:text-2xl sm:leading-8'}`}>
            {idea.trim()}
          </h3>
        </section>
      ) : (
        <h3 className="sem-display relative mt-3 text-2xl text-white/45">A ideia aparece aqui.</h3>
      )}

      {problem?.trim() ? (
        <section className="relative mt-3">
          <p className="sem-idea-label">{copy.cardProblem}</p>
          <p className={`sem-idea-text ${compact ? 'line-clamp-2' : ''}`}>{problem.trim()}</p>
        </section>
      ) : null}

      {impacts.length || impactNote?.trim() ? (
        <section className="relative mt-3">
          <p className="sem-idea-label">{copy.cardImpact}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {impacts.includes('economico') ? <span className="sem-chip is-on py-1 text-[11px]">$ {copy.economico}</span> : null}
            {impacts.includes('ambiental') ? (
              <span className="sem-chip is-on inline-flex items-center gap-1 py-1 text-[11px]">
                <Leaf className="h-3 w-3" /> {copy.ambiental}
              </span>
            ) : null}
            {impacts.includes('social') ? (
              <span className="sem-chip is-on inline-flex items-center gap-1 py-1 text-[11px]">
                <Users className="h-3 w-3" /> {copy.social}
              </span>
            ) : null}
            {typeof heat === 'number' && heat > 0 ? (
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#A5D9EF]">
                <Flame className="h-3.5 w-3.5" />
                {heat}
              </span>
            ) : null}
          </div>
          {impactNote?.trim() && !compact ? <p className="sem-idea-text mt-2">{impactNote.trim()}</p> : null}
        </section>
      ) : null}

      {!compact && test ? (
        <section className="relative mt-3">
          <p className="sem-idea-label">{copy.cardTest}</p>
          <p className="sem-idea-text">{test}</p>
        </section>
      ) : null}
    </article>
  );
}
