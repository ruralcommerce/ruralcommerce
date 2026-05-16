import { promises as fs } from 'fs';
import path from 'path';
import { blogContent, getBlogLocaleKey, type BlogLocaleKey } from '@/lib/blog-defaults';
import {
  parseBlogPostsPayload,
  normalizeFeaturedFlags,
  type BlogPostRecord,
  type BlogPostsStoreFile,
} from '@/lib/blog-posts-shared';

export type { BlogPostGalleryItem, BlogPostRecord, BlogPostsStoreFile } from '@/lib/blog-posts-shared';
export {
  isValidBlogSlug,
  splitBlogBody,
  postsToCards,
  pickFeaturedPost,
  parseBlogPostsPayload,
  normalizeFeaturedFlags,
} from '@/lib/blog-posts-shared';

const BLOG_POSTS_DIR = path.join(process.cwd(), 'public', 'blog-posts');

const LEGACY_BLOG_GALLERY_BY_SLUG: Record<string, { type: 'image'; src: string; alt: string }[]> = {
  'japan-house-london-creativity': [
    { type: 'image', src: '/images/home/hero-1.png', alt: 'Featured field work' },
    { type: 'image', src: '/images/home/home-pic2.png', alt: 'Operations team' },
    { type: 'image', src: '/images/home/home-ils2.png', alt: 'Process illustration' },
  ],
  'helmut-lang-taxi-drivers': [{ type: 'image', src: '/images/home/home-pic2.png', alt: 'Field operations' }],
  'bowlcut-uk-legends': [{ type: 'image', src: '/images/home/home-ils2.png', alt: 'Editorial illustration' }],
  'andy-warhol-unseen-photos': [{ type: 'image', src: '/images/home/home-ils3.png', alt: 'Editorial composition' }],
  'vinka-iloris-storytelling-furniture': [{ type: 'image', src: '/images/home/home-pic2.png', alt: 'Design workflow' }],
  'broken-fingaz-u2-beck': [{ type: 'image', src: '/images/home/hero-1.png', alt: 'Production landscape' }],
  'suzanne-saroff-photographs': [{ type: 'image', src: '/images/home/home-ils2.png', alt: 'Architectural composition' }],
  'ani-jalasvinas-illustrations': [{ type: 'image', src: '/images/home/home-ils3.png', alt: 'Character illustration' }],
};

const DEFAULT_BODY: Record<BlogLocaleKey, string> = {
  es: [
    'Un análisis de contexto sobre cómo los ecosistemas productivos conectan territorio, gestión y mercado para capturar valor sostenible.',
    'El ecosistema rural atraviesa una etapa de transformación profunda. La digitalización de procesos y los nuevos modelos de distribución están cambiando la forma en que se organizan las cadenas productivas en el territorio.',
    'En este escenario, las iniciativas orientadas por datos y por inteligencia operativa se vuelven clave para aumentar productividad y reducir pérdidas. Más que tecnología aislada, se necesita capacidad de ejecución con foco en resultado real.',
    'Cuando convergen estrategia comercial, estándares de calidad y formación técnica, los activos del campo operan con mayor previsibilidad. Eso crea base para crecimiento sostenible y fortalece la conexión con compradores de mayor valor agregado.',
  ].join('\n\n'),
  'pt-BR': [
    'Uma análise de contexto sobre como ecossistemas produtivos conectam território, gestão e mercado para capturar valor sustentável.',
    'O ecossistema rural atravessa uma fase de transformação profunda. A digitalização de processos e os novos modelos de distribuição estão mudando a forma como as cadeias produtivas se organizam no território.',
    'Nesse cenário, iniciativas orientadas por dados e inteligência operacional se tornam decisivas para elevar produtividade e reduzir perdas. Mais do que tecnologia isolada, é necessária capacidade de execução com foco em resultado real.',
    'Quando estratégia comercial, padrões de qualidade e formação técnica convergem, os ativos do campo operam com maior previsibilidade. Isso cria base para crescimento sustentável e fortalece a conexão com compradores de maior valor agregado.',
  ].join('\n\n'),
  en: [
    'A contextual analysis of how productive ecosystems connect territory, management, and markets to capture sustainable value.',
    'Rural ecosystems are in a phase of deep transformation. Process digitization and new distribution models are reshaping how production chains are organized across territories.',
    'In this context, data-driven and operational-intelligence initiatives become essential to increase productivity and reduce losses. More than isolated technology, teams need consistent execution focused on real outcomes.',
    'When commercial strategy, quality standards, and technical training converge, field assets operate with greater predictability. This builds a foundation for sustainable growth and stronger access to higher-value buyers.',
  ].join('\n\n'),
};

function buildFallbackPosts(localeKey: BlogLocaleKey): BlogPostRecord[] {
  const c = blogContent[localeKey];
  const body = DEFAULT_BODY[localeKey];
  return normalizeFeaturedFlags(
    c.posts.map((row) => {
      const excerpt =
        row.slug === c.featured.slug
          ? c.featured.excerpt
          : row.title.length > 180
            ? `${row.title.slice(0, 177)}…`
            : row.title;
      return {
        slug: row.slug,
        title: row.title,
        category: row.category,
        author: row.author,
        coverImage: row.image,
        coverImageAlt: row.title,
        excerpt,
        body,
        gallery: LEGACY_BLOG_GALLERY_BY_SLUG[row.slug],
        featured: row.slug === c.featured.slug,
      };
    })
  );
}

export function blogPostsFilePath(locale: string): string {
  const key = getBlogLocaleKey(locale);
  return path.join(BLOG_POSTS_DIR, `posts.${key}.json`);
}

/** Reads `public/blog-posts/posts.{locale}.json`. Returns `null` if missing or invalid. */
export async function readBlogPostsFile(locale: string): Promise<BlogPostsStoreFile | null> {
  const fp = blogPostsFilePath(locale);
  try {
    const raw = await fs.readFile(fp, 'utf-8');
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, '')) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const posts = parseBlogPostsPayload(parsed);
    if (!posts) return null;
    const o = parsed as Record<string, unknown>;
    const status = o.status === 'draft' ? 'draft' : 'published';
    const version = typeof o.version === 'number' ? o.version : 1;
    const updatedAt = typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString();
    return { version, status, updatedAt, posts };
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') return null;
    console.error('readBlogPostsFile', e);
    return null;
  }
}

export async function getBlogPostsForLocale(locale: string): Promise<BlogPostRecord[]> {
  const file = await readBlogPostsFile(locale);
  if (file && file.posts.length > 0) return file.posts;
  return buildFallbackPosts(getBlogLocaleKey(locale));
}

export async function getBlogPostBySlug(locale: string, slug: string): Promise<BlogPostRecord | null> {
  const posts = await getBlogPostsForLocale(locale);
  return posts.find((p) => p.slug === slug) ?? null;
}
