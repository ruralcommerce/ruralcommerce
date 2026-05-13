'use client';

import { locales } from '@/i18n/request';

export function LocaleSelector({
  currentLocale = 'es',
  onLocaleChange,
  disabled,
}: {
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={currentLocale}
        onChange={(event) => onLocaleChange?.(event.target.value)}
        disabled={disabled}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
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
