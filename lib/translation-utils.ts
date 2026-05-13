/**
 * Utilitários de tradução automática
 */

import translate from 'google-translate-api-x';

export interface TranslationChange {
  field: string;
  originalText: string;
  translatedText: string;
  targetLocale: string;
}

export interface TranslationPreview {
  locale: string;
  changes: TranslationChange[];
}

/**
 * Traduz um texto para um idioma específico
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    if (!text || text.trim() === '') return text;

    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error('Erro na tradução:', error);
    return text; // Retorna o texto original em caso de erro
  }
}

/**
 * Detecta mudanças entre dois objetos de layout
 */
export function detectTextChanges(oldLayout: any, newLayout: any): string[] {
  const changes: string[] = [];

  function compareObjects(oldObj: any, newObj: any, path = ''): void {
    if (typeof oldObj !== 'object' || typeof newObj !== 'object' || !oldObj || !newObj) {
      return;
    }

    for (const key in newObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof newObj[key] === 'string' && oldObj[key] !== newObj[key]) {
        // Verifica se é um campo de texto (não URL, não JSON, etc.)
        if (!key.includes('Url') && !key.includes('Href') && !key.includes('Json') && !key.includes('Color')) {
          changes.push(currentPath);
        }
      } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
        compareObjects(oldObj[key], newObj[key], currentPath);
      }
    }
  }

  compareObjects(oldLayout, newLayout);
  return changes;
}

/**
 * Gera preview das traduções para aprovação
 */
export async function generateTranslationPreview(
  sourceLayout: any,
  targetLocales: string[],
  changedFields: string[]
): Promise<TranslationPreview[]> {
  const previews: TranslationPreview[] = [];

  for (const locale of targetLocales) {
    const changes: TranslationChange[] = [];

    for (const field of changedFields) {
      const fieldPath = field.split('.');
      let sourceValue = sourceLayout;

      // Navega até o campo
      for (const pathPart of fieldPath) {
        sourceValue = sourceValue?.[pathPart];
      }

      if (typeof sourceValue === 'string') {
        const translatedText = await translateText(sourceValue, locale);
        changes.push({
          field,
          originalText: sourceValue,
          translatedText,
          targetLocale: locale,
        });
      }
    }

    if (changes.length > 0) {
      previews.push({
        locale,
        changes,
      });
    }
  }

  return previews;
}

/**
 * Aplica traduções aprovadas aos layouts
 */
export function applyApprovedTranslations(
  targetLayout: any,
  approvedChanges: TranslationChange[]
): any {
  const updatedLayout = JSON.parse(JSON.stringify(targetLayout));

  for (const change of approvedChanges) {
    const fieldPath = change.field.split('.');
    let current = updatedLayout;

    // Navega até o campo pai
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
      current = current[fieldPath[i]];
    }

    // Define o valor traduzido
    current[fieldPath[fieldPath.length - 1]] = change.translatedText;
  }

  return updatedLayout;
}