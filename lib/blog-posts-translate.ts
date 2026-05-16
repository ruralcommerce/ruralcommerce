import { translateTextBetween } from '@/lib/translation-server';
import type { BlogPostRecord } from '@/lib/blog-posts-shared';
import { normalizeFeaturedFlags } from '@/lib/blog-posts-shared';

const APP_LOCALES = new Set(['es', 'pt-BR', 'en']);

export function assertBlogLocale(locale: string): locale is 'es' | 'pt-BR' | 'en' {
  return APP_LOCALES.has(locale);
}

function shouldFill(mode: 'missing' | 'all', current: string | undefined): boolean {
  if (mode === 'all') return true;
  return !current || !String(current).trim();
}

function shellFromSource(src: BlogPostRecord): BlogPostRecord {
  return {
    ...src,
    title: '',
    excerpt: '',
    body: '',
    category: '',
    author: '',
    coverImageAlt: '',
    cta: src.cta
      ? {
          enabled: src.cta.enabled,
          title: '',
          body: '',
          buttonLabel: '',
          buttonHref: src.cta.buttonHref,
        }
      : undefined,
  };
}

async function translateField(
  text: string,
  fromLocale: string,
  toLocale: string,
  mode: 'missing' | 'all',
  existing: string | undefined
): Promise<string> {
  if (!shouldFill(mode, existing)) return String(existing ?? '');
  if (!text || !text.trim()) return '';
  return translateTextBetween(text, fromLocale, toLocale);
}

/**
 * Constrói lista de posts no idioma alvo a partir do source, traduzindo campos de texto.
 */
export async function mergeAndTranslateBlogPosts(
  sourcePosts: BlogPostRecord[],
  existingTargetPosts: BlogPostRecord[] | null,
  sourceLocale: string,
  targetLocale: string,
  mode: 'missing' | 'all'
): Promise<BlogPostRecord[]> {
  const map = new Map((existingTargetPosts ?? []).map((p) => [p.slug, p]));
  const out: BlogPostRecord[] = [];

  for (const src of sourcePosts) {
    const prev = map.get(src.slug);
    const base: BlogPostRecord = prev ? JSON.parse(JSON.stringify(prev)) : shellFromSource(src);

    base.slug = src.slug;
    base.coverImage = src.coverImage;
    base.gallery = src.gallery ? JSON.parse(JSON.stringify(src.gallery)) : src.gallery;
    base.featured = src.featured;
    base.publishedAt = base.publishedAt ?? src.publishedAt;

    base.title = await translateField(src.title, sourceLocale, targetLocale, mode, prev?.title);
    base.excerpt = await translateField(src.excerpt, sourceLocale, targetLocale, mode, prev?.excerpt);
    base.body = await translateField(src.body, sourceLocale, targetLocale, mode, prev?.body);
    base.category = await translateField(src.category, sourceLocale, targetLocale, mode, prev?.category);
    base.author = await translateField(src.author, sourceLocale, targetLocale, mode, prev?.author);
    base.coverImageAlt = await translateField(
      src.coverImageAlt || src.title,
      sourceLocale,
      targetLocale,
      mode,
      prev?.coverImageAlt
    );

    if (src.cta?.enabled || (src.cta?.title || src.cta?.body || src.cta?.buttonLabel)) {
      const pCta = prev?.cta;
      const sCta = src.cta;
      base.cta = {
        enabled: sCta?.enabled ?? pCta?.enabled ?? false,
        buttonHref: sCta?.buttonHref ?? pCta?.buttonHref,
        title: await translateField(sCta?.title ?? '', sourceLocale, targetLocale, mode, pCta?.title),
        body: await translateField(sCta?.body ?? '', sourceLocale, targetLocale, mode, pCta?.body),
        buttonLabel: await translateField(
          sCta?.buttonLabel ?? '',
          sourceLocale,
          targetLocale,
          mode,
          pCta?.buttonLabel
        ),
      };
    } else {
      base.cta = prev?.cta;
    }

    out.push(base);
  }

  return normalizeFeaturedFlags(out);
}
