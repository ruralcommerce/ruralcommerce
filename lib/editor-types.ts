/**
 * Tipos del sistema de editor de bloques
 * Define la estructura de datos para páginas y componentes editables
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
  | 'rich-text'
  | 'image'
  | 'spacer'
  | 'contact-hero-split'
  | 'contact-form-split'
  | 'contact-map-split'
  | 'contact-social-strip'
  | 'blog-featured'
  | 'blog-posts-grid'
  | 'layout-section'
  | 'layout-columns'
  | 'layout-divider'
  | 'heading-block'
  | 'button-block'
  | 'video-embed'
  | 'map-embed'
  | 'accordion-block'
  | 'tabs-simple'
  | 'progress-block'
  | 'pricing-table'
  | 'rich-html';

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
  locale?: string;
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
    description: 'Configuración del menú principal del sitio',
    icon: 'ðŸ§­',
    defaultProps: {
      navItemsJson:
        '[{"label":"Sobre","href":"/sobre"},{"label":"Soluciones","href":"/solucoes"},{"label":"Aliados e Inversores","href":"/aliados"},{"label":"Blog","href":"/blog"},{"label":"Contacto","href":"#contacto"}]',
      logoAlt: 'Rural Commerce Logo',
    },
    editableProps: ['navItemsJson', 'logoAlt'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'site-footer': {
    type: 'site-footer',
    label: 'Rodapé (Sitio)',
    description: 'Configuración del rodapé principal del sitio',
    icon: 'ðŸ¦¶',
    defaultProps: {
      title: 'Rural Commerce',
      copyright: `Rural Commerce ${new Date().getFullYear()} - Todos los derechos reservados`,
      contactTitle: 'Contacto',
      contactAddress: 'Uruguay - dirección comercial (completar)',
      contactPhone: '+598 · · · · ·',
      contactEmail: 'contacto@ruralcommerce.com',
      socialLabel: 'Redes sociales',
      socialLinksJson:
        '[{"label":"Facebook","href":"https://facebook.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"Instagram","href":"https://instagram.com"}]',
      footerLinksJson:
        '[{"group":"Otra sección","items":[{"label":"Inicio","href":"/#hero"},{"label":"Soluciones","href":"/#soluciones"},{"label":"Segmentos","href":"/#segmentos"}]},{"group":"Sobre","items":[{"label":"Historia y propósito","href":"/sobre"},{"label":"Cómo funciona","href":"/#sistema"},{"label":"Socios","href":"/#socios"}]}]',
    },
    editableProps: ['title', 'copyright', 'contactTitle', 'contactAddress', 'contactPhone', 'contactEmail', 'socialLabel', 'socialLinksJson', 'footerLinksJson'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'hero-section': {
    type: 'hero-section',
    label: 'Hero (Inicio)',
    description: 'Sección principal de la parte superior de la página de inicio',
    icon: 'ðŸ“º',
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
    label: 'Sistema (Inicio)',
    description: 'Bloque con desafíos y ecosistema completo',
    icon: 'ðŸ“¦',
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
    label: 'Segmentos (Inicio)',
    description: 'Sección de segmentos atendidos',
    icon: 'ðŸ§©',
    defaultProps: {
      backgroundColor: '#071F5E',
      title: 'Segmentos que atendemos',
      subtitle: 'Conoce cómo acompañamos a cada actor de la cadena.',
      itemsJson:
        '[{"title":"Productores","subtitle":"Escala tu negocio","href":"#soluciones","icon":"tractor"},{"title":"Empresas ESG / cadena de suministro","subtitle":"Eficiencia y trazabilidad","href":"#socios","icon":"leaf"},{"title":"Gobiernos","subtitle":"Desarrollo territorial","href":"#socios","icon":"building2"}]',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle', 'itemsJson'],
    singleton: true,
  },
  'solutions-section': {
    type: 'solutions-section',
    label: 'Soluciones (Inicio)',
    description: 'Tarjetas de soluciones',
    icon: 'ðŸ› ï¸',
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
    label: 'Números (Inicio)',
    description: 'Sección de indicadores con carrusel',
    icon: 'ðŸ“Š',
    defaultProps: {
      backgroundColor: '#EEF3F7',
      title: 'Números que hablan',
      subtitle: 'Indicadores de impacto y eficiencia en redes acompañadas (valores referenciales).',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle'],
    singleton: true,
  },
  'partners-section': {
    type: 'partners-section',
    label: 'Socios (Homepage)',
    description: 'Carrusel de logos de socios',
    icon: 'ðŸ¤',
    defaultProps: {
      backgroundColor: '#F5F7FB',
      title: 'Socios de confianza',
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
    label: 'Texto libre',
    description: 'Bloque extra de texto para pruebas locales',
    icon: 'ðŸ“',
    defaultProps: {
      content: 'Su texto aquí',
      fontSize: '16px',
      textAlign: 'left',
    },
    editableProps: ['content', 'fontSize', 'textAlign'],
  },
  image: {
    type: 'image',
    label: 'Imagen',
    description: 'Bloque de imagen libre',
    icon: 'ðŸ–¼ï¸',
    defaultProps: {
      src: '',
      alt: 'Imagen',
    },
    editableProps: ['src', 'alt'],
  },
  spacer: {
    type: 'spacer',
    label: 'Espaciador',
    description: 'Espacio en blanco',
    icon: 'â¬œ',
    defaultProps: {
      height: '32px',
    },
    editableProps: ['height'],
  },
  'contact-hero-split': {
    type: 'contact-hero-split',
    label: 'Hero (Contacto)',
    description: 'Sección superior de la página de contacto',
    icon: '📬',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'contact-form-split': {
    type: 'contact-form-split',
    label: 'Formulario (Contacto)',
    description: 'Formulario de contacto',
    icon: '📝',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'contact-social-strip': {
    type: 'contact-social-strip',
    label: 'Redes sociales (Contacto)',
    description: 'Franja de redes sociales en la página de contacto',
    icon: '🔗',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'blog-featured': {
    type: 'blog-featured',
    label: 'Destaque (Blog)',
    description: 'Sección de artículo destacado del blog',
    icon: '⭐',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['blog'],
  },
  'blog-posts-grid': {
    type: 'blog-posts-grid',
    label: 'Artículos (Blog)',
    description: 'Cuadrícula de artículos del blog',
    icon: '📰',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['blog'],
  },
  'contact-map-split': {
    type: 'contact-map-split',
    label: 'Mapa (Contacto)',
    description: 'Sección de mapa en la página de contacto',
    icon: '🗺️',
    defaultProps: {},
    editableProps: [],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'rich-text': {
    type: 'rich-text',
    label: 'Texto enriquecido',
    description: 'Bloque de texto con formato',
    icon: '✏️',
    defaultProps: { content: '' },
    editableProps: ['content'],
  },
  'layout-section': {
    type: 'layout-section',
    label: 'Sección de layout',
    description: 'Sección contenedora de layout',
    icon: '📦',
    defaultProps: {},
    editableProps: [],
  },
  'layout-columns': {
    type: 'layout-columns',
    label: 'Columnas de layout',
    description: 'Layout de columnas',
    icon: '⬛',
    defaultProps: { columns: 2 },
    editableProps: ['columns'],
  },
  'layout-divider': {
    type: 'layout-divider',
    label: 'Divisor',
    description: 'Línea divisora horizontal',
    icon: '➖',
    defaultProps: {},
    editableProps: [],
  },
  'heading-block': {
    type: 'heading-block',
    label: 'Título',
    description: 'Bloque de encabezado',
    icon: '🔤',
    defaultProps: { text: 'Título', level: 'h2' },
    editableProps: ['text', 'level'],
  },
  'button-block': {
    type: 'button-block',
    label: 'Botón',
    description: 'Bloque de botón',
    icon: '🔘',
    defaultProps: { label: 'Botón', href: '#' },
    editableProps: ['label', 'href'],
  },
  'video-embed': {
    type: 'video-embed',
    label: 'Vídeo',
    description: 'Bloque de vídeo embebido',
    icon: '🎬',
    defaultProps: { url: '' },
    editableProps: ['url'],
  },
  'map-embed': {
    type: 'map-embed',
    label: 'Mapa embebido',
    description: 'Bloque de mapa embebido',
    icon: '🗺️',
    defaultProps: { url: '' },
    editableProps: ['url'],
  },
  'accordion-block': {
    type: 'accordion-block',
    label: 'Acordeón',
    description: 'Bloque de acordeón',
    icon: '📂',
    defaultProps: {},
    editableProps: [],
  },
  'tabs-simple': {
    type: 'tabs-simple',
    label: 'Pestañas',
    description: 'Bloque de pestañas simples',
    icon: '🗂️',
    defaultProps: {},
    editableProps: [],
  },
  'progress-block': {
    type: 'progress-block',
    label: 'Progreso',
    description: 'Bloque de barra de progreso',
    icon: '📊',
    defaultProps: {},
    editableProps: [],
  },
  'pricing-table': {
    type: 'pricing-table',
    label: 'Tabla de precios',
    description: 'Bloque de tabla de precios',
    icon: '💲',
    defaultProps: {},
    editableProps: [],
  },
  'rich-html': {
    type: 'rich-html',
    label: 'HTML enriquecido',
    description: 'Bloque de contenido HTML',
    icon: '🧩',
    defaultProps: { html: '' },
    editableProps: ['html'],
  },
};

const DEFAULT_PAGE_LABELS: Record<string, string> = {
  homepage: 'Inicio',
  solucoes: 'Soluciones',
  sobre: 'Sobre',
  aliados: 'Aliados',
  blog: 'Blog',
};

const PAGE_BLOCK_LABEL_OVERRIDES: Partial<Record<BlockType, Partial<Record<string, string>>>> = {
  'hero-section': {
    homepage: 'Hero (Inicio)',
    solucoes: 'Hero (Soluciones)',
    sobre: 'Hero (Sobre)',
    aliados: 'Hero (Aliados)',
    blog: 'Hero (Blog)',
  },
  'system-section': {
    homepage: 'Sistema (Inicio)',
    solucoes: 'Sección 2 (Soluciones)',
    sobre: 'Sección 3 (Sobre)',
    aliados: 'Sección 2 (Aliados)',
  },
  'segments-section': {
    homepage: 'Segmentos (Inicio)',
    sobre: 'Sección 2 (Sobre)',
    blog: 'Grid de Posts (Blog)',
  },
  'solutions-section': {
    homepage: 'Soluciones (Inicio)',
    solucoes: 'Sección 3 (Soluciones)',
    aliados: 'Sección 3 (Aliados)',
  },
  'stats-section': {
    homepage: 'Números (Inicio)',
    solucoes: 'Sección 4 (Soluciones)',
    sobre: 'Sección 4 (Sobre)',
    aliados: 'Sección 4 (Aliados)',
  },
  'partners-section': {
    homepage: 'Socios (Inicio)',
  },
  'free-text': {
    homepage: 'Texto libre (Inicio)',
    solucoes: 'Texto libre (Soluciones)',
    sobre: 'Texto libre (Sobre)',
    aliados: 'Texto libre (Aliados)',
    blog: 'Texto libre (Blog)',
  },
  image: {
    homepage: 'Imagen (Inicio)',
    solucoes: 'Imagen (Soluciones)',
    sobre: 'Imagen (Sobre)',
    aliados: 'Imagen (Aliados)',
    blog: 'Imagen (Blog)',
  },
  spacer: {
    homepage: 'Espaciador (Inicio)',
    solucoes: 'Espaciador (Soluciones)',
    sobre: 'Espaciador (Sobre)',
    aliados: 'Espaciador (Aliados)',
    blog: 'Espaciador (Blog)',
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
  return `${definition.label.replace(/ \((Homepage|Inicio)\)/g, '')} (${suffix})`;
}

export function getAvailableBlockTypesForPage(pageSlug: string): BlockType[] {
  return (Object.keys(BLOCK_LIBRARY) as BlockType[]).filter((type) => {
    const definition = BLOCK_LIBRARY[type];
    return !definition.pageSlugs || definition.pageSlugs.includes(pageSlug);
  });
}

