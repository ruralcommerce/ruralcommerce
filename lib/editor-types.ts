/**
 * Tipos do sistema de editor de blocos
 * Define a estrutura de dados para páginas e componentes editáveis
 */

export type BlockType =
  | 'site-header'
  | 'site-footer'
  | 'hero-section'
  | 'system-section'
  | 'segments-section'
  | 'solutions-section'
  | 'stats-section'
  | 'partners-section'
  | 'free-text'
  | 'image'
  | 'spacer';

export interface BlockData {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children?: BlockData[];
}

export interface PageSchema {
  id: string;
  name: string;
  title: string;
  slug: string;
  blocks: BlockData[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: 'draft' | 'published';
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  defaultProps: Record<string, any>;
  editableProps: string[];
  pageSlugs?: string[];
  singleton?: boolean;
}

export const BLOCK_LIBRARY: Record<BlockType, BlockDefinition> = {
  'site-header': {
    type: 'site-header',
    label: 'Menu (Site)',
    description: 'Configuração do menu principal do site',
    icon: '🧭',
    defaultProps: {
      navItemsJson:
        '[{"label":"Sobre","href":"/sobre"},{"label":"Soluções","href":"/solucoes"},{"label":"Aliados e Inversores","href":"/aliados"},{"label":"Blog","href":"/blog"},{"label":"Contato","href":"#contacto"}]',
      logoAlt: 'Rural Commerce Logo',
    },
    editableProps: ['navItemsJson', 'logoAlt'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'site-footer': {
    type: 'site-footer',
    label: 'Rodapé (Site)',
    description: 'Configuração do rodapé principal do site',
    icon: '🦶',
    defaultProps: {
      title: 'Rural Commerce',
      copyright: `Rural Commerce ${new Date().getFullYear()} — Todos os direitos reservados`,
      contactTitle: 'Contato',
      contactAddress: 'Uruguay — endereço comercial (completar)',
      contactPhone: '+598 · · · · ·',
      contactEmail: 'contacto@ruralcommerce.com',
      socialLabel: 'Redes sociais',
      socialLinksJson:
        '[{"label":"Facebook","href":"https://facebook.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"Instagram","href":"https://instagram.com"}]',
      footerLinksJson:
        '[{"group":"Outra parte","items":[{"label":"Início","href":"/#hero"},{"label":"Soluções","href":"/#soluciones"},{"label":"Segmentos","href":"/#segmentos"}]},{"group":"Sobre","items":[{"label":"História e propósito","href":"/sobre"},{"label":"Como funciona","href":"/#sistema"},{"label":"Parceiros","href":"/#parceiros"}]}]',
    },
    editableProps: ['title', 'copyright', 'contactTitle', 'contactAddress', 'contactPhone', 'contactEmail', 'socialLabel', 'socialLinksJson', 'footerLinksJson'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'hero-section': {
    type: 'hero-section',
    label: 'Hero (Homepage)',
    description: 'Seção principal do topo da homepage',
    icon: '📺',
    defaultProps: {
      title: 'Transformamos excedentes en negocios sostenibles.',
      subtitle:
        'Tecnología, gestión y acceso a mercados para convertir pérdidas en nuevas oportunidades de negocio.',
      bgImage: '/images/home/hero-1.png',
      ctaText: 'Calcule su impacto y lucro',
      ctaUrl: '#soluciones',
      secondaryText: 'Cómo funciona',
      secondaryUrl: '#sistema',
    },
    editableProps: ['title', 'subtitle', 'bgImage', 'ctaText', 'ctaUrl', 'secondaryText', 'secondaryUrl'],
    singleton: true,
  },
  'system-section': {
    type: 'system-section',
    label: 'Sistema (Homepage)',
    description: 'Bloco com desafios e ecossistema completo',
    icon: '📦',
    defaultProps: {
      backgroundColor: '#071F5E',
      title: 'El campo enfrenta grandes desafíos',
      subtitle:
        'Pérdidas post-cosecha, oscilaciones del mercado y presión por sostenibilidad siguen limitando el crecimiento rural.',
      pillarsJson:
        '[{"title":"Hardware de Precisión","body":"Equipos modulares orientados a optimizar procesos, reducir costos y agregar valor a la producción."},{"title":"Software de Inteligencia y Gestión","body":"Herramientas que centralizan la gestión del negocio y el monitoreo de la producción, entregando indicadores y seguridad para la toma de decisiones."},{"title":"Gestión de Rescate y Valorización","body":"Procesos comerciales que transforman mermas en productos vendibles con vida útil extendida, evitando emisiones por descarte."},{"title":"Metodología de Aceleración","body":"Marco práctico para estandarizar calidad, estructurar márgenes y abrir canales comerciales."}]',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle', 'pillarsJson'],
    singleton: true,
  },
  'segments-section': {
    type: 'segments-section',
    label: 'Segmentos (Homepage)',
    description: 'Seção de segmentos atendidos',
    icon: '🧩',
    defaultProps: {
      backgroundColor: '#071F5E',
      title: 'Segmentos que atendemos',
      subtitle: 'Conocé cómo acompañamos a cada actor de la cadena.',
      itemsJson:
        '[{"title":"Productores","subtitle":"Escala tu negocio","href":"#soluciones","icon":"tractor"},{"title":"Empresas ESG / cadena de suministro","subtitle":"Eficiencia y trazabilidad","href":"#parceiros","icon":"leaf"},{"title":"Gobiernos","subtitle":"Desarrollo territorial","href":"#parceiros","icon":"building2"}]',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle', 'itemsJson'],
    singleton: true,
  },
  'solutions-section': {
    type: 'solutions-section',
    label: 'Soluções (Homepage)',
    description: 'Cards de soluções',
    icon: '🛠️',
    defaultProps: {
      backgroundColor: '#F5F7FB',
      title: 'Un camino claro para transformar su producción',
      itemsJson:
        '[{"title":"Diagnóstico de Eficiencia","body":"Descubra dónde está perdiendo dinero su negocio.","cta":"Saber más","variant":"navy"},{"title":"Curso de Procesamiento y Gestión","body":"Capacitación técnica para el estándar de retail (comercio minorista).","cta":"Saber más","variant":"sage"},{"title":"Kit de Implementación Rápida","body":"Tecnología y metodología para comenzar a generar ganancias hoy mismo.","cta":"Saber más","variant":"royal"}]',
    },
    editableProps: ['backgroundColor', 'title', 'itemsJson'],
    singleton: true,
  },
  'stats-section': {
    type: 'stats-section',
    label: 'Números (Homepage)',
    description: 'Seção de indicadores com carrossel',
    icon: '📊',
    defaultProps: {
      backgroundColor: '#EEF3F7',
      title: 'Números que hablan',
      subtitle: 'Indicativos de impacto y eficiencia en redes acompañadas (valores referenciales).',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle'],
    singleton: true,
  },
  'partners-section': {
    type: 'partners-section',
    label: 'Parceiros (Homepage)',
    description: 'Carrossel de logos de parceiros',
    icon: '🤝',
    defaultProps: {
      backgroundColor: '#F5F7FB',
      title: 'Parceiros de Confianza',
      partnersJson: JSON.stringify([
        { name: 'Slack', src: 'https://cdn.simpleicons.org/slack', href: 'https://slack.com' },
        { name: 'Commerce', src: 'https://cdn.simpleicons.org/shopify', href: 'https://www.shopify.com' },
        { name: 'Medium', src: 'https://cdn.simpleicons.org/medium', href: 'https://medium.com' },
        { name: 'SitePoint', src: 'https://cdn.simpleicons.org/sitepoint', href: 'https://www.sitepoint.com' },
        { name: 'Microsoft', src: 'https://cdn.simpleicons.org/microsoft', href: 'https://www.microsoft.com' },
        { name: 'GitHub', src: 'https://cdn.simpleicons.org/github', href: 'https://github.com' },
      ]),
    },
    editableProps: ['backgroundColor', 'title', 'partnersJson'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'free-text': {
    type: 'free-text',
    label: 'Texto Livre',
    description: 'Bloco extra de texto para testes locais',
    icon: '📝',
    defaultProps: {
      content: 'Seu texto aqui',
      fontSize: '16px',
      textAlign: 'left',
    },
    editableProps: ['content', 'fontSize', 'textAlign'],
  },
  image: {
    type: 'image',
    label: 'Imagem',
    description: 'Bloco de imagem livre',
    icon: '🖼️',
    defaultProps: {
      src: '',
      alt: 'Imagem',
    },
    editableProps: ['src', 'alt'],
  },
  spacer: {
    type: 'spacer',
    label: 'Espaçador',
    description: 'Espaço em branco',
    icon: '⬜',
    defaultProps: {
      height: '32px',
    },
    editableProps: ['height'],
  },
};

const DEFAULT_PAGE_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  solucoes: 'Soluções',
  sobre: 'Sobre',
  aliados: 'Aliados',
  blog: 'Blog',
};

const PAGE_BLOCK_LABEL_OVERRIDES: Partial<Record<BlockType, Partial<Record<string, string>>>> = {
  'hero-section': {
    homepage: 'Hero (Homepage)',
    solucoes: 'Hero (Soluções)',
    sobre: 'Hero (Sobre)',
    aliados: 'Hero (Aliados)',
    blog: 'Hero (Blog)',
  },
  'system-section': {
    homepage: 'Sistema (Homepage)',
    solucoes: 'Seção 2 (Soluções)',
    sobre: 'Seção 3 (Sobre)',
    aliados: 'Seção 2 (Aliados)',
  },
  'segments-section': {
    homepage: 'Segmentos (Homepage)',
    sobre: 'Seção 2 (Sobre)',
    blog: 'Grid de Posts (Blog)',
  },
  'solutions-section': {
    homepage: 'Soluções (Homepage)',
    solucoes: 'Seção 3 (Soluções)',
    aliados: 'Seção 3 (Aliados)',
  },
  'stats-section': {
    homepage: 'Números (Homepage)',
    solucoes: 'Seção 4 (Soluções)',
    sobre: 'Seção 4 (Sobre)',
    aliados: 'Seção 4 (Aliados)',
  },
  'partners-section': {
    homepage: 'Parceiros (Homepage)',
  },
  'free-text': {
    homepage: 'Texto Livre (Homepage)',
    solucoes: 'Texto Livre (Soluções)',
    sobre: 'Texto Livre (Sobre)',
    aliados: 'Texto Livre (Aliados)',
    blog: 'Texto Livre (Blog)',
  },
  image: {
    homepage: 'Imagem (Homepage)',
    solucoes: 'Imagem (Soluções)',
    sobre: 'Imagem (Sobre)',
    aliados: 'Imagem (Aliados)',
    blog: 'Imagem (Blog)',
  },
  spacer: {
    homepage: 'Espaçador (Homepage)',
    solucoes: 'Espaçador (Soluções)',
    sobre: 'Espaçador (Sobre)',
    aliados: 'Espaçador (Aliados)',
    blog: 'Espaçador (Blog)',
  },
};

export function getBlockLabelForPage(type: BlockType, pageSlug: string): string {
  const definition = BLOCK_LIBRARY[type];
  const override = PAGE_BLOCK_LABEL_OVERRIDES[type]?.[pageSlug];

  if (override) {
    return override;
  }

  if (pageSlug === 'homepage') {
    return definition.label;
  }

  const suffix = DEFAULT_PAGE_LABELS[pageSlug] || pageSlug;
  return `${definition.label.replace(/ \(Homepage\)/g, '')} (${suffix})`;
}

export function getAvailableBlockTypesForPage(pageSlug: string): BlockType[] {
  return (Object.keys(BLOCK_LIBRARY) as BlockType[]).filter((type) => {
    const definition = BLOCK_LIBRARY[type];
    return !definition.pageSlugs || definition.pageSlugs.includes(pageSlug);
  });
}
