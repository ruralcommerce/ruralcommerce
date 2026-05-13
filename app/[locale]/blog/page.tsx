import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import Link from 'next/link';
import { getBlockProps, getManagedPageLayout, parseJsonArray, LayoutSearchParams } from '@/lib/page-layout-runtime';
import type { Metadata } from 'next';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const blogCopy = {
  es: {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription: 'Perspectivas y análisis sobre tecnología rural, sostenibilidad e innovación agroindustrial.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '#contacto' },
    ],
    featured: {
      slug: 'japan-house-london-creativity',
      image: '/images/home/hero-1.png',
      category: 'ILUSTRACIÓN',
      title: 'JAPAN HOUSE ABRE EN LONDRES PARA IMPULSAR LA CREATIVIDAD JAPONESA EN EL REINO UNIDO',
      excerpt:
        'Una mirada sobre cómo los ecosistemas creativos conectan cultura, territorio e innovación para abrir nuevas oportunidades de mercado.',
      author: 'POR RETA TORPHY',
    },
    posts: [
      {
        slug: 'japan-house-london-creativity',
        image: '/images/home/hero-1.png',
        category: 'ILUSTRACIÓN',
        title: 'JAPAN HOUSE ABRE EN LONDRES PARA IMPULSAR LA CREATIVIDAD JAPONESA EN EL REINO UNIDO',
        author: 'POR RETA TORPHY',
      },
      {
        slug: 'helmut-lang-taxi-drivers',
        image: '/images/home/home-pic2.png',
        category: 'FOTOGRAFÍA',
        title: 'HELMUT LANG CELEBRA A TAXISTAS DE TODO EL MUNDO EN SU NUEVA CAMPAÑA',
        author: 'POR ALESSANDRA ORTIZ',
      },
      {
        slug: 'bowlcut-uk-legends',
        image: '/images/home/home-ils2.png',
        category: 'FOTOGRAFÍA',
        title: 'BOWLCUT LANZA SU NUEVA COLECCIÓN DE VERANO EN HOMENAJE A LEYENDAS DEL REINO UNIDO',
        author: 'POR ROSANNA ONDRICKA',
      },
      {
        slug: 'andy-warhol-unseen-photos',
        image: '/images/home/home-ils3.png',
        category: 'FOTOGRAFÍA',
        title: 'MILES DE FOTOS INÉDITAS DE ANDY WARHOL SERÁN PUBLICADAS ESTE OTOÑO',
        author: 'POR ANNIE LUELWITZ',
      },
      {
        slug: 'vinka-iloris-storytelling-furniture',
        image: '/images/home/home-pic2.png',
        category: 'DISEÑO INTERACTIVO',
        title: 'VINKA ILORIS, DESDE LONDRES, CREA MOBILIARIO CON ENFOQUE NARRATIVO',
        author: 'POR ANNIE LUELWITZ',
      },
      {
        slug: 'broken-fingaz-u2-beck',
        image: '/images/home/hero-1.png',
        category: 'DISEÑO GRÁFICO',
        title: 'EL COLECTIVO BROKEN FINGAZ DIRIGE VIDEO MUSICAL PARA U2 Y BECK',
        author: 'POR SIMEON BREKKE',
      },
      {
        slug: 'suzanne-saroff-photographs',
        image: '/images/home/home-ils2.png',
        category: 'ARQUITECTURA',
        title: 'LAS FOTOGRAFÍAS METICULOSAMENTE COMPUESTAS DE SUZANNE SAROFF ALTERAN LA PERCEPCIÓN',
        author: 'POR SIMEON BREKKE',
      },
      {
        slug: 'ani-jalasvinas-illustrations',
        image: '/images/home/home-ils3.png',
        category: 'DISEÑO GRÁFICO',
        title: 'LAS ILUSTRACIONES DE ANI JALASVINAS CELEBRAN LA CULTURA CLUB Y LOS CUERPOS REALES',
        author: 'POR ANNIE LUELWITZ',
      },
    ],
    featuredImageAlt: 'Publicación destacada',
  },
  'pt-BR': {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription: 'Perspectivas e análises sobre tecnologia rural, sustentabilidade e inovação no agro.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Aliados e Investidores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '#contacto' },
    ],
    featured: {
      slug: 'japan-house-london-creativity',
      image: '/images/home/hero-1.png',
      category: 'ILUSTRAÇÃO',
      title: 'JAPAN HOUSE ABRE EM LONDRES PARA IMPULSIONAR A CRIATIVIDADE JAPONESA NO REINO UNIDO',
      excerpt:
        'Um olhar sobre como ecossistemas criativos conectam cultura, território e inovação para abrir novas oportunidades de mercado.',
      author: 'POR RETA TORPHY',
    },
    posts: [
      {
        slug: 'japan-house-london-creativity',
        image: '/images/home/hero-1.png',
        category: 'ILUSTRAÇÃO',
        title: 'JAPAN HOUSE ABRE EM LONDRES PARA IMPULSIONAR A CRIATIVIDADE JAPONESA NO REINO UNIDO',
        author: 'POR RETA TORPHY',
      },
      {
        slug: 'helmut-lang-taxi-drivers',
        image: '/images/home/home-pic2.png',
        category: 'FOTOGRAFIA',
        title: 'HELMUT LANG CELEBRA TAXISTAS DO MUNDO TODO EM SUA NOVA CAMPANHA',
        author: 'POR ALESSANDRA ORTIZ',
      },
      {
        slug: 'bowlcut-uk-legends',
        image: '/images/home/home-ils2.png',
        category: 'FOTOGRAFIA',
        title: 'BOWLCUT LANÇA NOVA COLEÇÃO DE VERÃO EM HOMENAGEM A LENDAS DO REINO UNIDO',
        author: 'POR ROSANNA ONDRICKA',
      },
      {
        slug: 'andy-warhol-unseen-photos',
        image: '/images/home/home-ils3.png',
        category: 'FOTOGRAFIA',
        title: 'MILHARES DE FOTOS INÉDITAS DE ANDY WARHOL SERÃO PUBLICADAS NESTE OUTONO',
        author: 'POR ANNIE LUELWITZ',
      },
      {
        slug: 'vinka-iloris-storytelling-furniture',
        image: '/images/home/home-pic2.png',
        category: 'DESIGN INTERATIVO',
        title: 'VINKA ILORIS, DE LONDRES, CRIA MOBILIÁRIO COM ABORDAGEM NARRATIVA',
        author: 'POR ANNIE LUELWITZ',
      },
      {
        slug: 'broken-fingaz-u2-beck',
        image: '/images/home/hero-1.png',
        category: 'DESIGN GRÁFICO',
        title: 'O COLETIVO BROKEN FINGAZ DIRIGE CLIPE PARA U2 E BECK',
        author: 'POR SIMEON BREKKE',
      },
      {
        slug: 'suzanne-saroff-photographs',
        image: '/images/home/home-ils2.png',
        category: 'ARQUITETURA',
        title: 'AS FOTOGRAFIAS METICULOSAS DE SUZANNE SAROFF ALTERAM A PERCEPÇÃO',
        author: 'POR SIMEON BREKKE',
      },
      {
        slug: 'ani-jalasvinas-illustrations',
        image: '/images/home/home-ils3.png',
        category: 'DESIGN GRÁFICO',
        title: 'AS ILUSTRAÇÕES DE ANI JALASVINAS CELEBRAM CULTURA CLUB E CORPOS REAIS',
        author: 'POR ANNIE LUELWITZ',
      },
    ],
    featuredImageAlt: 'Publicação em destaque',
  },
  en: {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription: 'Insights and analysis on rural technology, sustainability, and agribusiness innovation.',
    navItems: [
      { label: 'About', href: '/sobre' },
      { label: 'Solutions', href: '/solucoes' },
      { label: 'Partners & Investors', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '#contacto' },
    ],
    featured: {
      slug: 'japan-house-london-creativity',
      image: '/images/home/hero-1.png',
      category: 'ILLUSTRATION',
      title: 'JAPAN HOUSE OPENS IN LONDON TO FOSTER JAPANESE CREATIVITY IN THE UK',
      excerpt:
        'A look at how creative ecosystems connect culture, territory, and innovation to unlock new market opportunities.',
      author: 'BY RETA TORPHY',
    },
    posts: [
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
        title: 'BOWLCUT LAUNCHES A SUMMER COLLECTION THAT PAYS HOMAGE TO UK LEGENDS',
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
        title: 'LONDON-BASED VINKA ILORIS BUILDS STORYTELLING FURNITURE',
        author: 'BY ANNIE LUELWITZ',
      },
      {
        slug: 'broken-fingaz-u2-beck',
        image: '/images/home/hero-1.png',
        category: 'GRAPHIC DESIGN',
        title: 'ANONYMOUS ART COLLECTIVE BROKEN FINGAZ DIRECTS MUSIC VIDEO FOR U2 AND BECK',
        author: 'BY SIMEON BREKKE',
      },
      {
        slug: 'suzanne-saroff-photographs',
        image: '/images/home/home-ils2.png',
        category: 'ARCHITECTURE',
        title: 'SUZANNE SAROFF\'S METICULOUSLY ARRANGED PHOTOGRAPHS ALTER PERCEPTIONS',
        author: 'BY SIMEON BREKKE',
      },
      {
        slug: 'ani-jalasvinas-illustrations',
        image: '/images/home/home-ils3.png',
        category: 'GRAPHIC DESIGN',
        title: 'ANI JALASVINAS\' PLAYFUL ILLUSTRATIONS CELEBRATE CLUB CULTURE AND BODILY DIVERSITY',
        author: 'BY ANNIE LUELWITZ',
      },
    ],
    featuredImageAlt: 'Featured post',
  },
} as const;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const copy = blogCopy[getLocaleKey(params.locale)];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: LayoutSearchParams;
}) {
  const locale = getLocaleKey(params.locale);
  const blogBasePath = `/${params.locale}/blog`;
  const copy = blogCopy[locale];
  const featuredPost = copy.featured;
  const blogPosts = copy.posts;
  const siteLayout = await getManagedPageLayout('homepage', searchParams, params.locale);
  const headerProps = getBlockProps(siteLayout, 'site-header');
  const footerProps = getBlockProps(siteLayout, 'site-footer');
  const headerNavItems = parseJsonArray<{ label: string; href: string }>(headerProps.navItemsJson, copy.navItems as { label: string; href: string }[]);
  const footerLinks = parseJsonArray<{ group: string; items: { label: string; href: string }[] }>(footerProps.footerLinksJson, []);
  const socialLinks = parseJsonArray<{ label: string; href: string }>(footerProps.socialLinksJson, []);

  return (
    <div className="flex min-h-screen flex-col">
      <RuralCommerceHeader navItems={headerNavItems} logoAlt={String(headerProps.logoAlt || 'Rural Commerce Logo')} />

      <main>
        {/* Blog main block: asymmetric layout */}
        <section data-editor-section="hero-section" className="bg-white pt-16 pb-6 sm:pt-20 sm:pb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 lg:pt-14">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Featured image on the left - 60% */}
              <Link
                href={`${blogBasePath}/${featuredPost.slug}`}
                className="w-full lg:w-3/5 h-[280px] sm:h-[340px] lg:h-[380px] overflow-hidden flex-shrink-0 block"
              >
                <img
                  src={featuredPost.image}
                  alt={copy.featuredImageAlt}
                  className="h-full w-full object-cover"
                />
              </Link>
              {/* Featured text on the right - 40% */}
              <Link href={`${blogBasePath}/${featuredPost.slug}`} className="w-full lg:w-2/5 flex flex-col">
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

        {/* Posts grid */}
        <section data-editor-section="segments-section" className="bg-white pt-4 pb-16 sm:pt-6 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`${blogBasePath}/${post.slug}`} className="flex flex-col">
                  {/* Image without rounded corners */}
                  <div className="w-full h-40 overflow-hidden mb-4">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                  {/* Content */}
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
        copyright={String(footerProps.copyright || `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`)}
        contactTitle={String(footerProps.contactTitle || 'Contacto')}
        contactAddress={String(footerProps.contactAddress || 'Uruguay - dirección comercial (completar)')}
        contactPhone={String(footerProps.contactPhone || '+598 - - - - -')}
        contactEmail={String(footerProps.contactEmail || 'contacto@ruralcommerce.com')}
        socialLabel={String(footerProps.socialLabel || 'Redes sociales')}
        footerLinks={footerLinks}
        socialLinks={socialLinks}
        locale={params.locale}
      />
    </div>
  );
}

