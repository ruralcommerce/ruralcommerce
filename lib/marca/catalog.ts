import { readFile } from 'fs/promises';
import path from 'path';
import type { MarcaImage } from './types';

export {
  filterCatalogByIds,
  pickSectionRepresentatives,
  stripTagsForPublic,
} from './catalog-pure';
export { normalizeToneLabel } from './labels';

export const MARCA_SEED_CATALOG: MarcaImage[] = [];

export const MARCA_SUGGESTED_TAGS = [
  'pastel',
  'sóbrio',
  'terroso',
  'vibrante',
  'palette',
  'logo',
  'packaging',
];

export async function loadSeedCatalogFromDisk(): Promise<MarcaImage[]> {
  try {
    const file = path.join(process.cwd(), 'data', 'marca-catalog.seed.json');
    const raw = await readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as { images?: MarcaImage[] };
    return Array.isArray(parsed.images) ? parsed.images : [];
  } catch {
    return [];
  }
}
