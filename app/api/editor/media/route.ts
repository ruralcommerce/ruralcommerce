import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRelativeDirUnderImages } from '@/lib/editor-media-path';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const UPLOADS_SUBDIR = 'uploads';
const UPLOADS_DIR = path.join(PUBLIC_IMAGES_DIR, UPLOADS_SUBDIR);

const DEFAULT_MAX_MB = 50;
const maxMb = Math.min(
  200,
  Math.max(5, Number.parseInt(process.env.EDITOR_MAX_UPLOAD_MB || String(DEFAULT_MAX_MB), 10) || DEFAULT_MAX_MB)
);
const MAX_UPLOAD_BYTES = maxMb * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.jfif',
  '.webp',
  '.gif',
  '.svg',
  '.bmp',
  '.tif',
  '.tiff',
  '.avif',
  '.ico',
  '.heic',
  '.heif',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/tiff': '.tif',
  'image/avif': '.avif',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function collectImagePaths(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await collectImagePaths(fullPath, baseDir);
      results.push(...nested);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) {
      continue;
    }

    const relative = path.relative(baseDir, fullPath).split(path.sep).join('/');
    results.push(`/images/${relative}`);
  }

  return results;
}

export async function GET() {
  try {
    const images = await collectImagePaths(PUBLIC_IMAGES_DIR, PUBLIC_IMAGES_DIR);
    images.sort((a, b) => a.localeCompare(b));

    return NextResponse.json(
      { images, maxUploadMb: maxMb },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' } }
    );
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'ENOENT') {
      return NextResponse.json(
        { images: [], maxUploadMb: maxMb },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' } }
      );
    }

    console.error('Erro ao listar imagens da biblioteca:', error);
    return NextResponse.json({ error: 'Erro ao listar imagens' }, { status: 500 });
  }
}

function safeBasename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.length > 120 ? base.slice(-120) : base;
}

function extFromMime(mime: string): string | null {
  const m = mime.split(';')[0]?.trim().toLowerCase() || '';
  return MIME_TO_EXT[m] ?? null;
}

/** Caminho público /images/... → ficheiro dentro de public/images (sem ..). */
function resolvePublicImagePath(publicPath: string): { ok: true; abs: string } | { ok: false; status: number; message: string } {
  const trimmed = publicPath.trim();
  if (!trimmed.startsWith('/images/')) {
    return { ok: false, status: 400, message: 'Caminho inválido' };
  }
  const relative = trimmed.replace(/^\/images\/?/, '');
  if (relative.includes('..') || path.isAbsolute(relative)) {
    return { ok: false, status: 400, message: 'Caminho inválido' };
  }
  const abs = path.resolve(PUBLIC_IMAGES_DIR, relative);
  const root = path.resolve(PUBLIC_IMAGES_DIR);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return { ok: false, status: 400, message: 'Caminho fora da pasta de imagens' };
  }
  return { ok: true, abs };
}

const UPLOAD_ROOT_SENTINEL = '__images_root__';

/** Destino do POST: qualquer subpasta de public/images (ou raiz). */
function resolveUploadDestinationDir(form: FormData): { ok: true; abs: string } | { ok: false; message: string } {
  const targetDirRaw = form.get('targetDir');
  const legacyFolder = form.get('folder');

  const imagesRoot = path.resolve(PUBLIC_IMAGES_DIR);
  const uploadsRoot = path.resolve(UPLOADS_DIR);

  if (targetDirRaw !== null && targetDirRaw !== undefined) {
    const s = typeof targetDirRaw === 'string' ? targetDirRaw : '';
    if (s === UPLOAD_ROOT_SENTINEL) {
      return { ok: true, abs: imagesRoot };
    }
    const rel = sanitizeRelativeDirUnderImages(s);
    const dest = rel ? path.resolve(PUBLIC_IMAGES_DIR, ...rel.split('/')) : PUBLIC_IMAGES_DIR;
    const resolved = path.resolve(dest);
    if (!resolved.startsWith(imagesRoot + path.sep) && resolved !== imagesRoot) {
      return { ok: false, message: 'Pasta de destino fora de public/images' };
    }
    return { ok: true, abs: resolved };
  }

  if (legacyFolder && typeof legacyFolder === 'string' && legacyFolder.trim()) {
    const sub = sanitizeRelativeDirUnderImages(legacyFolder);
    const dest = sub ? path.resolve(UPLOADS_DIR, ...sub.split('/')) : UPLOADS_DIR;
    const resolved = path.resolve(dest);
    if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
      return { ok: false, message: 'Pasta legacy inválida' };
    }
    return { ok: true, abs: resolved };
  }

  return { ok: true, abs: uploadsRoot };
}

function canDeletePublicPath(publicPath: string): boolean {
  return publicPath.trim().startsWith('/images/');
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Use multipart/form-data com o campo "file".', code: 'UNSUPPORTED_MEDIA' },
        { status: 415 }
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch (e) {
      console.error('formData parse (corpo demasiado grande ou inválido):', e);
      return NextResponse.json(
        {
          error: `Corpo da requisição inválido ou demasiado grande (máx. ${maxMb} MB).`,
          code: 'BODY_PARSE',
        },
        { status: 413 }
      );
    }

    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Ficheiro em falta (campo "file").', code: 'NO_FILE' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Ficheiro vazio (0 bytes).', code: 'EMPTY_FILE' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `Ficheiro demasiado grande (máx. ${maxMb} MB). Ajuste EDITOR_MAX_UPLOAD_MB no servidor (até 200).`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    const destResolved = resolveUploadDestinationDir(form);
    if (!destResolved.ok) {
      return NextResponse.json({ error: destResolved.message, code: 'BAD_FOLDER' }, { status: 400 });
    }

    const origName = file instanceof File && file.name ? file.name : 'upload.png';
    const base = safeBasename(origName);
    let ext = path.extname(base).toLowerCase();
    const mime = file.type || '';
    if (!IMAGE_EXTENSIONS.has(ext)) {
      const fromMime = extFromMime(mime);
      ext = fromMime && IMAGE_EXTENSIONS.has(fromMime) ? fromMime : '.png';
    }
    const stem = path.basename(base, path.extname(base)).replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
    const unique = `${stem}-${Date.now()}${ext}`;

    await fs.mkdir(destResolved.abs, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const dest = path.join(destResolved.abs, unique);
    await fs.writeFile(dest, buffer);

    const relFromImages = path.relative(PUBLIC_IMAGES_DIR, dest).split(path.sep).join('/');
    const publicPath = `/images/${relFromImages}`;
    return NextResponse.json({ path: publicPath, maxUploadMb: maxMb });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao guardar imagem no disco. Verifique permissões em public/images.', code: 'WRITE' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let body: { path?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const publicPath = typeof body.path === 'string' ? body.path.trim() : '';
    if (!publicPath || !canDeletePublicPath(publicPath)) {
      return NextResponse.json({ error: 'Caminho inválido para apagar' }, { status: 403 });
    }

    const resolved = resolvePublicImagePath(publicPath);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.message }, { status: resolved.status });
    }

    let st: { isFile: () => boolean };
    try {
      st = await fs.stat(resolved.abs);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'ENOENT') {
        return NextResponse.json({ error: 'Ficheiro já não existe' }, { status: 404 });
      }
      throw e;
    }
    if (!st.isFile()) {
      return NextResponse.json({ error: 'Só é permitido apagar ficheiros (não pastas)' }, { status: 400 });
    }

    try {
      await fs.unlink(resolved.abs);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'ENOENT') {
        return NextResponse.json({ error: 'Ficheiro já não existe' }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao apagar imagem:', error);
    return NextResponse.json({ error: 'Erro ao apagar imagem' }, { status: 500 });
  }
}
