'use client';

import { useEffect, useRef, useState } from 'react';

type Partner = {
  name: string;
  /** SVG (Simple Icons); cores originais só no hover deste logo */
  src: string;
  href: string;
};

const defaultPartners: Partner[] = [
  { name: 'Slack', src: 'https://cdn.simpleicons.org/slack', href: 'https://slack.com' },
  { name: 'Commerce', src: 'https://cdn.simpleicons.org/shopify', href: 'https://www.shopify.com' },
  { name: 'Medium', src: 'https://cdn.simpleicons.org/medium', href: 'https://medium.com' },
  { name: 'SitePoint', src: 'https://cdn.simpleicons.org/sitepoint', href: 'https://www.sitepoint.com' },
  { name: 'Microsoft', src: 'https://cdn.simpleicons.org/microsoft', href: 'https://www.microsoft.com' },
  { name: 'GitHub', src: 'https://cdn.simpleicons.org/github', href: 'https://github.com' },
];

export type PartnersLogosCarouselProps = {
  partners?: Partner[];
};

export function PartnersLogosCarousel({ partners = defaultPartners }: PartnersLogosCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; pointerId: number; startX: number; scroll: number }>({
    active: false,
    pointerId: -1,
    startX: 0,
    scroll: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

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

  const slides = [...partners, ...partners];

  return (
    <div className="relative mt-10">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[var(--rc-bg)] to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[var(--rc-bg)] to-transparent md:block"
        aria-hidden
      />

      <div
        ref={scrollerRef}
        className={`flex touch-pan-x gap-10 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-14 ${
          isDragging ? 'cursor-grabbing scroll-auto' : 'cursor-grab scroll-smooth'
        }`}
        aria-label="Logos de parceiros"
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
              /* noop */
            }
          }
        }}
        onPointerCancel={(e) => {
          if (e.pointerId !== dragRef.current.pointerId) return;
          dragRef.current.active = false;
          setIsDragging(false);
        }}
      >
        {slides.map((p, i) => (
          <a
            key={`${p.name}-${i}`}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-14 shrink-0 items-center justify-center rounded-md px-2 outline-none ring-offset-2 ring-offset-[var(--rc-bg)] focus-visible:ring-2 focus-visible:ring-[#071F5E]/35 sm:h-16 sm:px-4"
          >
            {/* Estado base: acinzentado; só este logo ganha cor no hover/foco */}
            <img
              src={p.src}
              alt={p.name}
              width={140}
              height={40}
              className="h-7 w-auto max-w-[120px] object-contain object-center transition-[filter,opacity] duration-300 ease-out motion-reduce:transition-none sm:h-8 sm:max-w-[140px] [filter:grayscale(1)_brightness(0.94)_saturate(0.42)_opacity(0.68)] group-hover:[filter:grayscale(0)_brightness(1)_saturate(1)_opacity(1)] group-focus-visible:[filter:grayscale(0)_brightness(1)_saturate(1)_opacity(1)]"
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
