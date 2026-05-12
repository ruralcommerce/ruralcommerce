'use client';

import { useMemo, useState } from 'react';

type MediaItem = {
  type: 'image' | 'video';
  src: string;
  alt?: string;
};

type BlogMediaCarouselProps = {
  items: readonly MediaItem[];
  title: string;
};

export function BlogMediaCarousel({ items, title }: BlogMediaCarouselProps) {
  const safeItems = useMemo(() => (items.length > 0 ? items : [{ type: 'image' as const, src: '/images/home/hero-1.png', alt: title }]), [items, title]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeItems[activeIndex] ?? safeItems[0];

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-[#EEF1F4]">
        {active.type === 'video' ? (
          <video className="h-[280px] w-full object-cover sm:h-[340px] lg:h-[380px]" controls preload="metadata">
            <source src={active.src} />
          </video>
        ) : (
          <img
            src={active.src}
            alt={active.alt || title}
            className="h-[280px] w-full object-cover sm:h-[340px] lg:h-[380px]"
          />
        )}
      </div>

      {safeItems.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {safeItems.map((item, idx) => (
            <button
              key={`${item.src}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${idx === activeIndex ? 'bg-[#071F5E]' : 'bg-[#071F5E]/25'}`}
              aria-label={`Abrir mídia ${idx + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
