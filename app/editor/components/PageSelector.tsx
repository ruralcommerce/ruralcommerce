'use client';

import { useState } from 'react';
import { EDITOR_PAGES } from '@/lib/editor-pages';

interface PageSelectorProps {
  currentPageSlug?: string;
  onPageChange: (slug: string) => void;
  disabled?: boolean;
}

export function PageSelector({ currentPageSlug = 'homepage', onPageChange, disabled }: PageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPage = EDITOR_PAGES.find((p) => p.slug === currentPageSlug) || EDITOR_PAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
      >
        <span>{currentPage.icon}</span>
        <span>{currentPage.name}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-300 rounded shadow-lg z-50">
          {EDITOR_PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => {
                onPageChange(page.slug);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition ${
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
