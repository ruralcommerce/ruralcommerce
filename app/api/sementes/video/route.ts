import { NextResponse } from 'next/server';
import { findSementeByTokenHash, mutateSemente, readSementes } from '@/lib/sementes-store';
import { hashToken, readBearer, verifyTeamToken, toOwnerView } from '@/lib/sementes-auth';
import {
  isSementesR2Ready,
  putSementesVideo,
  sementesVideoKey,
  SEMENTES_MAX_VIDEO_BYTES,
  videoExtension,
  getSementesVideoUrl,
} from '@/lib/sementes-r2';

export const runtime = 'nodejs';

function findByAuth(request: Request) {
  const token = readBearer(request);
  if (!token) return { kind: 'none' as const };
  if (verifyTeamToken(token)) return { kind: 'team' as const, token };
  return { kind: 'owner' as const, token };
}

export async function GET(request: Request) {
  const auth = findByAuth(request);
  const publicId = new URL(request.url).searchParams.get('publicId') || '';
  if (!publicId) return NextResponse.json({ ok: false, message: 'Semente inválida.' }, { status: 400 });

  const data = await readSementes();
  const seed = data.seeds.find((item) => item.publicId === publicId);
  if (!seed?.videoKey) return NextResponse.json({ ok: false, message: 'Sem verso ainda.' }, { status: 404 });

  if (auth.kind === 'none') {
    return NextResponse.json({ ok: false, message: 'O verso não é público.' }, { status: 403 });
  }
  if (auth.kind === 'owner') {
    const owner = await findSementeByTokenHash(hashToken(auth.token));
    if (!owner || owner.id !== seed.id) {
      return NextResponse.json({ ok: false, message: 'O verso não é público.' }, { status: 403 });
    }
  }

  if (!isSementesR2Ready()) {
    return NextResponse.json({ ok: false, message: 'Vídeo não disponível.' }, { status: 503 });
  }

  const url = await getSementesVideoUrl(seed.videoKey);
  return NextResponse.json({ ok: true, url, contentType: seed.videoContentType || 'video/webm' });
}

export async function POST(request: Request) {
  const token = readBearer(request);
  if (!token) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });
  const current = await findSementeByTokenHash(hashToken(token));
  if (!current) return NextResponse.json({ ok: false, message: 'Sessão não encontrada.' }, { status: 401 });

  if (!isSementesR2Ready()) {
    return NextResponse.json(
      { ok: false, message: 'O armazém de vídeo ainda não está ligado neste servidor.' },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'Não deu para ler o vídeo.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ ok: false, message: 'Manda um vídeo curto, até 15 segundos.' }, { status: 400 });
  }
  if (file.size > SEMENTES_MAX_VIDEO_BYTES) {
    return NextResponse.json({ ok: false, message: 'Esse vídeo pesou demais. Grava de novo, mais curto.' }, { status: 400 });
  }

  const contentType = file.type || 'video/webm';
  if (!contentType.startsWith('video/')) {
    return NextResponse.json({ ok: false, message: 'Precisa ser vídeo.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = sementesVideoKey(current.publicId, videoExtension(contentType, file.name));
  await putSementesVideo(key, buffer, contentType);

  const seed = await mutateSemente(
    (item) => item.id === current.id,
    (item) => ({
      ...item,
      videoKey: key,
      videoContentType: contentType,
      step: Math.max(item.step, 6),
    })
  );

  return NextResponse.json({ ok: true, seed: seed ? toOwnerView(seed) : toOwnerView(current) });
}
