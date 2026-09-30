import type { MarcaImage, MarcaPublicImage, MarcaSection } from './types';
import { MARCA_TONES } from './types';

export function stripTagsForPublic(images: MarcaImage[]): MarcaPublicImage[] {
  return images.map(({ id, src, alt, moodColor, tone, section }) => ({
    id,
    src,
    alt,
    moodColor,
    tone,
    section,
  }));
}

export function filterCatalogByIds(catalog: MarcaImage[], ids?: string[]): MarcaImage[] {
  const active = catalog.filter((img) => img.active !== false);
  if (!ids || ids.length === 0) return active;
  const map = new Map(catalog.map((item) => [item.id, item]));
  const selected: MarcaImage[] = [];
  for (const id of ids) {
    const img = map.get(id);
    if (img && img.active !== false) selected.push(img);
  }
  return selected;
}

export function pickSectionRepresentatives(
  catalog: MarcaImage[],
  section: MarcaSection,
  tones: readonly string[] = MARCA_TONES
): MarcaPublicImage[] {
  const out: MarcaPublicImage[] = [];
  for (const tone of tones) {
    const match = catalog.find(
      (img) => img.active !== false && img.section === section && (img.tone === tone || img.tags.includes(tone))
    );
    if (match) out.push(stripTagsForPublic([match])[0]);
  }
  return out;
}
