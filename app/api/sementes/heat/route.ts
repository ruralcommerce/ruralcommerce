import { NextResponse } from 'next/server';
import { mutateSemente } from '@/lib/sementes-store';
import { hashDeviceId, toPublicCard } from '@/lib/sementes-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const publicId = String(body.publicId || '');
  const deviceId = String(body.deviceId || '');
  if (!publicId || deviceId.length < 8) {
    return NextResponse.json({ ok: false, message: 'Pedido inválido.' }, { status: 400 });
  }

  const voter = hashDeviceId(deviceId);
  const seed = await mutateSemente(
    (item) => item.publicId === publicId && Boolean(item.publishedAt),
    (item) => {
      if (item.heatVoters.includes(voter)) return { ...item };
      return {
        ...item,
        heat: item.heat + 1,
        heatVoters: [...item.heatVoters, voter].slice(-400),
      };
    }
  );

  if (!seed) return NextResponse.json({ ok: false, message: 'Semente não está no palco.' }, { status: 404 });
  return NextResponse.json({ ok: true, card: toPublicCard(seed) });
}
