export type MarcaLocale = 'es' | 'pt-BR' | 'en';

export type MarcaVoteValue = 'no' | 'neutral' | 'yes';

export type MarcaContractStatus = 'draft' | 'active' | 'done';

export type MarcaImage = {
  id: string;
  /** URL pública ou path em /public */
  src: string;
  alt: string;
  /** Só equipe vê; nunca enviado ao participante */
  tags: string[];
  /** Tom visual de fallback se a imagem falhar */
  moodColor?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MarcaWords = {
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

export type MarcaParticipant = {
  id: string;
  name: string;
  joinedAt: string;
  votes: Record<string, MarcaVoteValue>;
  words: MarcaWords;
  customer: MarcaCustomer;
  specialMeaning: string;
  completedAt?: string;
};

/** Contrato com cliente / oficina de marca */
export type MarcaContract = {
  id: string;
  /** Código curto do link público /oficina/[code] */
  code: string;
  clientName: string;
  title: string;
  notes: string;
  status: MarcaContractStatus;
  locale: MarcaLocale;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** Subconjunto do catálogo; vazio = catálogo completo */
  imageIds: string[];
  participants: MarcaParticipant[];
};

export type MarcaStoreFile = {
  contracts: MarcaContract[];
};

export type MarcaTagScore = {
  tag: string;
  score: number;
  yes: number;
  no: number;
  neutral: number;
};

export type MarcaVisualProfile = {
  contractId: string;
  participantCount: number;
  completedCount: number;
  strong: string[];
  moderate: string[];
  low: string[];
  rejections: string[];
  tagScores: MarcaTagScore[];
  words: MarcaWords;
  specialMeanings: { name: string; text: string }[];
  customerNotes: { name: string; customer: MarcaCustomer }[];
};

export type MarcaPublicImage = {
  id: string;
  src: string;
  alt: string;
  moodColor?: string;
};

export type MarcaPublicWorkshop = {
  code: string;
  title: string;
  clientName: string;
  status: MarcaContractStatus;
  images: MarcaPublicImage[];
};
