/**
 * Tipos del sistema de editor de bloques
 * Define la estructura de datos para páginas y componentes editables
 */

import { CONTACT_MAP_DEFAULT_TERRITORIES_GEOJSON } from './contact-map-default-territories';

export type BlockType =
  | 'site-header'
  | 'site-footer'
  | 'hero-section'
  | 'system-section'
  | 'segments-section'
  | 'solutions-section'
  | 'stats-section'
  | 'partners-section'
  | 'contact-hero-split'
  | 'contact-form-split'
  | 'contact-map-split'
  | 'contact-social-strip'
  | 'blog-featured'
  | 'blog-posts-grid'
  | 'free-text'
  | 'rich-text'
  | 'image'
  | 'spacer'
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
    description: 'Menu principal do site (links e logo).',
    icon: 'NAV',
    defaultProps: {
      navItemsJson:
        '[{"label":"Sobre","href":"/sobre"},{"label":"Soluciones","href":"/solucoes"},{"label":"Aliados e Inversores","href":"/aliados"},{"label":"Blog","href":"/blog"},{"label":"Contacto","href":"/contacto"}]',
      logoAlt: 'Rural Commerce Logo',
    },
    editableProps: ['navItemsJson', 'logoAlt'],
    pageSlugs: ['homepage'],
    singleton: true,
  },
  'site-footer': {
    type: 'site-footer',
    label: 'Rodapé (Sitio)',
    description: 'Rodapé: contacto, redes e links.',
    icon: 'ROD',
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
    description: 'Faixa principal no topo da home.',
    icon: 'HER',
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
    description: 'Desafios, imagem e pilares em JSON.',
    icon: 'SIS',
    defaultProps: {
      backgroundColor: '#071F5E',
      title: 'El campo enfrenta grandes desafíos',
      subtitle:
        'Pérdidas post-cosecha, oscilaciones del mercado y presión por sostenibilidad siguen limitando el crecimiento rural.',
      /** Foto grande à direita da secção Sistema (home). */
      sideImage: '/images/home/home-pic2.png',
      pillarsJson:
        '[{"title":"Hardware de Precisión","body":"Equipos modulares orientados a optimizar procesos, reducir costos y agregar valor a la producción."},{"title":"Software de Inteligencia y Gestión","body":"Herramientas que centralizan la gestión del negocio y el monitoreo de la producción, entregando indicadores y seguridad para la toma de decisiones."},{"title":"Gestión de Rescate y Valorización","body":"Procesos comerciales que transforman mermas en productos vendibles con vida útil extendida, evitando emisiones por descarte."},{"title":"Metodología de Aceleración","body":"Marco práctico para estandarizar calidad, estructurar márgenes y abrir canales comerciales."}]',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle', 'sideImage', 'pillarsJson'],
    singleton: true,
  },
  'segments-section': {
    type: 'segments-section',
    label: 'Segmentos (Inicio)',
    description: 'Três cartões de público (JSON).',
    icon: 'SEG',
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
    description: 'Três soluções com ilustração (JSON).',
    icon: 'SOL',
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
    description:
      'Indicadores em carrossel. No editor: ícone, número, símbolo e descrição por cartão (sem alterar o CSS do site). Campo vazio = valores pré-definidos por idioma.',
    icon: 'NUM',
    defaultProps: {
      backgroundColor: '#EEF3F7',
      title: 'Números que hablan',
      subtitle: 'Indicadores de impacto y eficiencia en redes acompañadas (valores referenciales).',
      statsJson: '',
    },
    editableProps: ['backgroundColor', 'title', 'subtitle', 'statsJson'],
    singleton: true,
  },
  'contact-hero-split': {
    type: 'contact-hero-split',
    label: 'Contacto — Hero (título + imagen + CTA)',
    description: 'Topo da página de contacto.',
    icon: 'CTA',
    defaultProps: {
      titleLine1: 'Hablemos de tu próximo paso',
      titleLine2: 'hacia la rentabilidad',
      description:
        'Ya seas un productor buscando crecer o una empresa buscando impacto, nuestro equipo está listo para asesorarte.',
      ctaText: 'Chatear con un asesor ahora',
      ctaUrl: '#',
      ctaSubtext: 'Respuesta inmediata en horario comercial',
      heroImage: '',
      accentCircleColor: '#071F5E',
    },
    editableProps: [
      'titleLine1',
      'titleLine2',
      'description',
      'ctaText',
      'ctaUrl',
      'ctaSubtext',
      'heroImage',
      'accentCircleColor',
    ],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'contact-form-split': {
    type: 'contact-form-split',
    label: 'Contacto — Formulario (tarjeta)',
    description: 'Formulário ao lado de painel azul.',
    icon: 'CTB',
    defaultProps: {
      leftPanelBg: '#071F5E',
      phone: '+598 XXX XXX XX',
      email: 'info@ruralcommerceglobal.com',
      formCopyJson: '',
    },
    editableProps: ['leftPanelBg', 'phone', 'email', 'formCopyJson'],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'contact-map-split': {
    type: 'contact-map-split',
    label: 'Contacto — Mapa (fondo oscuro)',
    description: 'Mapa ou GeoJSON de territórios.',
    icon: 'MAP',
    defaultProps: {
      backgroundColor: '#071F5E',
      title: 'Nuestra huella en el territorio',
      body: 'Estamos presentes en los principales polos productivos, llevando tecnología y gestión a cada rincón del país',
      territoriesGeoJson: CONTACT_MAP_DEFAULT_TERRITORIES_GEOJSON,
      mapEmbedUrl:
        'https://www.openstreetmap.org/export/embed.html?bbox=-56.25%2C-34.95%2C-56.05%2C-34.80&layer=mapnik',
    },
    editableProps: ['backgroundColor', 'title', 'body', 'territoriesGeoJson', 'mapEmbedUrl'],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'contact-social-strip': {
    type: 'contact-social-strip',
    label: 'Contacto — Redes sociales',
    description: 'Links para redes sociais.',
    icon: 'NET',
    defaultProps: {
      pageBg: '#F5F7FA',
      title: 'Seguinos y sumate a la comunidad',
      titleColor: '#009179',
      socialLinksJson:
        '[{"label":"Instagram","href":"https://www.instagram.com/ruralcommerce/"},{"label":"LinkedIn","href":"https://www.linkedin.com/company/ruralcommerce"},{"label":"Facebook","href":"https://facebook.com"},{"label":"YouTube","href":"https://www.youtube.com/@ruralcommerce"}]',
    },
    editableProps: ['pageBg', 'title', 'titleColor', 'socialLinksJson'],
    pageSlugs: ['contacto'],
    singleton: true,
  },
  'blog-featured': {
    type: 'blog-featured',
    label: 'Blog — Destaque (hero)',
    description: 'Notícia em destaque no topo do blog.',
    icon: 'BLF',
    defaultProps: {
      slug: '',
      image: '/images/home/hero-1.png',
      category: '',
      title: '',
      excerpt: '',
      author: '',
      featuredImageAlt: '',
    },
    editableProps: ['slug', 'image', 'category', 'title', 'excerpt', 'author', 'featuredImageAlt'],
    pageSlugs: ['blog'],
    singleton: true,
  },
  'blog-posts-grid': {
    type: 'blog-posts-grid',
    label: 'Blog — Grade de posts',
    description: 'Lista de artigos em cards (JSON).',
    icon: 'BLG',
    defaultProps: {
      postsJson: '[]',
    },
    editableProps: ['postsJson'],
    pageSlugs: ['blog'],
    singleton: true,
  },
  'partners-section': {
    type: 'partners-section',
    label: 'Parceiros (homepage)',
    description: 'Logos de parceiros (JSON).',
    icon: 'PAR',
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
    label: 'Texto simples',
    description: 'Parágrafo sem HTML (quebras de linha).',
    icon: 'TXT',
    defaultProps: {
      content: 'O seu texto aqui',
      fontSize: '16px',
      textAlign: 'left',
      maxWidth: '',
      paddingY: '',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'content',
      'fontSize',
      'textAlign',
      'maxWidth',
      'paddingY',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'rich-text': {
    type: 'rich-text',
    label: 'Texto rico (HTML)',
    description: 'Parágrafos, negrito, listas e links (HTML; scripts removidos no site).',
    icon: 'RTF',
    defaultProps: {
      contentHtml: '<p>Parágrafo com <strong>negrito</strong> e <a href="#">link</a>.</p>',
      maxWidth: '',
      paddingY: '',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'contentHtml',
      'maxWidth',
      'paddingY',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  image: {
    type: 'image',
    label: 'Imagem',
    description: 'Imagem com legenda e link opcional.',
    icon: 'IMG',
    defaultProps: {
      src: '',
      alt: 'Imagem',
      align: 'center',
      caption: '',
      linkUrl: '',
      maxWidth: '48rem',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'src',
      'alt',
      'align',
      'caption',
      'linkUrl',
      'maxWidth',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  spacer: {
    type: 'spacer',
    label: 'Espaciador',
    description: 'Espaço vertical entre blocos.',
    icon: 'ESP',
    defaultProps: {
      height: '32px',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['height', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
  'layout-section': {
    type: 'layout-section',
    label: 'Caixa / container',
    description: 'Caixa com largura máxima e fundo.',
    icon: 'BOX',
    defaultProps: {
      maxWidth: '72rem',
      padding: '1.5rem 1rem',
      backgroundColor: '#f8fafc',
      showBorder: false,
      innerLabel: '',
      bodyText: '',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'maxWidth',
      'padding',
      'backgroundColor',
      'showBorder',
      'innerLabel',
      'bodyText',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'layout-columns': {
    type: 'layout-columns',
    label: 'Colunas / grelha',
    description: '2 ou 3 colunas; use «Grelha CSS» para larguras manuais (ex.: 2fr 1fr).',
    icon: 'COL',
    defaultProps: {
      layout: '50-50',
      gridTemplateColumns: '',
      gap: '1.5rem',
      leftText: 'Coluna esquerda',
      rightText: 'Coluna direita',
      thirdText: 'Coluna central',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'layout',
      'gridTemplateColumns',
      'gap',
      'leftText',
      'rightText',
      'thirdText',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'layout-divider': {
    type: 'layout-divider',
    label: 'Divisor',
    description: 'Linha horizontal.',
    icon: '---',
    defaultProps: {
      thickness: '1px',
      color: '#e2e8f0',
      marginY: '16px',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'thickness',
      'color',
      'marginY',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'heading-block': {
    type: 'heading-block',
    label: 'Título (H1–H6)',
    description: 'Título H1–H6.',
    icon: 'H',
    defaultProps: {
      text: 'Novo título',
      level: 2,
      align: 'left',
      color: '#0f172a',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'text',
      'level',
      'align',
      'color',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'button-block': {
    type: 'button-block',
    label: 'Botão (CTA)',
    description: 'Botão com link, cores e raio.',
    icon: 'BTN',
    defaultProps: {
      label: 'Contactar',
      href: '/contacto',
      iconChar: '',
      backgroundColor: '#009179',
      textColor: '#ffffff',
      hoverBackgroundColor: '',
      hoverTextColor: '',
      borderRadius: '0.5rem',
      variant: 'solid',
      boxShadow: '',
      opacity: '',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
    },
    editableProps: [
      'label',
      'href',
      'iconChar',
      'backgroundColor',
      'textColor',
      'hoverBackgroundColor',
      'hoverTextColor',
      'borderRadius',
      'variant',
      'boxShadow',
      'opacity',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
    ],
  },
  'video-embed': {
    type: 'video-embed',
    label: 'Vídeo (YouTube / Vimeo)',
    description: 'YouTube ou Vimeo (URL).',
    icon: 'VID',
    defaultProps: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['url', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
  'map-embed': {
    type: 'map-embed',
    label: 'Mapa (Google / OpenStreetMap)',
    description: 'Cole o URL do iframe (Google Maps → Partilhar → incorporar mapa).',
    icon: 'MAP',
    defaultProps: {
      embedSrc:
        'https://www.openstreetmap.org/export/embed.html?bbox=-56.43%2C-34.94%2C-56.05%2C-34.78&layer=mapnik',
      title: 'Mapa',
      height: '360px',
      borderRadius: '0.75rem',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'embedSrc',
      'title',
      'height',
      'borderRadius',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'accordion-block': {
    type: 'accordion-block',
    label: 'Acordeão',
    description: 'Itens expansíveis (JSON).',
    icon: 'ACC',
    defaultProps: {
      itemsJson: '[{"title":"Pregunta 1","body":"Respuesta breve."},{"title":"Pregunta 2","body":"Otra respuesta."}]',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['itemsJson', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
  'tabs-simple': {
    type: 'tabs-simple',
    label: 'Abas (simples)',
    description: 'Duas colunas com rótulos.',
    icon: 'ABS',
    defaultProps: {
      tab1Label: 'Aba 1',
      tab2Label: 'Aba 2',
      tab1Text: 'Conteúdo da primeira aba.',
      tab2Text: 'Conteúdo da segunda aba.',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: [
      'tab1Label',
      'tab2Label',
      'tab1Text',
      'tab2Text',
      'marginTop',
      'marginBottom',
      'hideOnMobile',
      'animationClass',
      'opacity',
      'boxShadow',
    ],
  },
  'progress-block': {
    type: 'progress-block',
    label: 'Barra de progreso',
    description: 'Barra de percentagem.',
    icon: '%',
    defaultProps: {
      label: 'Progreso',
      value: 65,
      barColor: '#009179',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['label', 'value', 'barColor', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
  'pricing-table': {
    type: 'pricing-table',
    label: 'Precios (tarjetas)',
    description: 'Até três planos (JSON).',
    icon: 'PRE',
    defaultProps: {
      plansJson:
        '[{"name":"Básico","price":"$0","featuresJson":"[]","ctaText":"Empezar","ctaUrl":"/contacto"},{"name":"Pro","price":"$29","featuresJson":"[]","ctaText":"Contactar","ctaUrl":"/contacto"}]',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['plansJson', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
  'rich-html': {
    type: 'rich-html',
    label: 'HTML enriquecido',
    description: 'HTML (scripts removidos na vista pública).',
    icon: 'HTM',
    defaultProps: {
      htmlContent: '<p>Texto <strong>en negrita</strong>.</p>',
      marginTop: '',
      marginBottom: '',
      hideOnMobile: '',
      animationClass: '',
      opacity: '',
      boxShadow: '',
    },
    editableProps: ['htmlContent', 'marginTop', 'marginBottom', 'hideOnMobile', 'animationClass', 'opacity', 'boxShadow'],
  },
};

const DEFAULT_PAGE_LABELS: Record<string, string> = {
  homepage: 'Inicio',
  solucoes: 'Soluciones',
  sobre: 'Sobre',
  aliados: 'Aliados',
  blog: 'Blog',
  contacto: 'Contacto',
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
    contacto: 'Imagen (Contacto)',
  },
  'contact-hero-split': { contacto: 'Hero contacto' },
  'contact-form-split': { contacto: 'Formulario contacto' },
  'contact-map-split': { contacto: 'Mapa contacto' },
  'contact-social-strip': { contacto: 'Redes contacto' },
  'blog-featured': { blog: 'Destaque blog' },
  'blog-posts-grid': { blog: 'Posts blog' },
  spacer: {
    homepage: 'Espaciador (Inicio)',
    solucoes: 'Espaciador (Soluciones)',
    sobre: 'Espaciador (Sobre)',
    aliados: 'Espaciador (Aliados)',
    blog: 'Espaciador (Blog)',
    contacto: 'Espaciador (Contacto)',
  },
  'heading-block': {
    homepage: 'Título (Inicio)',
    solucoes: 'Título (Soluciones)',
    sobre: 'Título (Sobre)',
    aliados: 'Título (Aliados)',
    blog: 'Título (Blog)',
    contacto: 'Título (Contacto)',
  },
  'layout-section': {
    homepage: 'Sección (Inicio)',
    solucoes: 'Sección (Soluciones)',
    sobre: 'Sección (Sobre)',
    aliados: 'Sección (Aliados)',
    blog: 'Sección (Blog)',
    contacto: 'Sección (Contacto)',
  },
  'layout-columns': {
    homepage: 'Columnas (Inicio)',
    solucoes: 'Columnas (Soluciones)',
    sobre: 'Columnas (Sobre)',
    aliados: 'Columnas (Aliados)',
    blog: 'Columnas (Blog)',
    contacto: 'Columnas (Contacto)',
  },
  'layout-divider': {
    homepage: 'Divisor (Inicio)',
    solucoes: 'Divisor (Soluciones)',
    sobre: 'Divisor (Sobre)',
    aliados: 'Divisor (Aliados)',
    blog: 'Divisor (Blog)',
    contacto: 'Divisor (Contacto)',
  },
  'button-block': {
    homepage: 'Botón (Inicio)',
    solucoes: 'Botón (Soluciones)',
    sobre: 'Botón (Sobre)',
    aliados: 'Botón (Aliados)',
    blog: 'Botón (Blog)',
    contacto: 'Botón (Contacto)',
  },
  'video-embed': {
    homepage: 'Vídeo (Inicio)',
    solucoes: 'Vídeo (Soluciones)',
    sobre: 'Vídeo (Sobre)',
    aliados: 'Vídeo (Aliados)',
    blog: 'Vídeo (Blog)',
    contacto: 'Vídeo (Contacto)',
  },
  'accordion-block': {
    homepage: 'Acordeón (Inicio)',
    solucoes: 'Acordeón (Soluciones)',
    sobre: 'Acordeón (Sobre)',
    aliados: 'Acordeón (Aliados)',
    blog: 'Acordeón (Blog)',
    contacto: 'Acordeón (Contacto)',
  },
  'tabs-simple': {
    homepage: 'Pestañas (Inicio)',
    solucoes: 'Pestañas (Soluciones)',
    sobre: 'Pestañas (Sobre)',
    aliados: 'Pestañas (Aliados)',
    blog: 'Pestañas (Blog)',
    contacto: 'Pestañas (Contacto)',
  },
  'progress-block': {
    homepage: 'Progreso (Inicio)',
    solucoes: 'Progreso (Soluciones)',
    sobre: 'Progreso (Sobre)',
    aliados: 'Progreso (Aliados)',
    blog: 'Progreso (Blog)',
    contacto: 'Progreso (Contacto)',
  },
  'pricing-table': {
    homepage: 'Precios (Inicio)',
    solucoes: 'Precios (Soluciones)',
    sobre: 'Precios (Sobre)',
    aliados: 'Precios (Aliados)',
    blog: 'Precios (Blog)',
    contacto: 'Precios (Contacto)',
  },
  'rich-html': {
    homepage: 'HTML (Inicio)',
    solucoes: 'HTML (Soluciones)',
    sobre: 'HTML (Sobre)',
    aliados: 'HTML (Aliados)',
    blog: 'HTML (Blog)',
    contacto: 'HTML (Contacto)',
  },
  'map-embed': {
    homepage: 'Mapa (Inicio)',
    solucoes: 'Mapa (Soluciones)',
    sobre: 'Mapa (Sobre)',
    aliados: 'Mapa (Aliados)',
    blog: 'Mapa (Blog)',
    contacto: 'Mapa (Contacto)',
  },
  'rich-text': {
    homepage: 'Texto rico (Inicio)',
    solucoes: 'Texto rico (Soluciones)',
    sobre: 'Texto rico (Sobre)',
    aliados: 'Texto rico (Aliados)',
    blog: 'Texto rico (Blog)',
    contacto: 'Texto rico (Contacto)',
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

