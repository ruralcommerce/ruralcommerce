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
  getSementesVideoUploadUrl,
  headSementesVideo,
  isOwnedSementesVideoKey,
  normalizeSementesVideoType,
} from '@/lib/sementes-r2';
import { trimSementesVideoBuffer } from '@/lib/sementes-video-trim';
import type { SementeRecord } from '@/lib/sementes-types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function findByAuth(request: Request) {
  const token = readBearer(request);
  if (!token) return { kind: 'none' as const };
  if (verifyTeamToken(token)) return { kind: 'team' as const, token };
  return { kind: 'owner' as const, token };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function saveVideoKey(current: SementeRecord, key: string, contentType: string) {
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

export async function GET(request: Request) {
  const auth = findByAuth(request);
  const publicId = new URL(request.url).searchParams.get('publicId') || '';
  if (!publicId) return jsonError('Semente inválida.', 400);

  const data = await readSementes();
  const seed = data.seeds.find((item) => item.publicId === publicId);
  if (!seed?.videoKey) return jsonError('Sem verso ainda.', 404);

  if (auth.kind === 'none') {
    return jsonError('O verso não é público.', 403);
  }
  if (auth.kind === 'owner') {
    const owner = await findSementeByTokenHash(hashToken(auth.token));
    if (!owner || owner.id !== seed.id) {
      return jsonError('O verso não é público.', 403);
    }
  }

  if (!isSementesR2Ready()) {
    return jsonError('Vídeo não disponível.', 503);
  }

  const url = await getSementesVideoUrl(seed.videoKey);
  return NextResponse.json({ ok: true, url, contentType: seed.videoContentType || 'video/webm' });
}

export async function POST(request: Request) {
  const token = readBearer(request);
  if (!token) return jsonError('Sessão não encontrada.', 401);
  const current = await findSementeByTokenHash(hashToken(token));
  if (!current) return jsonError('Sessão não encontrada.', 401);

  if (!isSementesR2Ready()) {
    return jsonError('O armazém de vídeo ainda não está ligado neste servidor.', 503);
  }

  const headerType = request.headers.get('content-type') || '';
  if (headerType.includes('application/json')) {
    let body: { action?: string; contentType?: string; size?: number; fileName?: string; key?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonError('Não deu para ler o vídeo.', 400);
    }

    if (body.action === 'sign') {
      const contentType = normalizeSementesVideoType(body.contentType || '', body.fileName || '');
      const size = Number(body.size || 0);
      if (!contentType) return jsonError('Precisa ser vídeo.', 400);
      if (!size || size > SEMENTES_MAX_VIDEO_BYTES) {
        return jsonError('Esse vídeo pesou demais. Grava de novo pela câmera, 15 segundos.', 400);
      }
      const key = sementesVideoKey(current.publicId, videoExtension(contentType, body.fileName || ''));
      try {
        const uploadUrl = await getSementesVideoUploadUrl(key, contentType);
        return NextResponse.json({ ok: true, uploadUrl, key, contentType });
      } catch {
        return jsonError('Não deu para preparar o envio do vídeo.', 502);
      }
    }

    if (body.action === 'complete') {
      const contentType = normalizeSementesVideoType(body.contentType || '', '') || 'video/webm';
      const key = String(body.key || '');
      if (!isOwnedSementesVideoKey(key, current.publicId)) {
        return jsonError('Vídeo inválido.', 400);
      }
      try {
        await headSementesVideo(key);
      } catch {
        return jsonError('O vídeo não chegou inteiro. Tenta de novo.', 400);
      }
      return saveVideoKey(current, key, contentType);
    }

    return jsonError('Pedido inválido.', 400);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError('Não deu para ler o vídeo.', 400);
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size <= 0) {
    return jsonError('Manda um vídeo curto, até 15 segundos.', 400);
  }
  if (file.size > SEMENTES_MAX_VIDEO_BYTES) {
    return jsonError('Esse vídeo pesou demais. O app compacta até 15s; grava de novo se ainda falhar.', 400);
  }

  const contentType = normalizeSementesVideoType(file.type, file.name);
  if (!contentType) {
    return jsonError('Precisa ser vídeo.', 400);
  }

  try {
    const raw = Buffer.from(await file.arrayBuffer());
    const trimmed = await trimSementesVideoBuffer(raw, videoExtension(contentType, file.name));
    const buffer = trimmed?.buffer || raw;
    const storedType = trimmed?.contentType || contentType;
    const key = sementesVideoKey(current.publicId, videoExtension(storedType, file.name));
    await putSementesVideo(key, buffer, storedType);
    return saveVideoKey(current, key, storedType);
  } catch {
    return jsonError('Não deu para guardar o vídeo. Tenta de novo.', 502);
  }
}
