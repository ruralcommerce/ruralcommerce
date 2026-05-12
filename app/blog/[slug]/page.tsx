import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';
import { BlogMediaCarousel } from '@/components/BlogMediaCarousel';

const blogPosts = [
  {
    slug: 'japan-house-london-creativity',
    category: 'ILUSTRAÇÃO',
    title: 'JAPAN HOUSE OPENS IN LONDON TO FOSTER JAPANESE CREATIVITY IN THE UK',
    author: 'BY RETA TORPHY',
    media: [
      { type: 'image' as const, src: '/images/home/hero-1.png', alt: 'Produtores em campo' },
      { type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Equipe em operação' },
      { type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Ilustração de processo' },
    ],
  },
  {
    slug: 'helmut-lang-taxi-drivers',
    category: 'PHOTOGRAPHY',
    title: 'HELMUT LANG CELEBRATES TAXI DRIVERS WORLDWIDE IN LATEST CAMPAIGN',
    author: 'BY ALESSANDRA ORTIZ',
    media: [{ type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Equipe em campo' }],
  },
  {
    slug: 'bowlcut-uk-legends',
    category: 'PHOTOGRAPHY',
    title: 'BOWLCUT LAUNCH A NEW SUMMER COLLECTION THAT PAYS HOMAGE TO "UK LEGENDS"',
    author: 'BY ROSANNA ONDRICKA',
    media: [{ type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Ilustração editorial' }],
  },
  {
    slug: 'andy-warhol-unseen-photos',
    category: 'PHOTOGRAPHY',
    title: 'THOUSANDS OF PREVIOUSLY UNSEEN PHOTOGRAPHS BY ANDY WARHOL WILL BE MADE PUBLIC THIS AUTUMN',
    author: 'BY ANNIE LUELWITZ',
    media: [{ type: 'image' as const, src: '/images/home/home-ils3.png', alt: 'Ilustração editorial' }],
  },
  {
    slug: 'vinka-iloris-storytelling-furniture',
    category: 'INTERACTIVE DESIGN',
    title: 'LONDON-BASED VINKA ILORIS STORY TELLING FURNITURE',
    author: 'BY ANNIE LUELWITZ',
    media: [{ type: 'image' as const, src: '/images/home/home-pic2.png', alt: 'Equipe trabalhando' }],
  },
  {
    slug: 'broken-fingaz-u2-beck',
    category: 'GRAPHIC DESIGN',
    title: 'ANONYMOUS ISRAELI ART COLLECTIVE BROKEN FINGAZ DIRECT MUSIC VIDEO FOR U2 AND BECK',
    author: 'BY SIMEON BREKKE',
    media: [{ type: 'image' as const, src: '/images/home/hero-1.png', alt: 'Campo produtivo' }],
  },
  {
    slug: 'suzanne-saroff-photographs',
    category: 'ARCHITECTURE',
    title: 'SUZANNE SAROFFS METICULOUSLY ARRANGED PHOTOGRAPHS ALTER PERCEPTIONS',
    author: 'BY SIMEON BREKKE',
    media: [{ type: 'image' as const, src: '/images/home/home-ils2.png', alt: 'Ilustração arquitetônica' }],
  },
  {
    slug: 'ani-jalasvinas-illustrations',
    category: 'GRAPHIC DESIGN',
    title: 'ANI JALASVINAS PLAYFUL ILLUSTRATIONS CELEBRATE CLUB CULTURE, BROWN BODIES AND PERFECT PAUNCHES',
    author: 'BY ANNIE LUELWITZ',
    media: [{ type: 'image' as const, src: '/images/home/home-ils3.png', alt: 'Ilustração de personas' }],
  },
] as const;

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = blogPosts.find((item) => item.slug === params.slug);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <RuralCommerceHeader />

      <main className="flex-1 pt-28 sm:pt-32">
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {post ? (
              <>
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
                  <div className="order-1 lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{post.category}</p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight text-[#181818] sm:text-4xl">
                      {post.title}
                    </h1>
                    <p className="mt-4 text-xs font-semibold text-gray-600">{post.author}</p>
                    <p
                      className="mt-6 text-base leading-relaxed text-[#3D4352]"
                      style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                    >
                      Enim omittam qui id, ex quo atqui dictas complectitur. Nec ad timeam accusata, hinc justo falli id eum, ferri novum molestie eos cu.
                    </p>
                  </div>
                  <div className="order-3 lg:order-2 lg:col-span-3">
                    <BlogMediaCarousel items={post.media} title={post.title} />
                  </div>
                  <div className="order-2 lg:order-3 lg:col-span-5 mt-2 gap-8 text-base leading-relaxed text-[#3D4352] md:columns-2">
                    <p
                      className="mb-4 break-inside-avoid"
                      style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                    >
                      O ecossistema rural atravessa uma fase de profunda transformacao. A digitalizacao de processos, aliada a novos modelos de distribuicao e financiamento, vem alterando a forma como cadeias produtivas se organizam no territorio.
                    </p>
                    <p
                      className="mb-4 break-inside-avoid"
                      style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                    >
                      Neste contexto, iniciativas orientadas por dados e por inteligencia operacional tornam-se decisivas para ampliar produtividade e reduzir perdas. Mais do que tecnologia, o que se busca e capacidade de execucao consistente com foco em resultado real.
                    </p>
                    <p
                      className="mb-4 break-inside-avoid"
                      style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                    >
                      Quando estrategias de mercado, padroes de qualidade e treinamento tecnico convergem, os ativos do campo passam a operar com maior previsibilidade. Isso cria base para crescimento sustentavel e fortalece a conexao com compradores de maior valor agregado.
                    </p>
                    <p
                      className="mb-4 break-inside-avoid"
                      style={{ textAlign: 'justify', textJustify: 'inter-word', hyphens: 'auto' }}
                    >
                      A proxima etapa deste artigo recebera o formato editorial final que voce vai definir, incluindo intertitulos, destaque de citacoes e blocos de apoio visual no fluxo da leitura.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-[#181818] sm:text-4xl">Artigo nao encontrado</h1>
                <p className="mt-4 text-base text-[#3D4352]">O link clicado nao corresponde a um artigo valido.</p>
              </>
            )}
          </div>
        </section>
      </main>

      <RuralCommerceFooter />
    </div>
  );
}
