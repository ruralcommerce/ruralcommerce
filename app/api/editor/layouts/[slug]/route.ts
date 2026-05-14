/**
 * GET /api/editor/layouts/[slug] - Obter um layout
 * POST /api/editor/layouts/[slug]?locale= - Criar layout (clone de outro ficheiro do mesmo slug)
 * PUT /api/editor/layouts/[slug] - Atualizar um layout
 * DELETE /api/editor/layouts/[slug] - Deletar um layout
 */

import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from '@/i18n/request';
import { PageSchema } from '@/lib/editor-types';
import { validatePageSchema } from '@/lib/editor-utils';
import { commitAndPushGitFiles, shouldGitPushAfterSave } from '@/lib/git-utils';

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

/**
 * POST /api/editor/layouts/[slug]?locale=xx
 * Cria ficheiro de layout para o par slug+locale clonando outro ficheiro do mesmo slug (ex.: ES ou ficheiro sem locale).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = _request.nextUrl.searchParams.get('locale')?.trim();
    if (!locale) {
      return NextResponse.json({ error: 'Parâmetro locale é obrigatório' }, { status: 400 });
    }

    const filename = buildLayoutFilename(slug, locale);
    const filepath = path.join(LAYOUTS_DIR, filename);

    try {
      await fs.access(filepath);
      return NextResponse.json({ error: 'Layout já existe para este slug e idioma' }, { status: 409 });
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'ENOENT') throw err;
    }

    const localeOrder = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)];
    const candidateNames = [...localeOrder.map((l) => `${slug}.${l}.json`), `${slug}.json`];

    let templateRaw: string | null = null;
    for (const name of candidateNames) {
      const fp = path.join(LAYOUTS_DIR, name);
      try {
        templateRaw = await fs.readFile(fp, 'utf-8');
        break;
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') throw err;
      }
    }

    if (!templateRaw) {
      return NextResponse.json(
        { error: 'Nenhum layout modelo encontrado para este slug (crie manualmente no editor).' },
        { status: 404 }
      );
    }

    const parsed = JSON.parse(sanitizeLayoutJson(templateRaw)) as Record<string, unknown>;
    if (!validatePageSchema(parsed)) {
      return NextResponse.json({ error: 'Layout modelo inválido' }, { status: 500 });
    }

    const now = new Date().toISOString();
    const base = parsed as unknown as PageSchema;
    const layout: PageSchema = {
      ...base,
      slug,
      locale,
      status: 'draft',
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    await fs.writeFile(filepath, JSON.stringify(layout, null, 2));

    let _sync: { git: 'ok' | 'skipped' | 'failed'; message?: string } = { git: 'skipped' };

    if (shouldGitPushAfterSave(layout)) {
      try {
        await commitAndPushGitFiles(
          [`public/page-layouts/${filename}`],
          `Editor created layout: ${slug}.${locale}`
        );
        _sync = { git: 'ok' };
      } catch (error) {
        console.error('Git sync failed:', error);
        _sync = { git: 'failed', message: error instanceof Error ? error.message : String(error) };
      }
    }

    return NextResponse.json({ ...layout, _sync }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar layout:', error);
    return NextResponse.json({ error: 'Erro ao criar layout' }, { status: 500 });
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

    let _sync: { git: 'ok' | 'skipped' | 'failed'; message?: string } = { git: 'skipped' };

    if (shouldGitPushAfterSave(layout)) {
      try {
        await commitAndPushGitFiles(
          [`public/page-layouts/${filename}`],
          `Editor publish: ${slug}${locale ? `.${locale}` : ''}`
        );
        _sync = { git: 'ok' };
      } catch (error) {
        console.error('Git sync failed:', error);
        _sync = { git: 'failed', message: error instanceof Error ? error.message : String(error) };
      }
    }

    return NextResponse.json({ ...layout, _sync });
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
