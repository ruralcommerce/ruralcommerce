import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getBlogLocaleKey } from '@/lib/blog-defaults';
import {
  blogPostsFilePath,
  getBlogPostsForLocale,
  readBlogPostsFile,
  type BlogPostsStoreFile,
} from '@/lib/blog-posts';
import { assertBlogLocale, mergeAndTranslateBlogPosts } from '@/lib/blog-posts-translate';
import { commitAndPushGitFiles, shouldGitPushAfterSave } from '@/lib/git-utils';

export const dynamic = 'force-dynamic';

function relativeRepoPath(absPath: string): string {
  return path.relative(process.cwd(), absPath).split(path.sep).join('/');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sourceLocaleRaw = typeof body.sourceLocale === 'string' ? body.sourceLocale.trim() : 'es';
    const targetLocales = Array.isArray(body.targetLocales)
      ? body.targetLocales.filter((x: unknown) => typeof x === 'string')
      : [];
    const mode = body.mode === 'all' ? 'all' : 'missing';
    const slugsFilter =
      Array.isArray(body.slugs) && body.slugs.every((x: unknown) => typeof x === 'string')
        ? (body.slugs as string[])
        : null;

    const sourceKey = getBlogLocaleKey(sourceLocaleRaw);
    if (!assertBlogLocale(sourceKey)) {
      return NextResponse.json({ error: 'sourceLocale inválido' }, { status: 400 });
    }

    let sourcePosts = await getBlogPostsForLocale(sourceLocaleRaw);
    if (slugsFilter && slugsFilter.length > 0) {
      const set = new Set(slugsFilter);
      sourcePosts = sourcePosts.filter((p) => set.has(p.slug));
    }
    if (sourcePosts.length === 0) {
      return NextResponse.json({ error: 'Nenhum artigo para traduzir' }, { status: 400 });
    }

    const normalizedTargets = targetLocales
      .map((t: string) => getBlogLocaleKey(t))
      .filter((t: string) => assertBlogLocale(t) && t !== sourceKey);

    if (normalizedTargets.length === 0) {
      return NextResponse.json(
        { error: 'Defina pelo menos um idioma alvo diferente do source.' },
        { status: 400 }
      );
    }

    const results: {
      locale: string;
      path: string;
      postsCount: number;
      _sync: { git: 'ok' | 'skipped' | 'failed'; message?: string };
    }[] = [];

    for (const targetKey of normalizedTargets) {
      const existingFile = await readBlogPostsFile(targetKey);
      const existingPosts = existingFile?.posts ?? null;

      const merged = await mergeAndTranslateBlogPosts(
        sourcePosts,
        existingPosts,
        sourceKey,
        targetKey,
        mode
      );

      const payload: BlogPostsStoreFile = {
        version: 1,
        status: 'draft',
        updatedAt: new Date().toISOString(),
        posts: merged,
      };

      const dir = path.join(process.cwd(), 'public', 'blog-posts');
      await fs.mkdir(dir, { recursive: true });
      const filepath = blogPostsFilePath(targetKey);
      await fs.writeFile(filepath, JSON.stringify(payload, null, 2), 'utf-8');

      let _sync: { git: 'ok' | 'skipped' | 'failed'; message?: string } = { git: 'skipped' };
      if (shouldGitPushAfterSave({ status: 'draft' })) {
        try {
          await commitAndPushGitFiles(
            [relativeRepoPath(filepath)],
            `Editor: blog translate ${sourceKey}→${targetKey}`
          );
          _sync = { git: 'ok' };
        } catch (error) {
          console.error('Git sync failed (translate-blog-posts):', error);
          _sync = { git: 'failed', message: error instanceof Error ? error.message : String(error) };
        }
      }

      results.push({ locale: targetKey, path: relativeRepoPath(filepath), postsCount: merged.length, _sync });
    }

    return NextResponse.json({
      ok: true,
      sourceLocale: sourceKey,
      mode,
      results,
    });
  } catch (error) {
    console.error('POST translate-blog-posts:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao traduzir blog';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
