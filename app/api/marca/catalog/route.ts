import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { MARCA_SUGGESTED_TAGS } from '@/lib/marca/catalog';
import { listCatalogImages, upsertCatalogImage } from '@/lib/marca/catalog-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MARCA_UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'marca');
const MAX_MB = 12;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function GET() {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const images = await listCatalogImages({ includeInactive: true });
  return NextResponse.json({ images, suggestedTags: MARCA_SUGGESTED_TAGS });
}

export async function POST(request: Request) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';

  // JSON: create/update metadata (color card or edit without file)
  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      src?: string;
      alt?: string;
      tags?: string[];
      moodColor?: string;
      active?: boolean;
    };
    if (!body.alt?.trim()) {
      return NextResponse.json({ error: 'alt required' }, { status: 400 });
    }
    const image = await upsertCatalogImage({
      id: body.id,
      src: body.src || '',
      alt: body.alt,
      tags: body.tags || [],
      moodColor: body.moodColor,
      active: body.active,
    });
    return NextResponse.json({ image }, { status: body.id ? 200 : 201 });
  }

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Use multipart/form-data or JSON' }, { status: 415 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const alt = String(form.get('alt') || '').trim() || 'Imagen de oficina';
  const tags = parseTags(form.get('tags'));
  const moodColor = String(form.get('moodColor') || '#071F5E').trim();
  const id = String(form.get('id') || '').trim() || undefined;

  let src = String(form.get('src') || '').trim();

  if (file && file instanceof Blob && file.size > 0) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Máximo ${MAX_MB} MB` }, { status: 400 });
    }
    const mime = (file.type || '').split(';')[0].trim().toLowerCase();
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      return NextResponse.json({ error: 'Formato no soportado (png/jpg/webp/gif)' }, { status: 400 });
    }
    await mkdir(MARCA_UPLOAD_DIR, { recursive: true });
    const filename = `marca_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}${ext}`;
    const abs = path.join(MARCA_UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(abs, buffer);
    src = `/images/marca/${filename}`;
  }

  const image = await upsertCatalogImage({
    id,
    src,
    alt,
    tags,
    moodColor,
    active: true,
  });

  return NextResponse.json({ image }, { status: 201 });
}
