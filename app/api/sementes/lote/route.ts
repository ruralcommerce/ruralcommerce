import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { findLoteByTokenHash, saveLote, createLoteIds } from '@/lib/lote-store';
import { applyLoteAct, createLoteState, toCents } from '@/lib/lote-sim';
import { hashToken, readBearer } from '@/lib/sementes-auth';
import { findSementeByTokenHash } from '@/lib/sementes-store';
import type { LoteAct, LoteKind, LoteRecord, LoteView } from '@/lib/lote-types';
import { LOTE_KINDS } from '@/lib/lote-types';

export const runtime = 'nodejs';

function view(lote: LoteRecord): LoteView {
  const { tokenHash: _tokenHash, ...rest } = lote;
  return rest;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function asKind(value: unknown): LoteKind {
  return typeof value === 'string' && LOTE_KINDS.includes(value as LoteKind) ? (value as LoteKind) : 'produto';
}

function asAct(value: unknown): LoteAct | null {
  const acts: LoteAct[] = ['produce', 'sell', 'upgrade-stall', 'upgrade-tools', 'upgrade-sign', 'rest'];
  return typeof value === 'string' && acts.includes(value as LoteAct) ? (value as LoteAct) : null;
}

export async function GET(request: Request) {
  const token = readBearer(request);
  if (!token) return bad('Sessão não encontrada.', 401);
  const lote = await findLoteByTokenHash(hashToken(token));
  if (!lote) return bad('Sessão não encontrada.', 401);
  return NextResponse.json({ ok: true, token, lote: view(lote) });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad('Payload inválido.');
  }

  const action = typeof body.action === 'string' ? body.action : 'start';

  if (action === 'act') {
    const token = readBearer(request) || (typeof body.token === 'string' ? body.token : '');
    if (!token) return bad('Sessão não encontrada.', 401);
    const current = await findLoteByTokenHash(hashToken(token));
    if (!current) return bad('Sessão não encontrada.', 401);
    const act = asAct(body.act);
    if (!act) return bad('Ação inválida.');
    const result = applyLoteAct(current, act);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message, lote: view(current) }, { status: 400 });
    const saved = await saveLote(result.lote);
    return NextResponse.json({ ok: true, token, lote: view(saved), message: result.message });
  }

  let seedPublicId: string | undefined;
  let seedName = '';
  let seedProduct = '';
  let seedKind: LoteKind = asKind(body.kind);
  const seedToken = typeof body.seedToken === 'string' ? body.seedToken : '';
  if (seedToken) {
    const seed = await findSementeByTokenHash(hashToken(seedToken));
    if (seed) {
      seedPublicId = seed.publicId;
      seedName = seed.name;
      seedProduct = seed.solution.trim() || seed.problem.trim();
      if (seed.path === 'servico' || seed.path === 'produto') seedKind = seed.path;
    }
  }

  const product = String(body.product || seedProduct || '').trim();
  if (product.length < 3) return bad('Diz o que o lote vende. Uma frase.');
  const priceCents = toCents(Number(body.price));
  const costCents = toCents(Number(body.cost));
  const cashCents = toCents(Number(body.cash));
  if (priceCents < 100) return bad('O preço precisa ser o valor real da unidade, em reais.');
  if (costCents >= priceCents) return bad('O custo tem que ser menor que o preço. Senão o lote quebra.');
  if (cashCents < 0) return bad('Quanto tem hoje para começar?');

  const token = `lote_${randomBytes(18).toString('hex')}`;
  const ids = createLoteIds();
  const lote = createLoteState({
    ...ids,
    tokenHash: hashToken(token),
    name: String(body.name || seedName || '').trim(),
    business: String(body.business || '').trim() || product.slice(0, 42),
    product,
    kind: seedKind,
    priceCents,
    costCents,
    cashCents: cashCents || 20000,
    seedPublicId,
  });
  const saved = await saveLote(lote);
  return NextResponse.json({ ok: true, token, lote: view(saved) });
}
