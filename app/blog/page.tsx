import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import Link from 'next/link';
import { getBlockProps, getManagedPageLayout, parseJsonArray, LayoutSearchParams } from '@/lib/page-layout-runtime';

export const metadata = {
  title: 'Blog — Rural Commerce',
  description: 'Perspectivas e análises sobre tecnologia rural, sustentabilidade e inovação no agronegócio.',
};

const featuredPost = {
  slug: 'japan-house-london-creativity',
  image: '/images/home/hero-1.png',
  category: 'ILUSTRAÇÃO',
  title: 'JAPAN HOUSE OPENS IN LONDON TO FOSTER JAPANESE CREATIVITY IN THE UK',
  excerpt:
    'Enim omittam qui id, ex quo atqui dictas complectitur. Nec ad timeam accusata, hinc justo falli id eum, ferri novum molestie eos cu.',
  author: 'BY RETA TORPHY',
};

const blogPosts = [
  {
    slug: 'japan-house-london-creativity',
    image: '/images/home/hero-1.png',
    category: 'ILLUSTRATION',
    title: 'JAPAN HOUSE OPENS IN LONDON TO FOSTER JAPANESE CREATIVITY IN THE UK',
    author: 'BY RETA TORPHY',
  },
  {
    slug: 'helmut-lang-taxi-drivers',
    image: '/images/home/home-pic2.png',
    category: 'PHOTOGRAPHY',
    title: 'HELMUT LANG CELEBRATES TAXI DRIVERS WORLDWIDE IN LATEST CAMPAIGN',
    author: 'BY ALESSANDRA ORTIZ',
  },
  {
    slug: 'bowlcut-uk-legends',
    image: '/images/home/home-ils2.png',
    category: 'PHOTOGRAPHY',
    title: 'BOWLCUT LAUNCH A NEW SUMMER COLLECTION THAT PAYS HOMAGE TO "UK LEGENDS"',
    author: 'BY ROSANNA ONDRICKA',
  },
  {
    slug: 'andy-warhol-unseen-photos',
    image: '/images/home/home-ils3.png',
    category: 'PHOTOGRAPHY',
    title: 'THOUSANDS OF PREVIOUSLY UNSEEN PHOTOGRAPHS BY ANDY WARHOL WILL BE MADE PUBLIC THIS AUTUMN',
    author: 'BY ANNIE LUELWITZ',
  },
  {
    slug: 'vinka-iloris-storytelling-furniture',
    image: '/images/home/home-pic2.png',
    category: 'INTERACTIVE DESIGN',
    title: 'LONDON-BASED VINKA ILORIS STORY TELLING FURNITURE',
    author: 'BY ANNIE LUELWITZ',
  },
  {
    slug: 'broken-fingaz-u2-beck',
    image: '/images/home/hero-1.png',
    category: 'GRAPHIC DESIGN',
    title: 'ANONYMOUS ISRAELI ART COLLECTIVE BROKEN FINGAZ DIRECT MUSIC VIDEO FOR U2 AND BECK',
    author: 'BY SIMEON BREKKE',
  },
  {
    slug: 'suzanne-saroff-photographs',
    image: '/images/home/home-ils2.png',
    category: 'ARCHITECTURE',
    title: 'SUZANNE SAROFFS METICULOUSLY ARRANGED PHOTOGRAPHS ALTER PERCEPTIONS',
    author: 'BY SIMEON BREKKE',
  },
  {
    slug: 'ani-jalasvinas-illustrations',
    image: '/images/home/home-ils3.png',
    category: 'GRAPHIC DESIGN',
    title: 'ANI JALASVINAS PLAYFUL ILLUSTRATIONS CELEBRATE CLUB CULTURE, BROWN BODIES AND PERFECT PAUNCHES',
    author: 'BY ANNIE LUELWITZ',
  },
] as const;

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: LayoutSearchParams;
}) {
  const siteLayout = await getManagedPageLayout('homepage', searchParams);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(headerProps.navItemsJson, [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Soluções', href: '/solucoes' },
    { label: 'Aliados e Inversores', href: '/aliados' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '#contacto' },
  ]);
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(footerProps.footerLinksJson, []);
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main>
        {/* ── Bloco principal do blog: layout assimétrico ── */}
        <section data-editor-section="hero-section" className="bg-white pt-16 pb-6 sm:pt-20 sm:pb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 lg:pt-14">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Imagem destaque à esquerda - 60% */}
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="w-full lg:w-3/5 h-[280px] sm:h-[340px] lg:h-[380px] overflow-hidden flex-shrink-0 block"
              >
                <img
                  src={featuredPost.image}
                  alt="Destaque"
                  className="h-full w-full object-cover"
                />
              </Link>
              {/* Texto destaque à direita - 40% */}
              <Link href={`/blog/${featuredPost.slug}`} className="w-full lg:w-2/5 flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{featuredPost.category}</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#181818] leading-tight mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  {featuredPost.excerpt}
                </p>
                <span className="text-xs font-semibold text-gray-600">{featuredPost.author}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bloco de posts em grid ──────────────────────── */}
        <section data-editor-section="segments-section" className="bg-white pt-4 pb-16 sm:pt-6 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="flex flex-col">
                  {/* Imagem sem arredondamento */}
                  <div className="w-full h-40 overflow-hidden mb-4">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                  {/* Conteúdo */}
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                    {post.category}
                  </p>
                  <h3 className="text-sm font-bold leading-tight text-[#181818] mb-3">
                    {post.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600">
                    {post.author}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <RuralCommerceFooter
        title={String(footerProps.title || 'Rural Commerce')}
        copyright={String(footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} — Todos os direitos reservados`)}
        contactTitle={String(footerProps.contactTitle || 'Contato')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay — endereço comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 · · · · ·')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociais')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
      />
    </div>
  );
}
