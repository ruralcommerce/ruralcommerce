export const LOTE_KINDS = ['produto', 'servico'] as const;
export type LoteKind = (typeof LOTE_KINDS)[number];

export const LOTE_UPGRADES = ['stall', 'tools', 'sign'] as const;
export type LoteUpgrade = (typeof LOTE_UPGRADES)[number];

export type LoteEvent = 'none' | 'feira' | 'chuva' | 'vizinho' | 'calmaria';

export type LoteRecord = {
  id: string;
  publicId: string;
  tokenHash: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  business: string;
  product: string;
  kind: LoteKind;
  priceCents: number;
  costCents: number;
  cashCents: number;
  stock: number;
  capacity: number;
  quality: number;
  stallLevel: number;
  toolsLevel: number;
  signLevel: number;
  day: number;
  soldTotal: number;
  madeTotal: number;
  event: LoteEvent;
  log: string;
  seedPublicId?: string;
};

export type LoteView = Omit<LoteRecord, 'tokenHash'>;

export type LoteAct = 'produce' | 'sell' | 'upgrade-stall' | 'upgrade-tools' | 'upgrade-sign' | 'rest';

export type LoteFile = {
  lotes: LoteRecord[];
};
