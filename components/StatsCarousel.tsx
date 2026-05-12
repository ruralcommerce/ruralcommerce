'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  Droplets,
  Leaf,
  MapPin,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react';

type StatItem = {
  Icon: LucideIcon;
  digits: string;
  symbol: '+' | '%';
  label: string;
};

const stats: StatItem[] = [
  {
    Icon: Users,
    digits: '1200',
    symbol: '+',
    label: 'Toneladas de CO₂ evitadas en proyectos reales',
  },
  {
    Icon: Droplets,
    digits: '8,714',
    symbol: '+',
    label: 'Millones de litros de agua preservados.',
  },
  {
    Icon: Building2,
    digits: '1600',
    symbol: '%',
    label: 'de aumento promedio en el lucro en redes implementadas',
  },
  {
    Icon: Leaf,
    digits: '35',
    symbol: '+',
    label: 'especies y cultivos asociados a redes de valor sostenible',
  },
  {
    Icon: MapPin,
    digits: '18',
    symbol: '+',
    label: 'territorios con intervenciones coordinadas en campo',
  },
  {
    Icon: Sprout,
    digits: '240',
    symbol: '+',
    label: 'productores vinculados a programas de eficiencia',
  },
];

export function StatsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; pointerId: number; startX: number; scroll: number }>({
    active: false,
    pointerId: -1,
    startX: 0,
    scroll: 0,
  });
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const advance = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>('[data-stat-slide]');
    if (!slide) return;
    const gap = 24;
    const step = slide.getBoundingClientRect().width + gap;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    if (el.scrollLeft >= max - 2) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (paused || isDragging || stats.length <= 1) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const id = window.setInterval(advance, 4500);
    return () => window.clearInterval(id);
  }, [paused, isDragging, advance]);

  /* Roda vertical → desloca horizontalmente (sem passive, para poder preventDefault) */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-white to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-white to-transparent md:block"
        aria-hidden
      />

      <div
        ref={scrollerRef}
        className={`flex touch-pan-x snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? 'cursor-grabbing scroll-auto select-none' : 'cursor-grab scroll-smooth'
        }`}
        tabIndex={0}
        aria-label="Indicadores de impacto — arrastre com o rato ou use a roda para percorrer"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || e.button !== 0) return;
          const el = scrollerRef.current;
          if (!el) return;
          dragRef.current = {
            active: true,
            pointerId: e.pointerId,
            startX: e.clientX,
            scroll: el.scrollLeft,
          };
          el.setPointerCapture(e.pointerId);
          setIsDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
          const el = scrollerRef.current;
          if (!el) return;
          el.scrollLeft = dragRef.current.scroll - (e.clientX - dragRef.current.startX);
        }}
        onPointerUp={(e) => {
          if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
          const el = scrollerRef.current;
          dragRef.current.active = false;
          setIsDragging(false);
          if (el) {
            try {
              el.releasePointerCapture(e.pointerId);
            } catch {
              /* ignorar se já libertado */
            }
          }
        }}
        onPointerCancel={(e) => {
          if (e.pointerId !== dragRef.current.pointerId) return;
          dragRef.current.active = false;
          setIsDragging(false);
        }}
        onKeyDown={(e) => {
          const el = scrollerRef.current;
          if (!el) return;
          const slide = el.querySelector<HTMLElement>('[data-stat-slide]');
          const step = slide ? slide.getBoundingClientRect().width + 24 : 320;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            el.scrollBy({ left: step, behavior: 'smooth' });
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            el.scrollBy({ left: -step, behavior: 'smooth' });
          }
        }}
      >
        {stats.map((s, i) => {
          const Icon = s.Icon;
          return (
            <div
              key={`${s.label}-${i}`}
              data-stat-slide
              className="flex w-[min(85vw,300px)] shrink-0 snap-start gap-4 text-left sm:w-[300px] lg:w-[320px]"
            >
              <Icon
                className="mt-1 h-12 w-12 shrink-0 text-[#071F5E]"
                strokeWidth={1.35}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                  <span className="text-[#1E1E1E]">{s.digits}</span>
                  <span className="text-[#071F5E]">{s.symbol}</span>
                </p>
                <p className="mt-2 text-sm font-bold leading-snug text-[#1E1E1E] sm:text-base">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
