import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import {
  blogPostsFilePath,
  getBlogPostsForLocale,
  parseBlogPostsPayload,
  readBlogPostsFile,
  type BlogPostsStoreFile,
} from '@/lib/blog-posts';
import { getBlogLocaleKey } from '@/lib/blog-defaults';
import { commitAndPushGitFiles, shouldGitPushAfterSave } from '@/lib/git-utils';

export const dynamic = 'force-dynamic';

function relativeRepoPath(absPath: string): string {
  const rel = path.relative(process.cwd(), absPath);
  return rel.split(path.sep).join('/');
}

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale')?.trim() || 'es';
    getBlogLocaleKey(locale);

    const existing = await readBlogPostsFile(locale);
    if (existing) {
      return NextResponse.json(existing);
    }

    const posts = await getBlogPostsForLocale(locale);
    const stub: BlogPostsStoreFile = {
      version: 1,
      status: 'published',
      updatedAt: new Date().toISOString(),
      posts,
    };
    return NextResponse.json({ ...stub, _source: 'fallback' as const });
  } catch (error) {
    console.error('GET blog-posts:', error);
    return NextResponse.json({ error: 'Erro ao ler artigos do blog' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale')?.trim() || 'es';
    getBlogLocaleKey(locale);

    const body = await request.json();
    const posts = parseBlogPostsPayload({ posts: body?.posts });
    if (!posts) {
      return NextResponse.json({ error: 'Lista de posts inválida (slug único, campos obrigatórios).' }, { status: 400 });
    }

    const status = body?.status === 'draft' ? 'draft' : 'published';
    const payload: BlogPostsStoreFile = {
      version: 1,
      status,
      updatedAt: new Date().toISOString(),
      posts,
    };

    const dir = path.join(process.cwd(), 'public', 'blog-posts');
    await fs.mkdir(dir, { recursive: true });
    const filepath = blogPostsFilePath(locale);
    await fs.writeFile(filepath, JSON.stringify(payload, null, 2), 'utf-8');

    let _sync: { git: 'ok' | 'skipped' | 'failed'; message?: string } = { git: 'skipped' };

    if (shouldGitPushAfterSave({ status })) {
      try {
        await commitAndPushGitFiles([relativeRepoPath(filepath)], `Editor: blog posts ${locale}`);
        _sync = { git: 'ok' };
      } catch (error) {
        console.error('Git sync failed (blog-posts):', error);
        _sync = { git: 'failed', message: error instanceof Error ? error.message : String(error) };
      }
    }

    return NextResponse.json({ ...payload, _sync });
  } catch (error) {
    console.error('PUT blog-posts:', error);
    return NextResponse.json({ error: 'Erro ao guardar artigos do blog' }, { status: 500 });
  }
}
