/**
 * Tradução só no servidor (API Route) — evita CORS e falhas no browser.
 */

import translate from 'google-translate-api-x';
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

/**
 * Traduz texto ES → idioma alvo.
 */
export async function translateTextServer(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '') return text;
  if (isSkippableNonCopyValue(text)) return text;

  const googleTo = mapLocaleForGoogle(targetLang);
  const base = {
    from: 'es',
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

export async function generateTranslationPreviewServer(
  sourceLayout: unknown,
  targetLocales: string[],
  changedFields: string[]
): Promise<TranslationPreview[]> {
  const previews: TranslationPreview[] = [];

  for (const locale of targetLocales) {
    const changes: TranslationChange[] = [];

    for (const field of changedFields) {
      const fieldPath = field.split('.');
      let sourceValue: unknown = sourceLayout;

      for (const pathPart of fieldPath) {
        sourceValue = (sourceValue as Record<string, unknown>)?.[pathPart];
      }

      if (typeof sourceValue !== 'string') continue;
      if (isSkippableNonCopyValue(sourceValue)) continue;

      try {
        const translatedText = await translateTextServer(sourceValue, locale);
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
