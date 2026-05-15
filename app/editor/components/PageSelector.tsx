'use client';

import { useState } from 'react';
import { EDITOR_PAGES } from '@/lib/editor-pages';

interface PageSelectorProps {
  currentPageSlug?: string;
  onPageChange: (slug: string) => void;
  disabled?: boolean;
  /** Barra fina: botão mais baixo e texto menor. */
  compact?: boolean;
}

export function PageSelector({
  currentPageSlug = 'homepage',
  onPageChange,
  disabled,
  compact = false,
}: PageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPage = EDITOR_PAGES.find((p) => p.slug === currentPageSlug) || EDITOR_PAGES[0];

  const btnClass = compact
    ? 'flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition disabled:opacity-60'
    : 'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-60';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={btnClass}
      >
        <span>{currentPage.icon}</span>
        <span>{currentPage.name}</span>
        <span className={compact ? 'text-[9px] text-slate-400' : 'text-xs'}>▼</span>
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute left-0 top-full z-50 mt-1 rounded-md border border-slate-200 bg-white shadow-lg ${
            compact ? 'w-36' : 'w-40 border-slate-300'
          }`}
        >
          {EDITOR_PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => {
                onPageChange(page.slug);
                setIsOpen(false);
              }}
              className={`w-full text-left transition ${
                compact ? 'px-2 py-1.5 text-xs' : 'px-4 py-2 text-sm'
              } ${
                currentPageSlug === page.slug
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="mr-2">{page.icon}</span>
              {page.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
