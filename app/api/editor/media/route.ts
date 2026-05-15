import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const UPLOADS_SUBDIR = 'uploads';
const UPLOADS_DIR = path.join(PUBLIC_IMAGES_DIR, UPLOADS_SUBDIR);
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

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

    return NextResponse.json({ images });
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ images: [] });
    }

    console.error('Erro ao listar imagens da biblioteca:', error);
    return NextResponse.json({ error: 'Erro ao listar imagens' }, { status: 500 });
  }
}

function safeBasename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.length > 120 ? base.slice(-120) : base;
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

/** Apagar só ficheiros em /images/uploads/ (evita remover assets do tema). */
function canDeletePublicPath(publicPath: string): boolean {
  return publicPath.startsWith(`/images/${UPLOADS_SUBDIR}/`);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Use multipart/form-data com o campo "file".' }, { status: 415 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Ficheiro em falta (campo "file").' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `Ficheiro demasiado grande (máx. ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` }, { status: 400 });
    }

    const origName = file instanceof File && file.name ? file.name : 'upload.png';
    const base = safeBasename(origName);
    let ext = path.extname(base).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      ext = '.png';
    }
    const stem = path.basename(base, path.extname(base)) || 'image';
    const unique = `${stem}-${Date.now()}${ext}`;

    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const dest = path.join(UPLOADS_DIR, unique);
    await fs.writeFile(dest, buffer);

    const publicPath = `/images/${UPLOADS_SUBDIR}/${unique}`;
    return NextResponse.json({ path: publicPath });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ error: 'Erro ao guardar imagem' }, { status: 500 });
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
      return NextResponse.json(
        { error: 'Só é permitido apagar imagens em /images/uploads/' },
        { status: 403 }
      );
    }

    const resolved = resolvePublicImagePath(publicPath);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.message }, { status: resolved.status });
    }

    try {
      await fs.unlink(resolved.abs);
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
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
