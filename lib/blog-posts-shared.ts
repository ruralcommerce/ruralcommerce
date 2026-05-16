import type { BlogPostCard } from '@/components/BlogPageBlocks';

export type BlogPostGalleryItem = { type: 'image' | 'video'; src: string; alt?: string };

export type BlogPostCta = {
  enabled?: boolean;
  title?: string;
  /** Texto do banner (sem HTML por defeito). */
  body?: string;
  buttonLabel?: string;
  /** Path interno (ex: `/contacto`, `/solucoes`) ou URL completa. */
  buttonHref?: string;
};

export type BlogPostRecord = {
  slug: string;
  title: string;
  category: string;
  author: string;
  coverImage: string;
  coverImageAlt?: string;
  excerpt: string;
  /** HTML do corpo (editor rico); texto plano antigo é convertido na página. */
  body: string;
  gallery?: BlogPostGalleryItem[];
  featured?: boolean;
  publishedAt?: string;
  cta?: BlogPostCta;
};

export type BlogPostsStoreFile = {
  version: number;
  status: 'draft' | 'published';
  updatedAt: string;
  posts: BlogPostRecord[];
};

export function isValidBlogSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

export function splitBlogBody(body: string): string[] {
  const t = body.trim();
  if (!t) return [];
  return t
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function postsToCards(posts: BlogPostRecord[]): BlogPostCard[] {
  return posts.map((p) => ({
    slug: p.slug,
    image: p.coverImage,
    category: p.category,
    title: p.title,
    author: p.author,
  }));
}

export function pickFeaturedPost(posts: BlogPostRecord[]): BlogPostRecord | null {
  if (!posts.length) return null;
  const f = posts.find((p) => p.featured);
  return f ?? posts[0] ?? null;
}

export function normalizeFeaturedFlags(posts: BlogPostRecord[]): BlogPostRecord[] {
  const idx = posts.findIndex((p) => p.featured);
  if (posts.length === 0) return posts;
  if (idx === -1) {
    return posts.map((p, i) => ({ ...p, featured: i === 0 }));
  }
  return posts.map((p, i) => ({ ...p, featured: i === idx }));
}

function coercePost(raw: unknown): BlogPostRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const slug = typeof o.slug === 'string' ? o.slug.trim() : '';
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const category = typeof o.category === 'string' ? o.category.trim() : '';
  const author = typeof o.author === 'string' ? o.author.trim() : '';
  const coverImage = typeof o.coverImage === 'string' ? o.coverImage.trim() : '';
  const excerpt = typeof o.excerpt === 'string' ? o.excerpt.trim() : '';
  const body = typeof o.body === 'string' ? o.body : '';
  if (!isValidBlogSlug(slug) || !title || !coverImage) return null;

  let gallery: BlogPostGalleryItem[] | undefined;
  if (Array.isArray(o.gallery)) {
    gallery = o.gallery
      .map((g): BlogPostGalleryItem | null => {
        if (!g || typeof g !== 'object') return null;
        const gi = g as Record<string, unknown>;
        const type = gi.type === 'video' ? 'video' : 'image';
        const src = typeof gi.src === 'string' ? gi.src.trim() : '';
        if (!src) return null;
        const alt = typeof gi.alt === 'string' ? gi.alt : undefined;
        return { type, src, alt };
      })
      .filter((x): x is BlogPostGalleryItem => x !== null);
    if (gallery.length === 0) gallery = undefined;
  }

  let cta: BlogPostCta | undefined;
  if (o.cta && typeof o.cta === 'object') {
    const c = o.cta as Record<string, unknown>;
    cta = {
      enabled: Boolean(c.enabled),
      title: typeof c.title === 'string' ? c.title : '',
      body: typeof c.body === 'string' ? c.body : '',
      buttonLabel: typeof c.buttonLabel === 'string' ? c.buttonLabel : '',
      buttonHref: typeof c.buttonHref === 'string' ? c.buttonHref : '',
    };
    if (!cta.title && !cta.body && !cta.buttonLabel && !cta.buttonHref && !cta.enabled) {
      cta = undefined;
    }
  }

  return {
    slug,
    title,
    category,
    author,
    coverImage,
    coverImageAlt: typeof o.coverImageAlt === 'string' ? o.coverImageAlt : undefined,
    excerpt,
    body,
    gallery,
    featured: Boolean(o.featured),
    publishedAt: typeof o.publishedAt === 'string' ? o.publishedAt : undefined,
    cta,
  };
}

export function parseBlogPostsPayload(raw: unknown): BlogPostRecord[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const postsRaw = (raw as { posts?: unknown }).posts;
  if (!Array.isArray(postsRaw)) return null;
  const posts = postsRaw.map(coercePost).filter((p): p is BlogPostRecord => p !== null);
  const slugs = new Set<string>();
  for (const p of posts) {
    if (slugs.has(p.slug)) return null;
    slugs.add(p.slug);
  }
  return normalizeFeaturedFlags(posts);
}
