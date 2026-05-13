/**
 * GET /api/editor/layouts/[slug] - Obter um layout
 * PUT /api/editor/layouts/[slug] - Atualizar um layout
 * DELETE /api/editor/layouts/[slug] - Deletar um layout
 */

import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { PageSchema } from '@/lib/editor-types';
import { commitAndPushGitFiles } from '@/lib/git-utils';

const LAYOUTS_DIR = path.join(process.cwd(), 'public', 'page-layouts');

function sanitizeLayoutJson(raw: string): string {
  return raw.replace(/^\uFEFF/, '');
}

function buildLayoutFilename(slug: string, locale?: string): string {
  const normalizedLocale = locale?.trim();
  return normalizedLocale ? `${slug}.${normalizedLocale}.json` : `${slug}.json`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || undefined;
    const filename = buildLayoutFilename(slug, locale);
    const filepath = path.join(LAYOUTS_DIR, filename);

    const content = await fs.readFile(filepath, 'utf-8');
    const layout = JSON.parse(sanitizeLayoutJson(content));

    return NextResponse.json(layout);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Layout não encontrado' }, { status: 404 });
    }
    console.error('Erro ao obter layout:', error);
    return NextResponse.json({ error: 'Erro ao obter layout' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || undefined;
    const body = await request.json();

    const filename = buildLayoutFilename(slug, locale);
    const filepath = path.join(LAYOUTS_DIR, filename);

    const layout: PageSchema = {
      ...body,
      locale,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(filepath, JSON.stringify(layout, null, 2));

    try {
      await commitAndPushGitFiles([`public/page-layouts/${filename}`], `Editor update: ${slug}${locale ? `.${locale}` : ''}`);
    } catch (error) {
      console.error('Git sync failed:', error);
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error('Erro ao atualizar layout:', error);
    return NextResponse.json({ error: 'Erro ao atualizar layout' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || undefined;
    const filename = buildLayoutFilename(slug, locale);
    const filepath = path.join(LAYOUTS_DIR, filename);

    await fs.unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Layout não encontrado' }, { status: 404 });
    }
    console.error('Erro ao deletar layout:', error);
    return NextResponse.json({ error: 'Erro ao deletar layout' }, { status: 500 });
  }
}
