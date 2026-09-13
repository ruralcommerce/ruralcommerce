import { NextResponse } from 'next/server';
import { readSementes, setSementeFlipAt, setSementeStatus } from '@/lib/sementes-store';
import { readBearer, signTeamToken, toTeamView, verifyTeamPassword, verifyTeamToken } from '@/lib/sementes-auth';
import { getSementesVideoUrl, isSementesR2Ready } from '@/lib/sementes-r2';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ ok: false, message: 'Equipe não autenticada.' }, { status: 401 });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const action = typeof body.action === 'string' ? body.action : 'login';

  if (action === 'login') {
    const password = String(body.password || '');
    if (!verifyTeamPassword(password)) {
      return NextResponse.json({ ok: false, message: 'Senha não bate.' }, { status: 401 });
    }
    return NextResponse.json({ ok: true, token: signTeamToken() });
  }

  const token = readBearer(request);
  if (!token || !verifyTeamToken(token)) return unauthorized();

  if (action === 'flip') {
    const when = new Date(Date.now() + 8000).toISOString();
    const room = await setSementeFlipAt(when);
    return NextResponse.json({ ok: true, room });
  }

  if (action === 'status') {
    const publicId = String(body.publicId || '');
    const seed = await setSementeStatus(publicId, body.status);
    if (!seed) return NextResponse.json({ ok: false, message: 'Semente não encontrada.' }, { status: 404 });
    const data = await readSementes();
    return NextResponse.json({ ok: true, seed: toTeamView(seed, data.seeds) });
  }

  return NextResponse.json({ ok: false, message: 'Ação inválida.' }, { status: 400 });
}

export async function GET(request: Request) {
  const token = readBearer(request);
  if (!token || !verifyTeamToken(token)) return unauthorized();

  const data = await readSementes();
  const seeds = [...data.seeds]
    .map((seed) => toTeamView(seed, data.seeds))
    .sort((a, b) => b.score - a.score);

  const withVideo = await Promise.all(
    seeds.map(async (seed) => {
      if (!seed.hasVideo || !isSementesR2Ready()) return seed;
      const full = data.seeds.find((item) => item.publicId === seed.publicId);
      if (!full?.videoKey) return seed;
      try {
        const url = await getSementesVideoUrl(full.videoKey);
        return { ...seed, videoUrl: url };
      } catch {
        return seed;
      }
    })
  );

  return NextResponse.json({ ok: true, room: data.room, seeds: withVideo });
}
