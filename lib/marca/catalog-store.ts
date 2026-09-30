import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { MARCA_SEED_CATALOG, filterCatalogByIds } from './catalog';
import type { MarcaImage } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'marca-catalog.json');

type CatalogFile = { images: MarcaImage[] };

async function readOrSeed(): Promise<CatalogFile> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CatalogFile;
    if (parsed?.images?.length) return parsed;
  } catch {
    // missing or invalid
  }
  const seeded: CatalogFile = { images: structuredClone(MARCA_SEED_CATALOG) };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf8');
  return seeded;
}

async function saveCatalog(file: CatalogFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(file, null, 2), 'utf8');
}

function newImageId() {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function listCatalogImages(opts?: { includeInactive?: boolean }): Promise<MarcaImage[]> {
  const file = await readOrSeed();
  if (opts?.includeInactive) return [...file.images];
  return file.images.filter((img) => img.active !== false);
}

export async function getCatalogByIds(ids?: string[]): Promise<MarcaImage[]> {
  const all = await listCatalogImages({ includeInactive: true });
  return filterCatalogByIds(all, ids);
}

export async function upsertCatalogImage(
  input: Partial<MarcaImage> & { alt: string; tags: string[] }
): Promise<MarcaImage> {
  const file = await readOrSeed();
  const now = new Date().toISOString();

  if (input.id) {
    const index = file.images.findIndex((img) => img.id === input.id);
    if (index >= 0) {
      const current = file.images[index];
      const next: MarcaImage = {
        ...current,
        ...input,
        id: current.id,
        alt: (input.alt ?? current.alt).trim(),
        tags: (input.tags ?? current.tags).map((t) => t.trim()).filter(Boolean),
        src: input.src !== undefined ? input.src : current.src,
        moodColor: input.moodColor !== undefined ? input.moodColor : current.moodColor,
        active: input.active !== undefined ? input.active : current.active !== false,
        updatedAt: now,
      };
      file.images[index] = next;
      await saveCatalog(file);
      return next;
    }
  }

  const created: MarcaImage = {
    id: input.id || newImageId(),
    src: input.src || '',
    alt: input.alt.trim() || 'Imagen',
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    moodColor: input.moodColor || '#071F5E',
    active: input.active !== false,
    createdAt: now,
    updatedAt: now,
  };
  file.images.unshift(created);
  await saveCatalog(file);
  return created;
}

export async function deleteCatalogImage(id: string): Promise<boolean> {
  const file = await readOrSeed();
  const next = file.images.filter((img) => img.id !== id);
  if (next.length === file.images.length) return false;
  file.images = next;
  await saveCatalog(file);
  return true;
}
