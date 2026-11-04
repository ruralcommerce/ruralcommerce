import { MNS_FICHAS } from './content';
import type { MnsFieldDef, MnsFichaDef, MnsFichaId } from './types';

export type MnsPlayScreen =
  | {
      key: string;
      kind: 'chapter';
      ficha: MnsFichaDef;
      fichaIndex: number;
    }
  | {
      key: string;
      kind: 'field';
      ficha: MnsFichaDef;
      fichaIndex: number;
      field: MnsFieldDef;
      fieldOrdinal: number;
      fieldsInFicha: number;
    };

/** Una pantalla = un momento (capítulo o campo). Evita el “formulario largo”. */
export function buildPlayScreens(): MnsPlayScreen[] {
  const screens: MnsPlayScreen[] = [];
  MNS_FICHAS.forEach((ficha, fichaIndex) => {
    screens.push({
      key: `chapter-${ficha.id}`,
      kind: 'chapter',
      ficha,
      fichaIndex,
    });
    const fields = ficha.steps.flatMap((s) => s.fields);
    fields.forEach((field, fieldOrdinal) => {
      screens.push({
        key: `${ficha.id}:${field.id}`,
        kind: 'field',
        ficha,
        fichaIndex,
        field,
        fieldOrdinal,
        fieldsInFicha: fields.length,
      });
    });
  });
  return screens;
}

export const MNS_PLAY_SCREENS = buildPlayScreens();

export function fichaIdAtScreen(index: number): MnsFichaId {
  const screen = MNS_PLAY_SCREENS[Math.max(0, Math.min(index, MNS_PLAY_SCREENS.length - 1))];
  return screen.ficha.id;
}

export function inferPlayIndex(opts: {
  answers: Partial<Record<MnsFichaId, Record<string, unknown>>>;
  savedIndex?: number;
  phase?: string;
}): number {
  if (typeof opts.savedIndex === 'number' && opts.savedIndex >= 0) {
    // Si el índice guardado viene de una versión más larga del mapa, reubicamos por respuestas.
    if (opts.savedIndex >= MNS_PLAY_SCREENS.length) {
      // fall through to answer-based inference
    } else {
      return opts.savedIndex;
    }
  }
  for (let i = 0; i < MNS_PLAY_SCREENS.length; i += 1) {
    const screen = MNS_PLAY_SCREENS[i];
    if (screen.kind === 'chapter') continue;
    const value = opts.answers[screen.ficha.id]?.[screen.field.id];
    let filled = false;
    if (typeof value === 'string') filled = Boolean(value.trim());
    else if (Array.isArray(value)) filled = value.length > 0;
    else if (value && typeof value === 'object') {
      filled = Object.values(value as Record<string, string>).some((v) => Boolean(String(v || '').trim()));
    }
    if (!filled && screen.field.required !== false) return i;
  }
  return Math.max(0, MNS_PLAY_SCREENS.length - 1);
}
