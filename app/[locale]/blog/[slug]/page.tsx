import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { BlogMediaCarousel } from '@/components/BlogMediaCarousel';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const posts = [
  {
    slug: 'japan-house-london-creativity',
    media: [
      { type: 'image' as const, src: '/images/home/hero-1.png', alt: 'Featured field work' },
      { type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Operations team' },
      { type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Process illustration' },
    ],
  },
  {
    slug: 'helmut-lang-taxi-drivers',
    media: [{ type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Field operations' }],
  },
  {
    slug: 'bowlcut-uk-legends',
    media: [{ type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Editorial illustration' }],
  },
  {
    slug: 'andy-warhol-unseen-photos',
    media: [{ type: 'image' as const, src: '/images/home/home-ils3.png', alt: 'Editorial composition' }],
  },
  {
    slug: 'vinka-iloris-storytelling-furniture',
    media: [{ type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Design workflow' }],
  },
  {
    slug: 'broken-fingaz-u2-beck',
    media: [{ type: 'image' as const, src: '/images/home/hero-1.png', alt: 'Production landscape' }],
  },
  {
    slug: 'suzanne-saroff-photographs',
    media: [{ type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Architectural composition' }],
  },
  {
    slug: 'ani-jalasvinas-illustrations',
    media: [{ type: 'image' as const, src: '/images/home/home-ils3.png', alt: 'Character illustration' }],
  },
] as const;

type PostSlug = (typeof posts)[number]['slug'];

type PostMeta = {
  category: string;
  title: string;
  author: string;
};

const postMetaByLocale: Record<LocaleKey, Record<PostSlug, PostMeta>> = {
  es: {
    'japan-house-london-creativity': {
      category: 'ILUSTRACION',
      title: 'JAPAN HOUSE ABRE EN LONDRES PARA IMPULSAR LA CREATIVIDAD JAPONESA EN EL REINO UNIDO',
      author: 'POR RETA TORPHY',
    },
    'helmut-lang-taxi-drivers': {
      category: 'FOTOGRAFIA',
      title: 'HELMUT LANG CELEBRA A TAXISTAS DE TODO EL MUNDO EN SU NUEVA CAMPANA',
      author: 'POR ALESSANDRA ORTIZ',
    },
    'bowlcut-uk-legends': {
      category: 'FOTOGRAFIA',
      title: 'BOWLCUT LANZA SU NUEVA COLECCION DE VERANO EN HOMENAJE A LEYENDAS DEL REINO UNIDO',
      author: 'POR ROSANNA ONDRICKA',
    },
    'andy-warhol-unseen-photos': {
      category: 'FOTOGRAFIA',
      title: 'MILES DE FOTOS INEDITAS DE ANDY WARHOL SERAN PUBLICADAS ESTE OTONO',
      author: 'POR ANNIE LUELWITZ',
    },
    'vinka-iloris-storytelling-furniture': {
      category: 'DISENO INTERACTIVO',
      title: 'VINKA ILORIS, DESDE LONDRES, CREA MOBILIARIO CON ENFOQUE NARRATIVO',
      author: 'POR ANNIE LUELWITZ',
    },
    'broken-fingaz-u2-beck': {
      category: 'DISENO GRAFICO',
      title: 'EL COLECTIVO BROKEN FINGAZ DIRIGE VIDEO MUSICAL PARA U2 Y BECK',
      author: 'POR SIMEON BREKKE',
    },
    'suzanne-saroff-photographs': {
      category: 'ARQUITECTURA',
      title: 'LAS FOTOGRAFIAS DE SUZANNE SAROFF ALTERAN LA PERCEPCION',
      author: 'POR SIMEON BREKKE',
    },
    'ani-jalasvinas-illustrations': {
      category: 'DISENO GRAFICO',
      title: 'LAS ILUSTRACIONES DE ANI JALASVINAS CELEBRAN CULTURA CLUB Y CUERPOS REALES',
      author: 'POR ANNIE LUELWITZ',
    },
  },
  'pt-BR': {
    'japan-house-london-creativity': {
      category: 'ILUSTRACAO',
      title: 'JAPAN HOUSE ABRE EM LONDRES PARA IMPULSIONAR A CRIATIVIDADE JAPONESA NO REINO UNIDO',
      author: 'POR RETA TORPHY',
    },
    'helmut-lang-taxi-drivers': {
      category: 'FOTOGRAFIA',
      title: 'HELMUT LANG CELEBRA TAXISTAS DO MUNDO TODO EM SUA NOVA CAMPANHA',
      author: 'POR ALESSANDRA ORTIZ',
    },
    'bowlcut-uk-legends': {
      category: 'FOTOGRAFIA',
      title: 'BOWLCUT LANCA NOVA COLECAO DE VERAO EM HOMENAGEM A LENDAS DO REINO UNIDO',
      author: 'POR ROSANNA ONDRICKA',
    },
    'andy-warhol-unseen-photos': {
      category: 'FOTOGRAFIA',
      title: 'MILHARES DE FOTOS INEDITAS DE ANDY WARHOL SERAO PUBLICADAS NESTE OUTONO',
      author: 'POR ANNIE LUELWITZ',
    },
    'vinka-iloris-storytelling-furniture': {
      category: 'DESIGN INTERATIVO',
      title: 'VINKA ILORIS, DE LONDRES, CRIA MOBILIARIO COM ABORDAGEM NARRATIVA',
      author: 'POR ANNIE LUELWITZ',
    },
    'broken-fingaz-u2-beck': {
      category: 'DESIGN GRAFICO',
      title: 'O COLETIVO BROKEN FINGAZ DIRIGE CLIPE PARA U2 E BECK',
      author: 'POR SIMEON BREKKE',
    },
    'suzanne-saroff-photographs': {
      category: 'ARQUITETURA',
      title: 'AS FOTOGRAFIAS DE SUZANNE SAROFF ALTERAM A PERCEPCAO',
      author: 'POR SIMEON BREKKE',
    },
    'ani-jalasvinas-illustrations': {
      category: 'DESIGN GRAFICO',
      title: 'AS ILUSTRACOES DE ANI JALASVINAS CELEBRAM CULTURA CLUB E CORPOS REAIS',
      author: 'POR ANNIE LUELWITZ',
    },
  },
  en: {
    'japan-house-london-creativity': {
      category: 'ILLUSTRATION',
      title: 'JAPAN HOUSE OPENS IN LONDON TO FOSTER JAPANESE CREATIVITY IN THE UK',
      author: 'BY RETA TORPHY',
    },
    'helmut-lang-taxi-drivers': {
      category: 'PHOTOGRAPHY',
      title: 'HELMUT LANG CELEBRATES TAXI DRIVERS WORLDWIDE IN LATEST CAMPAIGN',
      author: 'BY ALESSANDRA ORTIZ',
    },
    'bowlcut-uk-legends': {
      category: 'PHOTOGRAPHY',
      title: 'BOWLCUT LAUNCHES A SUMMER COLLECTION THAT PAYS HOMAGE TO UK LEGENDS',
      author: 'BY ROSANNA ONDRICKA',
    },
    'andy-warhol-unseen-photos': {
      category: 'PHOTOGRAPHY',
      title: 'THOUSANDS OF PREVIOUSLY UNSEEN PHOTOGRAPHS BY ANDY WARHOL WILL BE MADE PUBLIC THIS AUTUMN',
      author: 'BY ANNIE LUELWITZ',
    },
    'vinka-iloris-storytelling-furniture': {
      category: 'INTERACTIVE DESIGN',
      title: 'LONDON-BASED VINKA ILORIS BUILDS STORYTELLING FURNITURE',
      author: 'BY ANNIE LUELWITZ',
    },
    'broken-fingaz-u2-beck': {
      category: 'GRAPHIC DESIGN',
      title: 'ANONYMOUS ART COLLECTIVE BROKEN FINGAZ DIRECTS MUSIC VIDEO FOR U2 AND BECK',
      author: 'BY SIMEON BREKKE',
    },
    'suzanne-saroff-photographs': {
      category: 'ARCHITECTURE',
      title: "SUZANNE SAROFF'S METICULOUS PHOTOGRAPHS ALTER PERCEPTIONS",
      author: 'BY SIMEON BREKKE',
    },
    'ani-jalasvinas-illustrations': {
      category: 'GRAPHIC DESIGN',
      title: "ANI JALASVINAS' PLAYFUL ILLUSTRATIONS CELEBRATE CLUB CULTURE AND BODILY DIVERSITY",
      author: 'BY ANNIE LUELWITZ',
    },
  },
};

const articleBodyByLocale: Record<LocaleKey, { intro: string; paragraphs: string[]; notFoundTitle: string; notFoundBody: string; navItems: { label: string; href: string }[]; contactTitle: string; socialLabel: string; footerAddress: string; copyright: string }> = {
  es: {
    intro:
      'Un análisis de contexto sobre cómo los ecosistemas productivos conectan territorio, gestión y mercado para capturar valor sostenible.',
    paragraphs: [
      'El ecosistema rural atraviesa una etapa de transformación profunda. La digitalización de procesos y los nuevos modelos de distribución están cambiando la forma en que se organizan las cadenas productivas en el territorio.',
      'En este escenario, las iniciativas orientadas por datos y por inteligencia operativa se vuelven clave para aumentar productividad y reducir pérdidas. Más que tecnología aislada, se necesita capacidad de ejecución con foco en resultado real.',
      'Cuando convergen estrategia comercial, estándares de calidad y formación técnica, los activos del campo operan con mayor previsibilidad. Eso crea base para crecimiento sostenible y fortalece la conexión con compradores de mayor valor agregado.',
      'La siguiente etapa editorial puede incorporar intertítulos, citas destacadas y bloques visuales para profundizar la lectura de impacto.',
    ],
    notFoundTitle: 'Artículo no encontrado',
    notFoundBody: 'El enlace utilizado no corresponde a un artículo válido.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluciones', href: '/solucoes' },
      { label: 'Aliados e Inversores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contacto', href: '#contacto' },
    ],
    contactTitle: 'Contacto',
    socialLabel: 'Redes sociales',
    footerAddress: 'Uruguay - dirección comercial (completar)',
    copyright: `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`,
    footerLinks: [
      {
        group: 'Otra seccion',
        items: [
          { label: 'Inicio', href: '/#hero' },
          { label: 'Soluciones', href: '/#soluciones' },
          { label: 'Segmentos', href: '/#segmentos' },
        ],
      },
      {
        group: 'Sobre',
        items: [
          { label: 'Historia y proposito', href: '/sobre' },
          { label: 'Como funciona', href: '/#sistema' },
          { label: 'Socios', href: '/#socios' },
        ],
      },
    ],
  },
  'pt-BR': {
    intro:
      'Uma análise de contexto sobre como ecossistemas produtivos conectam território, gestão e mercado para capturar valor sustentável.',
    paragraphs: [
      'O ecossistema rural atravessa uma fase de transformação profunda. A digitalização de processos e os novos modelos de distribuição estão mudando a forma como as cadeias produtivas se organizam no território.',
      'Nesse cenário, iniciativas orientadas por dados e inteligência operacional se tornam decisivas para elevar produtividade e reduzir perdas. Mais do que tecnologia isolada, é necessária capacidade de execução com foco em resultado real.',
      'Quando estratégia comercial, padrões de qualidade e formação técnica convergem, os ativos do campo operam com maior previsibilidade. Isso cria base para crescimento sustentável e fortalece a conexão com compradores de maior valor agregado.',
      'A próxima etapa editorial pode incorporar intertítulos, citações em destaque e blocos visuais para aprofundar a leitura de impacto.',
    ],
    notFoundTitle: 'Artigo não encontrado',
    notFoundBody: 'O link utilizado não corresponde a um artigo válido.',
    navItems: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Aliados e Investidores', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '#contacto' },
    ],
    contactTitle: 'Contato',
    socialLabel: 'Redes sociais',
    footerAddress: 'Uruguai - endereço comercial (completar)',
    copyright: `Rural Commerce ${new Date().getFullYear()} - Todos os direitos reservados`,
    footerLinks: [
      {
        group: 'Outra secao',
        items: [
          { label: 'Inicio', href: '/#hero' },
          { label: 'Solucoes', href: '/#soluciones' },
          { label: 'Segmentos', href: '/#segmentos' },
        ],
      },
      {
        group: 'Sobre',
        items: [
          { label: 'Historia e proposito', href: '/sobre' },
          { label: 'Como funciona', href: '/#sistema' },
          { label: 'Parceiros', href: '/#socios' },
        ],
      },
    ],
  },
  en: {
    intro:
      'A contextual analysis of how productive ecosystems connect territory, management, and markets to capture sustainable value.',
    paragraphs: [
      'Rural ecosystems are in a phase of deep transformation. Process digitization and new distribution models are reshaping how production chains are organized across territories.',
      'In this context, data-driven and operational-intelligence initiatives become essential to increase productivity and reduce losses. More than isolated technology, teams need consistent execution focused on real outcomes.',
      'When commercial strategy, quality standards, and technical training converge, field assets operate with greater predictability. This builds a foundation for sustainable growth and stronger access to higher-value buyers.',
      'The next editorial step can add subheadings, highlighted quotes, and visual support blocks to deepen insight for readers.',
    ],
    notFoundTitle: 'Article not found',
    notFoundBody: 'The selected link does not match a valid article.',
    navItems: [
      { label: 'About', href: '/sobre' },
      { label: 'Solutions', href: '/solucoes' },
      { label: 'Partners & Investors', href: '/aliados' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '#contacto' },
    ],
    contactTitle: 'Contact',
    socialLabel: 'Social media',
    footerAddress: 'Uruguay - business address (to be completed)',
    copyright: `Rural Commerce ${new Date().getFullYear()} - All rights reserved`,
    footerLinks: [
      {
        group: 'Other section',
        items: [
          { label: 'Home', href: '/#hero' },
          { label: 'Solutions', href: '/#soluciones' },
          { label: 'Segments', href: '/#segmentos' },
        ],
      },
      {
        group: 'About',
        items: [
          { label: 'History and purpose', href: '/sobre' },
          { label: 'How it works', href: '/#sistema' },
          { label: 'Partners', href: '/#socios' },
        ],
      },
    ],
  },
};

type PageProps = {
  params: {
    locale: string;
    slug: PostSlug;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = getLocaleKey(params.locale);
  const meta = postMetaByLocale[locale][params.slug];
  if (!meta) {
    return { title: 'Rural Commerce' };
  }

  return {
    title: `${meta.title} - Rural Commerce`,
    description: meta.title,
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  const locale = getLocaleKey(params.locale);
  const copy = articleBodyByLocale[locale];
  const post = posts.find((item) => item.slug === params.slug);

  if (!post) {
    notFound();
  }

  const postMeta = postMetaByLocale[locale][post.slug];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <RuralCommerceHeader navItems={copy.navItems} />

      <main className="flex-1 pt-28 sm:pt-32">
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
              <div className="order-1 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{postMeta.category}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-[#181818] sm:text-4xl">{postMeta.title}</h1>
                <p className="mt-4 text-xs font-semibold text-gray-600">{postMeta.author}</p>
                <p
                  className="mt-6 text-base leading-relaxed text-[#3D4352]"
                  style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                >
                  {copy.intro}
                </p>
              </div>

              <div className="order-3 lg:order-2 lg:col-span-3">
                <BlogMediaCarousel items={post.media} title={postMeta.title} locale={locale} />
              </div>

              <div className="order-2 lg:order-3 lg:col-span-5 mt-2 gap-8 text-base leading-relaxed text-[#3D4352] md:columns-2">
                {copy.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 break-inside-avoid"
                    style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <RuralCommerceFooter
        locale={params.locale}
        contactTitle={copy.contactTitle}
        socialLabel={copy.socialLabel}
        contactAddress={copy.footerAddress}
        copyright={copy.copyright}
        footerLinks={copy.footerLinks}
      />
    </div>
  );
}
