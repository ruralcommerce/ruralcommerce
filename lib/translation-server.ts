/**
 * Tradução só no servidor (API Route) — evita CORS e falhas no browser.
 */

import translate from 'google-translate-api-x';
import type { TranslationChange, TranslationPreview } from './translation-utils';

function mapLocaleForGoogle(targetLocale: string): string {
  if (targetLocale === 'pt-BR') return 'pt';
  return targetLocale;
}

export async function translateTextServer(text: string, targetLang: string): Promise<string> {
  try {
    if (!text || text.trim() === '') return text;
    const googleLang = mapLocaleForGoogle(targetLang);
    const result = await translate(text, { to: googleLang });
    return result.text;
  } catch (error) {
    console.error('Erro na tradução (servidor):', error);
    return text;
  }
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

      if (typeof sourceValue === 'string') {
        const translatedText = await translateTextServer(sourceValue, locale);
        changes.push({
          field,
          originalText: sourceValue,
          translatedText,
          targetLocale: locale,
        });
      }
    }

    if (changes.length > 0) {
      previews.push({ locale, changes });
    }
  }

  return previews;
}
