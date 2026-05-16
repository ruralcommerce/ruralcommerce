import type { BlockData } from '@/lib/editor-types';
import { createBlock } from '@/lib/editor-utils';

export type BlogLocaleKey = 'es' | 'pt-BR' | 'en';

export const blogMeta: Record<
  BlogLocaleKey,
  { metadataTitle: string; metadataDescription: string; featuredImageAlt: string }
> = {
  es: {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription:
      'Perspectivas y análisis sobre tecnología rural, sostenibilidad e innovación agroindustrial.',
    featuredImageAlt: 'Publicación destacada',
  },
  'pt-BR': {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription: 'Perspectivas e análises sobre tecnologia rural, sustentabilidade e inovação no agro.',
    featuredImageAlt: 'Publicação em destaque',
  },
  en: {
    metadataTitle: 'Blog — Rural Commerce',
    metadataDescription:
      'Insights and analysis on rural technology, sustainability, and agribusiness innovation.',
    featuredImageAlt: 'Featured post',
  },
};

export const blogContent: Record<
  BlogLocaleKey,
  {
    featured: {
      slug: string;
      image: string;
      category: string;
      title: string;
      excerpt: string;
      author: string;
    };
    posts: { slug: string; image: string; category: string; title: string; author: string }[];
  }
> = {
  es: {
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
  },
  'pt-BR': {
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
  },
  en: {
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
        title: "SUZANNE SAROFF'S METICULOUSLY ARRANGED PHOTOGRAPHS ALTER PERCEPTIONS",
        author: 'BY SIMEON BREKKE',
      },
      {
        slug: 'ani-jalasvinas-illustrations',
        image: '/images/home/home-ils3.png',
        category: 'GRAPHIC DESIGN',
        title: "ANI JALASVINAS' PLAYFUL ILLUSTRATIONS CELEBRATE CLUB CULTURE AND BODILY DIVERSITY",
        author: 'BY ANNIE LUELWITZ',
      },
    ],
  },
};

export function getBlogLocaleKey(locale: string): BlogLocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function getBlogDefaultBlocks(locale: BlogLocaleKey): BlockData[] {
  const copy = blogContent[locale];
  const meta = blogMeta[locale];

  return [
    createBlock('blog-featured', {
      props: {
        slug: copy.featured.slug,
        image: copy.featured.image,
        category: copy.featured.category,
        title: copy.featured.title,
        excerpt: copy.featured.excerpt,
        author: copy.featured.author,
        featuredImageAlt: meta.featuredImageAlt,
      },
    }),
    createBlock('blog-posts-grid', {
      props: {
        postsJson: JSON.stringify(copy.posts, null, 2),
      },
    }),
  ];
}
