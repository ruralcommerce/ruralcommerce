import { NextResponse } from 'next/server';
import { cleanDeviceId, parseGeo } from '@/lib/actividades/geo';
import { jsonError } from '@/lib/actividades/http';
import { publicActivity, publicParticipant } from '@/lib/actividades/public';
import { confirmByToken, findPublicByToken } from '@/lib/actividades/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const found = await findPublicByToken(params.token);
  if (!found) return NextResponse.json({ ok: false, message: 'No encontrada' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    activity: publicActivity(found.activity),
    participant: publicParticipant(found.participant),
  });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const body = (await request.json().catch(() => ({}))) as { geo?: unknown; deviceId?: string };
    const result = await confirmByToken(params.token, parseGeo(body.geo), cleanDeviceId(body.deviceId));
    return NextResponse.json({
      ok: true,
      already: result.already,
      activity: publicActivity(result.activity),
      participant: publicParticipant(result.participant),
    });
  } catch (err) {
    return jsonError(err);
  }
}
