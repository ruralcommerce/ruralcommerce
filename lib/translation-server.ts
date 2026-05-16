/**
 * Tradução só no servidor (API Route) — evita CORS e falhas no browser.
 */

import translate from 'google-translate-api-x';
import { getTranslationTextAt } from './translation-field-paths';
import type { TranslationChange, TranslationPreview } from './translation-utils';

function mapLocaleForGoogle(targetLocale: string): string {
  if (targetLocale === 'pt-BR') return 'pt';
  return targetLocale;
}

function isSkippableNonCopyValue(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(t)) return true;
  if (t === 'draft' || t === 'published') return true;
  return false;
}

function mapFromLocaleForGoogle(fromLocale: string): string {
  if (fromLocale === 'pt-BR') return 'pt';
  if (fromLocale === 'en') return 'en';
  return 'es';
}

/**
 * Traduz texto entre dois códigos de locale da app (es, pt-BR, en).
 */
export async function translateTextBetween(
  text: string,
  fromLocale: string,
  toLocale: string
): Promise<string> {
  if (!text || text.trim() === '') return text;
  if (isSkippableNonCopyValue(text)) return text;
  if (fromLocale === toLocale) return text;

  const googleFrom = mapFromLocaleForGoogle(fromLocale);
  const googleTo = mapLocaleForGoogle(toLocale);
  const base = {
    from: googleFrom,
    to: googleTo,
    forceFrom: true,
    forceTo: true,
  };

  const attempts = [
    { ...base, forceBatch: false, fallbackBatch: true },
    { ...base, forceBatch: true, client: 'gtx' as const },
    { ...base, forceBatch: true, tld: 'com' as const },
  ];

  let lastError: unknown;
  for (const opts of attempts) {
    try {
      const result = await translate(text, opts as Parameters<typeof translate>[1]);
      return result.text;
    } catch (e) {
      lastError = e;
    }
  }

  console.error('Erro na tradução (servidor), tentativas esgotadas:', lastError);
  throw new Error(
    lastError instanceof Error
      ? `Tradução falhou: ${lastError.message}`
      : 'Tradução falhou (rede ou limite do Google). Tente de novo ou edite manualmente no modal.'
  );
}

/**
 * Traduz texto ES → idioma alvo (atalho; mantido por compatibilidade).
 */
export async function translateTextServer(text: string, targetLang: string): Promise<string> {
  return translateTextBetween(text, 'es', targetLang);
}

export async function generateTranslationPreviewServer(
  sourceLayout: unknown,
  targetLocales: string[],
  changedFields: string[],
  sourceLocale = 'es'
): Promise<TranslationPreview[]> {
  const previews: TranslationPreview[] = [];

  for (const locale of targetLocales) {
    const changes: TranslationChange[] = [];

    for (const field of changedFields) {
      const sourceValue = getTranslationTextAt(sourceLayout, field);
      if (sourceValue === null) continue;
      if (isSkippableNonCopyValue(sourceValue)) continue;

      try {
        const translatedText = await translateTextBetween(sourceValue, sourceLocale, locale);
        changes.push({
          field,
          originalText: sourceValue,
          translatedText,
          targetLocale: locale,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Tradução falhou';
        changes.push({
          field,
          originalText: sourceValue,
          translatedText: sourceValue,
          targetLocale: locale,
          translationError: msg,
        });
      }
    }

    if (changes.length > 0) {
      previews.push({ locale, changes });
    }
  }

  return previews;
}
