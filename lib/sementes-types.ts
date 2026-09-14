export const SEMENTES_PATHS = ['produto', 'servico'] as const;
export type SementePath = (typeof SEMENTES_PATHS)[number];

export const SEMENTES_IMPACTS = ['economico', 'ambiental', 'social'] as const;
export type SementeImpact = (typeof SEMENTES_IMPACTS)[number];

export const SEMENTES_STATUSES = ['draft', 'published', 'shortlisted', 'mentorship', 'wait'] as const;
export type SementeStatus = (typeof SEMENTES_STATUSES)[number];

export const SEMENTES_MAX_STEP = 7;

export type SementeLocale = 'es' | 'pt-BR' | 'en';

export type SementeRecord = {
  id: string;
  publicId: string;
  tokenHash: string;
  pinHash: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale: SementeLocale;
  name: string;
  whatsapp: string;
  alias: string;
  path?: SementePath;
  problem: string;
  solution: string;
  impacts: SementeImpact[];
  impactNote: string;
  fuel: string;
  fuelChips: string[];
  videoKey?: string;
  videoContentType?: string;
  heat: number;
  heatVoters: string[];
  status: SementeStatus;
  step: number;
};

export type SementesRoom = {
  flipAt: string | null;
};

export type SementesFile = {
  room: SementesRoom;
  seeds: SementeRecord[];
};

export type SementeDraftPatch = Partial<
  Pick<
    SementeRecord,
    | 'name'
    | 'locale'
    | 'path'
    | 'problem'
    | 'solution'
    | 'impacts'
    | 'impactNote'
    | 'fuel'
    | 'fuelChips'
    | 'step'
  >
>;

export type SementePublicCard = {
  publicId: string;
  alias: string;
  path?: SementePath;
  hook: string;
  problem: string;
  impactNote: string;
  fuel: string;
  fuelChips: string[];
  impacts: SementeImpact[];
  heat: number;
  publishedAt?: string;
  hasVideo: boolean;
};

export type SementeOwnerView = SementePublicCard & {
  id: string;
  name: string;
  whatsapp: string;
  solution: string;
  impactNote: string;
  fuel: string;
  fuelChips: string[];
  status: SementeStatus;
  step: number;
  updatedAt: string;
  hasPin: boolean;
};

export type SementeTeamView = SementeOwnerView & {
  createdAt: string;
  videoContentType?: string;
  score: number;
  scoreBreakdown: SementeScoreBreakdown;
};

export type SementeScoreBreakdown = {
  complete: number;
  clarity: number;
  impact: number;
  feasibility: number;
  signal: number;
  originality: number;
};
