/**
 * Utilitários de tradução (diff/apply no cliente; chamada de preview via API).
 */

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
 * Detecta mudanças entre dois objetos de layout (caminhos tipo blocks.0.props.title).
 */
export function detectTextChanges(oldLayout: unknown, newLayout: unknown): string[] {
  const changes: string[] = [];

  function compareObjects(oldObj: unknown, newObj: unknown, path = ''): void {
    if (typeof oldObj !== 'object' || typeof newObj !== 'object' || !oldObj || !newObj) {
      return;
    }

    for (const key in newObj as Record<string, unknown>) {
      const currentPath = path ? `${path}.${key}` : key;
      const newVal = (newObj as Record<string, unknown>)[key];
      const oldVal = (oldObj as Record<string, unknown>)[key];

      if (typeof newVal === 'string' && oldVal !== newVal) {
        if (!key.includes('Url') && !key.includes('Href') && !key.includes('Json') && !key.includes('Color')) {
          changes.push(currentPath);
        }
      } else if (typeof newVal === 'object' && newVal !== null) {
        compareObjects(oldVal, newVal, currentPath);
      }
    }
  }

  compareObjects(oldLayout, newLayout);
  return changes;
}

/**
 * Gera preview das traduções via API (servidor chama Google Translate).
 */
export async function fetchTranslationPreview(
  sourceLayout: unknown,
  targetLocales: string[],
  changedFields: string[]
): Promise<TranslationPreview[]> {
  const res = await fetch('/api/editor/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceLayout, targetLocales, changedFields }),
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
    const fieldPath = change.field.split('.');
    let current: Record<string, unknown> = updatedLayout;

    for (let i = 0; i < fieldPath.length - 1; i++) {
      const key = fieldPath[i];
      if (!current[key]) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }

    current[fieldPath[fieldPath.length - 1]] = change.translatedText;
  }

  return updatedLayout;
}
