/**
 * GET /api/editor/layouts - Listar todos os layouts
 * POST /api/editor/layouts - Criar novo layout
 */

import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { PageSchema } from '@/lib/editor-types';
import { validatePageSchema } from '@/lib/editor-utils';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');

// Garantir que o diretório existe
async function ensureLayoutsDir() {
  try {
    await fs.mkdir(LAYOUTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório:', error);
  }
}

export async function GET() {
  try {
    await ensureLayoutsDir();
    const files = await fs.readdir(LAYOUTS_DIR);
    const layouts: PageSchema[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(LAYOUTS_DIR, file), 'utf-8');
        layouts.push(JSON.parse(content));
      }
    }

    return NextResponse.json(layouts);
  } catch (error) {
    console.error('Erro ao listar layouts:', error);
    return NextResponse.json({ error: 'Erro ao listar layouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureLayoutsDir();
    const body = await request.json();

    if (!validatePageSchema(body)) {
      return NextResponse.json({ error: 'Schema inválido' }, { status: 400 });
    }

    const layout: PageSchema = {
      ...body,
      id: body.id || `layout-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'draft',
    };

    const filename = `${layout.slug || layout.id}.json`;
    await fs.writeFile(path.join(LAYOUTS_DIR, filename), JSON.stringify(layout, null, 2));

    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar layout:', error);
    return NextResponse.json({ error: 'Erro ao criar layout' }, { status: 500 });
  }
}
