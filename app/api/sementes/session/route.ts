import { NextResponse } from 'next/server';
import {
  findSementeByTokenHash,
  findSementeByWhatsapp,
  replaceSementeToken,
  createSementeRecord,
} from '@/lib/sementes-store';
import {
  hashPin,
  hashToken,
  isValidPin,
  newParticipantToken,
  normalizeWhatsapp,
  toOwnerView,
  verifyPin,
} from '@/lib/sementes-auth';
import { sementesLocale } from '@/lib/sementes-copy';

export const runtime = 'nodejs';

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad('Payload inválido.');
  }

  const action = typeof body.action === 'string' ? body.action : 'plant';
  const locale = sementesLocale(String(body.locale || ''));

  if (action === 'resume') {
    const token = typeof body.token === 'string' ? body.token : '';
    if (!token) return bad('Sessão não encontrada.', 401);
    const seed = await findSementeByTokenHash(hashToken(token));
    if (!seed) return bad('Sessão não encontrada.', 401);
    return NextResponse.json({ ok: true, token, seed: toOwnerView(seed) });
  }

  if (action === 'entrar') {
    const whatsapp = normalizeWhatsapp(String(body.whatsapp || ''));
    const pin = String(body.pin || '');
    if (whatsapp.length < 8) return bad('WhatsApp inválido.');
    if (!isValidPin(pin)) return bad('PIN de 4 dígitos.');
    const existing = await findSementeByWhatsapp(whatsapp);
    if (!existing || !verifyPin(pin, existing.pinHash)) {
      return bad('Não achei essa semente. Confere WhatsApp e PIN.', 401);
    }
    const token = newParticipantToken();
    const updated = await replaceSementeToken(existing.id, hashToken(token));
    if (!updated) return bad('Não deu para entrar.', 500);
    return NextResponse.json({ ok: true, token, seed: toOwnerView(updated) });
  }

  const name = String(body.name || '').trim();
  const whatsapp = normalizeWhatsapp(String(body.whatsapp || ''));
  const pin = String(body.pin || '');
  if (name.length < 2) return bad('Conta teu nome (só a gente vê).');
  if (whatsapp.length < 8) return bad('WhatsApp ajuda a te chamar se a semente for selecionada.');
  if (!isValidPin(pin)) return bad('Escolhe um PIN de 4 números.');

  const existing = await findSementeByWhatsapp(whatsapp);
  if (existing) {
    if (!verifyPin(pin, existing.pinHash)) {
      return bad('Esse WhatsApp já plantou. Entra com o mesmo PIN.');
    }
    const token = newParticipantToken();
    const updated = await replaceSementeToken(existing.id, hashToken(token));
    if (!updated) return bad('Não deu para entrar.', 500);
    return NextResponse.json({ ok: true, token, seed: toOwnerView(updated), resumed: true });
  }

  const token = newParticipantToken();
  const record = await createSementeRecord({
    name,
    whatsapp,
    pinHash: hashPin(pin),
    tokenHash: hashToken(token),
    locale,
  });

  return NextResponse.json({ ok: true, token, seed: toOwnerView(record) });
}
