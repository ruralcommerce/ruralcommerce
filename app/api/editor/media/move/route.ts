import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRelativeDirUnderImages } from '@/lib/editor-media-path';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function resolveUnderImages(publicPath: string): { ok: true; abs: string } | { ok: false; status: number; message: string } {
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
    return { ok: false, status: 400, message: 'Caminho fora de public/images' };
  }
  return { ok: true, abs };
}

export async function POST(request: NextRequest) {
  try {
    let body: { from?: string; toDir?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }

    const fromPublic = typeof body.from === 'string' ? body.from.trim() : '';
    const toDirRaw = body.toDir;
    const toRel = typeof toDirRaw === 'string' ? sanitizeRelativeDirUnderImages(toDirRaw) : '';

    if (!fromPublic) {
      return NextResponse.json({ error: 'Campo "from" obrigatório' }, { status: 400 });
    }

    const fromRes = resolveUnderImages(fromPublic);
    if (!fromRes.ok) {
      return NextResponse.json({ error: fromRes.message }, { status: fromRes.status });
    }

    let st: { isFile: () => boolean; isDirectory: () => boolean };
    try {
      st = await fs.stat(fromRes.abs);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'ENOENT') {
        return NextResponse.json({ error: 'Ficheiro de origem não encontrado' }, { status: 404 });
      }
      throw e;
    }
    if (!st.isFile()) {
      return NextResponse.json({ error: 'A origem tem de ser um ficheiro' }, { status: 400 });
    }

    const baseName = path.basename(fromRes.abs);
    const destDir = toRel ? path.join(PUBLIC_IMAGES_DIR, ...toRel.split('/')) : PUBLIC_IMAGES_DIR;
    const resolvedDestDir = path.resolve(destDir);
    const root = path.resolve(PUBLIC_IMAGES_DIR);
    if (!resolvedDestDir.startsWith(root + path.sep) && resolvedDestDir !== root) {
      return NextResponse.json({ error: 'Pasta de destino inválida' }, { status: 400 });
    }

    await fs.mkdir(resolvedDestDir, { recursive: true });
    const destAbs = path.join(resolvedDestDir, baseName);

    if (path.resolve(destAbs) === path.resolve(fromRes.abs)) {
      return NextResponse.json({ error: 'Origem e destino são o mesmo ficheiro' }, { status: 400 });
    }

    try {
      await fs.access(destAbs);
      return NextResponse.json({ error: 'Já existe um ficheiro com esse nome na pasta de destino' }, { status: 409 });
    } catch {
      /* ok */
    }

    try {
      await fs.rename(fromRes.abs, destAbs);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'EXDEV') {
        await fs.copyFile(fromRes.abs, destAbs);
        await fs.unlink(fromRes.abs);
      } else {
        throw e;
      }
    }

    const rel = path.relative(PUBLIC_IMAGES_DIR, destAbs).split(path.sep).join('/');
    const newPath = `/images/${rel}`;
    return NextResponse.json({ path: newPath });
  } catch (error) {
    console.error('Erro ao mover imagem:', error);
    return NextResponse.json({ error: 'Erro ao mover ficheiro' }, { status: 500 });
  }
}
