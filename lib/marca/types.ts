export type MarcaLocale = 'es' | 'pt-BR' | 'en';

export type MarcaSection = 'palette' | 'logo' | 'packaging';

export type MarcaTone = 'pastel' | 'sobrio' | 'terroso' | 'vibrante';

export type MarcaContractStatus = 'draft' | 'active' | 'done';

export type MarcaImage = {
  id: string;
  src: string;
  alt: string;
  tags: string[];
  tone?: MarcaTone | string;
  section?: MarcaSection | string;
  moodColor?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MarcaWords = {
  selected: string[];
  people: string[];
  places: string[];
  product: string[];
};

export type MarcaCustomer = {
  alreadySells?: boolean;
  whatSells?: string;
  askedClients?: boolean;
  clientPraise?: string;
  buyFor?: string[];
  wantFeel?: string;
};

/** One preferred image id per visual section */
export type MarcaSectionPicks = Partial<Record<MarcaSection, string>>;

export type MarcaParticipant = {
  id: string;
  name: string;
  joinedAt: string;
  /** @deprecated kept for old responses */
  votes: Record<string, 'no' | 'neutral' | 'yes'>;
  sectionPicks: MarcaSectionPicks;
  /** Figma flow: up to 2 palette tones */
  paletteTones?: string[];
  /** Figma flow: multi-select visual style image ids */
  styleImageIds?: string[];
  words: MarcaWords;
  freeText: string;
  /** data URL or public path for short audio note */
  audioDataUrl?: string;
  customer: MarcaCustomer;
  specialMeaning: string;
  completedAt?: string;
};

export type MarcaContract = {
  id: string;
  code: string;
  clientName: string;
  title: string;
  notes: string;
  status: MarcaContractStatus;
  locale: MarcaLocale;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  imageIds: string[];
  participants: MarcaParticipant[];
};

export type MarcaStoreFile = {
  contracts: MarcaContract[];
};

export type MarcaToneScore = {
  tone: string;
  count: number;
};

export type MarcaVisualProfile = {
  contractId: string;
  participantCount: number;
  completedCount: number;
  /** most picked tones per section */
  bySection: Record<string, MarcaToneScore[]>;
  strong: string[];
  moderate: string[];
  low: string[];
  rejections: string[];
  tagScores: { tag: string; score: number; yes: number; no: number; neutral: number }[];
  words: MarcaWords;
  wordFrequency: { word: string; count: number }[];
  specialMeanings: { name: string; text: string }[];
  freeTexts: { name: string; text: string }[];
  customerNotes: { name: string; customer: MarcaCustomer }[];
  /** top images for taller moodboard */
  topImageIds: string[];
};

export type MarcaPublicImage = {
  id: string;
  src: string;
  alt: string;
  moodColor?: string;
  tone?: string;
  section?: string;
};

export type MarcaPublicWorkshop = {
  code: string;
  title: string;
  clientName: string;
  status: MarcaContractStatus;
  images: MarcaPublicImage[];
  /** one representative image per tone for each section */
  sections: Record<MarcaSection, MarcaPublicImage[]>;
  wordBank: string[];
};

export const MARCA_TONES: MarcaTone[] = ['pastel', 'sobrio', 'terroso', 'vibrante'];

export const MARCA_PALETTE_META: Record<
  MarcaTone,
  { labelEs: string; labelPt: string; blurbEs: string; blurbPt: string; colors: string[] }
> = {
  sobrio: {
    labelEs: 'Paleta sobria',
    labelPt: 'Paleta sóbria',
    blurbEs: 'Elegancia, contraste y sofisticación',
    blurbPt: 'Elegância, contraste e sofisticação',
    colors: ['#1A1D21', '#2F3336', '#5A6168', '#A8ADB2', '#E8E4DC'],
  },
  terroso: {
    labelEs: 'Paleta terrosa',
    labelPt: 'Paleta terrosa',
    blurbEs: 'Calidez, origen, natural y cercanía',
    blurbPt: 'Calor, origem, natural e proximidade',
    colors: ['#8B6914', '#C4A574', '#5C4033', '#D4C4A8', '#3D2914'],
  },
  vibrante: {
    labelEs: 'Paleta vibrante',
    labelPt: 'Paleta vibrante',
    blurbEs: 'Energía, frescura y alto impacto visual',
    blurbPt: 'Energia, frescor e alto impacto visual',
    colors: ['#FFBE54', '#E85D04', '#EF5D36', '#2A9D8F', '#31442B'],
  },
  pastel: {
    labelEs: 'Paleta pastel',
    labelPt: 'Paleta pastel',
    blurbEs: 'Suavidad, delicadeza y cercanía',
    blurbPt: 'Suavidade, delicadeza e proximidade',
    colors: ['#E8D5D0', '#F0C9B0', '#C9D5C4', '#A8B5C4', '#D8C4E0'],
  },
};

export const MARCA_SECTIONS: { id: MarcaSection; labelEs: string; labelPt: string; hintEs: string; hintPt: string }[] = [
  {
    id: 'palette',
    labelEs: 'Paleta de colores',
    labelPt: 'Paleta de cores',
    hintEs: 'Elige el tono que más combina con su marca.',
    hintPt: 'Escolha o tom que mais combina com a marca de vocês.',
  },
  {
    id: 'logo',
    labelEs: 'Logos',
    labelPt: 'Logos',
    hintEs: '¿Cuál estilo de marca/logo se siente más suyo?',
    hintPt: 'Qual estilo de marca/logo parece mais de vocês?',
  },
  {
    id: 'packaging',
    labelEs: 'Embalajes',
    labelPt: 'Embalagens',
    hintEs: '¿Cuál embalaje se acerca más a lo que imaginan?',
    hintPt: 'Qual embalagem se aproxima do que imaginam?',
  },
];

export const MARCA_WORD_BANK = [
  'natural',
  'artesanal',
  'fresco',
  'familia',
  'territorio',
  'confianza',
  'tradición',
  'innovación',
  'cuidado',
  'sabor',
  'origen',
  'comunidad',
  'honestidad',
  'calidez',
  'fuerza',
  'delicadeza',
  'raíz',
  'cosecha',
  'montaña',
  'río',
  'sol',
  'tierra',
  'manos',
  'orgullo',
  'simple',
  'premium',
  'alegre',
  'sereno',
  'vivo',
  'auténtico',
  'campo',
  'bosque',
  'semilla',
  'flor',
  'fruta',
  'miel',
  'café',
  'queso',
  'pan',
  'huerta',
  'finca',
  'valle',
  'niebla',
  'amanecer',
  'atardecer',
  'lluvia',
  'viento',
  'piedra',
  'madera',
  'barro',
  'lana',
  'tejido',
  'color',
  'textura',
  'aroma',
  'dulce',
  'ácido',
  'umami',
  'crujiente',
  'suave',
  'robusto',
  'limpio',
  'puro',
  'local',
  'cercano',
  'rural',
  'campesino',
  'cooperativa',
  'vecinos',
  'generación',
  'herencia',
  'memoria',
  'historia',
  'futuro',
  'cambio',
  'crecimiento',
  'equilibrio',
  'respeto',
  'paciencia',
  'dedicación',
  'pasión',
  'alegría',
  'paz',
  'abundancia',
  'generosidad',
  'acogida',
  'hogar',
  'mesa',
  'compartir',
  'celebrar',
  'encuentro',
  'camino',
  'viaje',
  'descubrimiento',
  'curiosidad',
  'creatividad',
  'detalle',
  'calidad',
  'excelencia',
  'cuidado del agua',
  'sostenible',
  'orgánico',
  'sin prisa',
  'hecho a mano',
  'de la tierra',
  'nuestro',
];
