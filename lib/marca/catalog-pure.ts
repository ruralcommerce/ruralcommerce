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
    const sameTone = (img: MarcaImage) =>
      img.active !== false && (img.tone === tone || img.tags.includes(tone));
    const match =
      catalog.find((img) => sameTone(img) && img.section === section) ||
      // fallback if Drive is missing that section for a tone (e.g. terroso packaging)
      catalog.find((img) => sameTone(img));
    if (match) out.push(stripTagsForPublic([match])[0]);
  }
  return out;
}
