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
  const usedIds = new Set<string>();
  const usedSrc = new Set<string>();

  for (const tone of tones) {
    const sameTone = (img: MarcaImage) =>
      img.active !== false && (img.tone === tone || img.tags.includes(tone));
    const unused = (img: MarcaImage) =>
      !usedIds.has(img.id) && !(img.src && usedSrc.has(img.src.toLowerCase()));

    const match =
      catalog.find((img) => sameTone(img) && img.section === section && unused(img)) ||
      catalog.find((img) => sameTone(img) && img.section === section) ||
      catalog.find((img) => sameTone(img) && unused(img));

    if (!match || usedIds.has(match.id)) continue;
    usedIds.add(match.id);
    if (match.src) usedSrc.add(match.src.toLowerCase());
    out.push(stripTagsForPublic([match])[0]);
  }
  return out;
}
