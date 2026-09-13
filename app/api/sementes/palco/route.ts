import { NextResponse } from 'next/server';
import { findSementeByTokenHash, mutateSemente, readSementes } from '@/lib/sementes-store';
import { hashToken, readBearer, toOwnerView, toPublicCard } from '@/lib/sementes-auth';

export const runtime = 'nodejs';

export async function GET() {
  const data = await readSementes();
  const cards = data.seeds
    .filter((seed) => seed.status !== 'draft' && seed.publishedAt)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .map(toPublicCard);
  return NextResponse.json({ ok: true, room: data.room, cards });
}

export async function POST(request: Request) {
  const token = readBearer(request);
  if (!token) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });
  const current = await findSementeByTokenHash(hashToken(token));
  if (!current) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });

  const seed = await mutateSemente(
    (item) => item.id === current.id,
    (item) => ({
      ...item,
      status: item.status === 'draft' ? 'published' : item.status,
      publishedAt: item.publishedAt || new Date().toISOString(),
      step: 7,
    })
  );
  if (!seed) return NextResponse.json({ ok: false, message: 'Não deu para publicar.' }, { status: 500 });
  return NextResponse.json({ ok: true, seed: toOwnerView(seed) });
}
