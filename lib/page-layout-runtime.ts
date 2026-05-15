import { promises as fs } from 'fs';
import path from 'path';
import { BlockData, PageSchema } from '@/lib/editor-types';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');

function sanitizeLayoutJson(raw: string): string {
  return raw.replace(/^\uFEFF/, '');
}

export type LayoutSearchParams = {
  preview?: string;
  key?: string;
};

async function readLayoutFile(slug: string, locale?: string): Promise<PageSchema | null> {
  const normalizedLocale = (locale || '').trim();
  const candidates = normalizedLocale
    ? [`${slug}.${normalizedLocale}.json`, `${slug}.json`]
    : [`${slug}.json`];

  for (const filename of candidates) {
    try {
      const content = await fs.readFile(path.join(LAYOUTS_DIR, filename), 'utf-8');
      return JSON.parse(sanitizeLayoutJson(content)) as PageSchema;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  return null;
}

export async function getManagedPageLayout(
  slug: string,
  searchParams?: LayoutSearchParams,
  locale?: string
): Promise<PageSchema | null> {
  try {
    const layout = await readLayoutFile(slug, locale);
    if (!layout) return null;

    const previewEnabled = searchParams?.preview === 'draft';
    const previewKey = searchParams?.key;
    const expectedPreviewKey = process.env.EDITOR_PREVIEW_KEY || 'rural-preview';

    if (previewEnabled && previewKey === expectedPreviewKey) {
      return layout;
    }

    if (layout.status !== 'published') return null;
    return layout;
  } catch {
    return null;
  }
}

export function getSectionProps(layout: PageSchema | null, sectionType: string): Record<string, any> {
  if (!layout) return {};
  const block = layout.blocks.find((item) => item.type === sectionType) as BlockData | undefined;
  return block?.props ?? {};
}

export function getBlockProps(layout: PageSchema | null, blockType: string): Record<string, any> {
  if (!layout) return {};
  const block = layout.blocks.find((item) => item.type === blockType) as BlockData | undefined;
  return block?.props ?? {};
}

export function getBlockIdByType(layout: PageSchema | null, blockType: string): string | undefined {
  return layout?.blocks.find((item) => item.type === blockType)?.id;
}

export function parseJsonArray<T>(raw: unknown, fallback: T[]): T[] {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function getFirstFreeTextContent(layout: PageSchema | null): string {
  if (!layout) return '';
  const freeTextBlock = layout.blocks.find((item) => item.type === 'free-text');
  const value = freeTextBlock?.props?.content;
  return typeof value === 'string' ? value : '';
}
