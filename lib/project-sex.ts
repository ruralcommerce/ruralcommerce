import type { ProjectLocaleKey } from '@/lib/project-locale';

/** Stable storage codes — never persist UI language labels. */
export const PROJECT_SEX_VALUES = ['male', 'female', 'collective'] as const;
export type ProjectSex = (typeof PROJECT_SEX_VALUES)[number];
export type ProjectSexFilter = 'all' | ProjectSex | 'unknown';

const labels: Record<ProjectLocaleKey, Record<ProjectSex, string>> = {
  es: {
    male: 'Masculino',
    female: 'Femenino',
    collective: 'Colectivo',
  },
  'pt-BR': {
    male: 'Masculino',
    female: 'Feminino',
    collective: 'Coletivo',
  },
  en: {
    male: 'Male',
    female: 'Female',
    collective: 'Collective',
  },
};

export function isProjectSex(value: unknown): value is ProjectSex {
  return typeof value === 'string' && (PROJECT_SEX_VALUES as readonly string[]).includes(value);
}

/** Normalize spreadsheet / free text into a storage code. */
export function normalizeProjectSex(raw: unknown): ProjectSex | null {
  if (isProjectSex(raw)) return raw;
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  if (['male', 'm', 'masculino', 'hombre', 'man', 'homem'].includes(key)) return 'male';
  if (['female', 'f', 'femenino', 'femenina', 'mujer', 'woman', 'mulher', 'feminino'].includes(key)) {
    return 'female';
  }
  if (
    ['collective', 'colectivo', 'colectiva', 'coletivo', 'coletiva', 'group', 'grupo', 'organización', 'organizacion'].includes(
      key
    )
  ) {
    return 'collective';
  }
  return null;
}

export function getProjectSexLabel(sex: ProjectSex | null | undefined, locale?: string) {
  if (!sex || !isProjectSex(sex)) return '';
  const key: ProjectLocaleKey = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return labels[key][sex];
}

export function getProjectSexOptions(locale?: string): Array<{ value: ProjectSex; label: string }> {
  return PROJECT_SEX_VALUES.map((value) => ({
    value,
    label: getProjectSexLabel(value, locale),
  }));
}
