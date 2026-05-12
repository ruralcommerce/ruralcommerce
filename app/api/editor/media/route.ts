import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
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
