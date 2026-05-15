'use client';

import { locales } from '@/i18n/request';

export function LocaleSelector({
  currentLocale = 'es',
  onLocaleChange,
  disabled,
  compact = false,
}: {
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const selClass = compact
    ? 'rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 shadow-sm outline-none focus:border-violet-400 disabled:opacity-60'
    : 'rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60';

  return (
    <div className="relative">
      <select
        value={currentLocale}
        onChange={(event) => onLocaleChange?.(event.target.value)}
        disabled={disabled}
        className={selClass}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale}
          </option>
        ))}
      </select>
    </div>
  );
}
