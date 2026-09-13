'use client';

import { Flame, Leaf, Sprout, Users } from 'lucide-react';
import type { SementeImpact, SementePath } from '@/lib/sementes-types';

export function SementesCard({
  alias,
  path,
  hook,
  impacts,
  heat,
  compact = false,
}: {
  alias: string;
  path?: SementePath;
  hook: string;
  impacts: SementeImpact[];
  heat?: number;
  compact?: boolean;
}) {
  return (
    <article className={`sem-live-card relative overflow-hidden text-white ${compact ? 'p-3.5' : 'p-5'}`}>
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#009179]/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          {path === 'servico' ? 'Serviço' : path === 'produto' ? 'Produto' : 'Semente'}
        </p>
        <Sprout className="h-4 w-4 text-[#52ADAD]" />
      </div>
      <h3 className={`sem-display relative mt-2 leading-none ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
        {alias || 'Sua semente'}
      </h3>
      <p className={`relative mt-3 text-white/82 ${compact ? 'text-sm line-clamp-2' : 'text-base leading-6'}`}>
        {hook || 'A ideia aparece aqui enquanto você escreve.'}
      </p>
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        {impacts.includes('economico') ? <span className="sem-chip is-on py-1 text-[11px]">$</span> : null}
        {impacts.includes('ambiental') ? (
          <span className="sem-chip is-on py-1 text-[11px]">
            <Leaf className="h-3 w-3" />
          </span>
        ) : null}
        {impacts.includes('social') ? (
          <span className="sem-chip is-on py-1 text-[11px]">
            <Users className="h-3 w-3" />
          </span>
        ) : null}
        {typeof heat === 'number' && heat > 0 ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#A5D9EF]">
            <Flame className="h-3.5 w-3.5" />
            {heat}
          </span>
        ) : null}
      </div>
    </article>
  );
}
