import type { LoteAct, LoteEvent, LoteKind, LoteRecord } from '@/lib/lote-types';

export function toCents(reais: number) {
  if (!Number.isFinite(reais)) return 0;
  return Math.max(0, Math.round(reais * 100));
}

export function fromCents(cents: number) {
  return (Math.max(0, cents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function upgradeCost(level: number, base: number) {
  return base * (level + 1);
}

function effectiveCost(lote: LoteRecord) {
  const cut = Math.min(0.4, lote.toolsLevel * 0.08);
  return Math.max(50, Math.round(lote.costCents * (1 - cut)));
}

function demand(lote: LoteRecord) {
  const fair = lote.event === 'feira' ? 3 : 0;
  const neighbor = lote.event === 'vizinho' ? 2 : 0;
  const bounce = ((lote.day * 7) % 4) + 1;
  return Math.max(1, 2 + lote.quality + lote.signLevel + fair + neighbor + bounce);
}

function rollEvent(day: number): LoteEvent {
  if (day > 0 && day % 5 === 0) return 'feira';
  const pick = (day * 13 + 5) % 9;
  if (pick === 0) return 'chuva';
  if (pick === 3) return 'vizinho';
  if (pick === 6) return 'calmaria';
  return 'none';
}

function eventLog(event: LoteEvent, kind: LoteKind) {
  if (event === 'feira') return 'Dia de feira. A estrada enche. Demanda sobe.';
  if (event === 'chuva') return kind === 'produto' ? 'Chuva. Parte do estoque molhou.' : 'Chuva. Menos gente na rua.';
  if (event === 'vizinho') return 'Um vizinho veio indicar teu lote. Alguém vai aparecer.';
  if (event === 'calmaria') return 'Dia quieto. Dá para produzir com calma.';
  return '';
}

export function createLoteState(input: {
  id: string;
  publicId: string;
  tokenHash: string;
  name: string;
  business: string;
  product: string;
  kind: LoteKind;
  priceCents: number;
  costCents: number;
  cashCents: number;
  seedPublicId?: string;
}): LoteRecord {
  const now = new Date().toISOString();
  return {
    id: input.id,
    publicId: input.publicId,
    tokenHash: input.tokenHash,
    createdAt: now,
    updatedAt: now,
    name: input.name.trim() || 'Você',
    business: input.business.trim() || input.product.trim() || 'Meu lote',
    product: input.product.trim() || (input.kind === 'servico' ? 'serviço' : 'produto'),
    kind: input.kind,
    priceCents: Math.max(100, input.priceCents),
    costCents: Math.max(0, input.costCents),
    cashCents: Math.max(0, input.cashCents),
    stock: 0,
    capacity: 3,
    quality: 1,
    stallLevel: 0,
    toolsLevel: 0,
    signLevel: 0,
    day: 1,
    soldTotal: 0,
    madeTotal: 0,
    event: 'none',
    log: 'O lote é teu. Produz. Vende. Melhora. Os números são os teus.',
    seedPublicId: input.seedPublicId,
  };
}

export function applyLoteAct(lote: LoteRecord, act: LoteAct): { lote: LoteRecord; ok: boolean; message: string } {
  const next: LoteRecord = { ...lote, updatedAt: new Date().toISOString() };
  const cost = effectiveCost(next);

  if (act === 'produce') {
    if (next.cashCents < cost && cost > 0) {
      return { lote, ok: false, message: 'Caixa curto. Vende o que tem, ou descansa.' };
    }
    const canAfford = cost > 0 ? Math.floor(next.cashCents / cost) : next.capacity;
    const units = Math.max(0, Math.min(next.capacity, canAfford));
    if (!units) return { lote, ok: false, message: 'Não dá para produzir agora.' };
    next.cashCents -= units * cost;
    next.stock += units;
    next.madeTotal += units;
    next.log = `Produziu ${units} · ${next.product}. Estoque ${next.stock}.`;
    return { lote: next, ok: true, message: next.log };
  }

  if (act === 'sell') {
    if (next.stock <= 0) return { lote, ok: false, message: 'Estoque vazio. Produz primeiro.' };
    const want = demand(next);
    const sold = Math.min(next.stock, want);
    next.stock -= sold;
    next.cashCents += sold * next.priceCents;
    next.soldTotal += sold;
    next.log = `Vendeu ${sold} por ${fromCents(sold * next.priceCents)}.`;
    return advanceDay(next, next.log);
  }

  if (act === 'rest') {
    next.log = 'Descansou. Amanhece de novo.';
    return advanceDay(next, next.log);
  }

  const kind = act.replace('upgrade-', '') as 'stall' | 'tools' | 'sign';
  const level = kind === 'stall' ? next.stallLevel : kind === 'tools' ? next.toolsLevel : next.signLevel;
  if (level >= 3) return { lote, ok: false, message: 'Isso já está no máximo.' };
  const price = upgradeCost(level, kind === 'stall' ? 8000 : kind === 'tools' ? 7000 : 5000);
  if (next.cashCents < price) {
    return { lote, ok: false, message: `Precisa de ${fromCents(price)} para essa melhoria.` };
  }
  next.cashCents -= price;
  if (kind === 'stall') {
    next.stallLevel += 1;
    next.capacity += 2;
    next.log = `Banca maior. Agora produz ${next.capacity} por vez.`;
  } else if (kind === 'tools') {
    next.toolsLevel += 1;
    next.log = 'Ferramenta melhor. Cada unidade sai mais barata.';
  } else {
    next.signLevel += 1;
    next.quality = Math.min(5, next.quality + 1);
    next.log = 'Placa nova na estrada. Mais gente acha o lote.';
  }
  return { lote: next, ok: true, message: next.log };
}

function advanceDay(lote: LoteRecord, message: string) {
  const next = { ...lote, day: lote.day + 1 };
  next.event = rollEvent(next.day);
  if (next.event === 'chuva' && next.kind === 'produto' && next.stock > 0) {
    const lost = Math.max(1, Math.floor(next.stock * 0.2));
    next.stock -= lost;
    next.log = `${message} Chuva levou ${lost} do estoque.`;
  } else {
    const extra = eventLog(next.event, next.kind);
    next.log = extra ? `${message} ${extra}` : message;
  }
  return { lote: next, ok: true, message: next.log };
}
