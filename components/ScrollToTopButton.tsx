'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const SHOW_AFTER_PX = 280;

export function ScrollToTopButton() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(typeof window !== 'undefined' && window.scrollY > SHOW_AFTER_PX);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const goTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label={t('scrollToTop')}
      title={t('scrollToTop')}
      className={`fixed bottom-5 right-5 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-[#071F5E]/30 bg-white/95 text-[#071F5E] shadow-[0_2px_12px_rgba(7,31,94,0.12)] backdrop-blur-sm transition-all duration-200 hover:border-[#071F5E]/50 hover:bg-[#071F5E]/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#071F5E] sm:bottom-6 sm:right-6 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 14l4-4 4 4" />
      </svg>
    </button>
  );
}
