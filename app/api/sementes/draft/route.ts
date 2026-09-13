import { NextResponse } from 'next/server';
import { findSementeByTokenHash, updateSementeByTokenHash } from '@/lib/sementes-store';
import { hashToken, readBearer, toOwnerView } from '@/lib/sementes-auth';
import type { SementeDraftPatch } from '@/lib/sementes-types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const token = readBearer(request);
  if (!token) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });
  const seed = await findSementeByTokenHash(hashToken(token));
  if (!seed) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });
  return NextResponse.json({ ok: true, seed: toOwnerView(seed) });
}

export async function PUT(request: Request) {
  const token = readBearer(request);
  if (!token) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });

  let body: SementeDraftPatch;
  try {
    body = (await request.json()) as SementeDraftPatch;
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const seed = await updateSementeByTokenHash(hashToken(token), body);
  if (!seed) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });
  return NextResponse.json({ ok: true, seed: toOwnerView(seed) });
}
