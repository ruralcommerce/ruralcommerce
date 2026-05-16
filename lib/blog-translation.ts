import type { BlogPostRecord } from '@/lib/blog-posts-shared';
import type { TranslationChange } from '@/lib/translation-utils';

/** Objeto aninhado usado com `detectTextChanges` / API de tradução (caminhos tipo `blog.<slug>.title`). */
export function blogPostsToEnvelope(posts: BlogPostRecord[]): { blog: Record<string, Record<string, string>> } {
  const blog: Record<string, Record<string, string>> = {};
  for (const p of posts) {
    blog[p.slug] = {
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      author: p.author,
      coverImageAlt: p.coverImageAlt ?? '',
      ctaTitle: p.cta?.title ?? '',
      ctaBody: p.cta?.body ?? '',
      ctaButtonLabel: p.cta?.buttonLabel ?? '',
    };
  }
  return { blog };
}

function applyFlatField(post: BlogPostRecord, flatKey: string, value: string): BlogPostRecord {
  switch (flatKey) {
    case 'title':
      return { ...post, title: value };
    case 'excerpt':
      return { ...post, excerpt: value };
    case 'body':
      return { ...post, body: value };
    case 'category':
      return { ...post, category: value };
    case 'author':
      return { ...post, author: value };
    case 'coverImageAlt':
      return { ...post, coverImageAlt: value };
    case 'ctaTitle':
      return {
        ...post,
        cta: {
          ...post.cta,
          enabled: post.cta?.enabled,
          title: value,
          body: post.cta?.body,
          buttonLabel: post.cta?.buttonLabel,
          buttonHref: post.cta?.buttonHref,
        },
      };
    case 'ctaBody':
      return {
        ...post,
        cta: {
          ...post.cta,
          enabled: post.cta?.enabled,
          title: post.cta?.title,
          body: value,
          buttonLabel: post.cta?.buttonLabel,
          buttonHref: post.cta?.buttonHref,
        },
      };
    case 'ctaButtonLabel':
      return {
        ...post,
        cta: {
          ...post.cta,
          enabled: post.cta?.enabled,
          title: post.cta?.title,
          body: post.cta?.body,
          buttonLabel: value,
          buttonHref: post.cta?.buttonHref,
        },
      };
    default:
      return post;
  }
}

/**
 * Aplica mudanças aprovadas do modal de tradução ao payload do ficheiro de blog (`posts.*.json`).
 * `change.field` no formato `blog.<slug>.<campo>` onde `<campo>` é uma chave plana do envelope.
 */
export function applyApprovedBlogTranslations(
  store: { posts?: BlogPostRecord[]; status?: string; version?: number; updatedAt?: string },
  changes: TranslationChange[]
): { posts: BlogPostRecord[]; status: 'draft' | 'published'; version: number; updatedAt: string } {
  const posts = JSON.parse(JSON.stringify(store.posts ?? [])) as BlogPostRecord[];

  for (const ch of changes) {
    const parts = ch.field.split('.');
    if (parts.length < 3 || parts[0] !== 'blog') continue;
    const slug = parts[1];
    const flatKey = parts.slice(2).join('.');
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) continue;
    posts[idx] = applyFlatField(posts[idx], flatKey, ch.translatedText);
  }

  return {
    version: typeof store.version === 'number' ? store.version : 1,
    status: store.status === 'published' ? 'published' : 'draft',
    updatedAt: new Date().toISOString(),
    posts,
  };
}
