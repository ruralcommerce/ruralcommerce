export type MnsLocale = 'es' | 'pt-BR' | 'en';

export type MnsSessionStatus = 'draft' | 'active' | 'closed';

export type MnsWorkRoute = 'negocio' | 'ficticio' | 'propuesta' | 'rosa';

export type MnsFichaId = 'ficha1' | 'ficha2' | 'ficha3' | 'ficha4';

export type MnsFieldValue = string | string[] | Record<string, string>;

export type MnsAnswers = Partial<Record<MnsFichaId, Record<string, MnsFieldValue>>>;

export type MnsCheckAnswers = Record<string, string>;

export type MnsCheckSnapshot = {
  answers: MnsCheckAnswers;
  score: number;
  max: number;
  completedAt: string;
};

export type MnsParticipant = {
  id: string;
  name: string;
  joinedAt: string;
  updatedAt: string;
  completedAt?: string | null;
  workRoute: MnsWorkRoute;
  productLabel: string;
  answers: MnsAnswers;
  currentFicha: MnsFichaId;
  preCheck?: MnsCheckSnapshot | null;
  postCheck?: MnsCheckSnapshot | null;
};

export type MnsSession = {
  id: string;
  code: string;
  title: string;
  groupName: string;
  notes: string;
  status: MnsSessionStatus;
  locale: MnsLocale;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  participants: MnsParticipant[];
};

export type MnsStoreFile = {
  sessions: MnsSession[];
};

export type MnsFieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'choice'
  | 'chips'
  | 'incoterm'
  | 'rosa-calc'
  | 'trace-builder'
  | 'tagged-text'
  | 'cost-table'
  | 'trace-links'
  | 'presentation';

export type MnsFieldHelp = {
  paraQue: string;
  como: string;
  ejemplo: string;
  alerta?: string;
};

export type MnsFieldDef = {
  id: string;
  label: string;
  kind: MnsFieldKind;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  required?: boolean;
  help: MnsFieldHelp;
  /** Cost table column keys when kind === cost-table */
  columns?: { id: string; label: string }[];
  rowLabels?: { id: string; label: string }[];
};

export type MnsStepDef = {
  id: string;
  title: string;
  intro: string;
  fields: MnsFieldDef[];
};

export type MnsFichaDef = {
  id: MnsFichaId;
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  day: 1 | 2;
  durationMin: number;
  consigna: string;
  proposito: string;
  steps: MnsStepDef[];
  tipRevision: string;
};
