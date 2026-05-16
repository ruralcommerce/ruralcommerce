/**
 * Utilitários de tradução (diff/apply no cliente; chamada de preview via API).
 */

import {
  getTranslationTextAt,
  listPageTranslationFieldPaths,
  setTranslationTextAt,
} from './translation-field-paths';
import type { PageSchema } from './editor-types';

export interface TranslationChange {
  field: string;
  originalText: string;
  translatedText: string;
  targetLocale: string;
  /** Preenchido quando a API de tradução falhou (texto repetido = edite manualmente). */
  translationError?: string;
}

export interface TranslationPreview {
  locale: string;
  changes: TranslationChange[];
}

/**
 * Detecta campos de cópia alterados (títulos, HTML, strings em JSON).
 */
export function detectTextChanges(oldLayout: unknown, newLayout: unknown): string[] {
  const oldPage = oldLayout as PageSchema;
  const newPage = newLayout as PageSchema;
  if (!oldPage?.blocks || !newPage?.blocks) return [];

  const fields = listPageTranslationFieldPaths(newPage);
  const changed: string[] = [];

  for (const field of fields) {
    const oldText = getTranslationTextAt(oldPage, field);
    const newText = getTranslationTextAt(newPage, field);
    if (oldText === null || newText === null) continue;
    if (oldText !== newText) {
      changed.push(field);
    }
  }

  return changed;
}

/**
 * Gera preview das traduções via API (servidor chama Google Translate).
 */
export async function fetchTranslationPreview(
  sourceLayout: unknown,
  targetLocales: string[],
  changedFields: string[],
  sourceLocale = 'es'
): Promise<TranslationPreview[]> {
  const res = await fetch('/api/editor/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceLayout, targetLocales, changedFields, sourceLocale }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === 'string' ? err.error : 'Falha ao gerar traduções');
  }

  return res.json();
}

/**
 * Aplica traduções aprovadas aos layouts
 */
export function applyApprovedTranslations(targetLayout: unknown, approvedChanges: TranslationChange[]): unknown {
  const updatedLayout = JSON.parse(JSON.stringify(targetLayout)) as Record<string, unknown>;

  for (const change of approvedChanges) {
    setTranslationTextAt(updatedLayout, change.field, change.translatedText);
  }

  return updatedLayout;
}
