import { NextResponse } from 'next/server';
import { cleanDeviceId, parseGeo } from '@/lib/actividades/geo';
import { jsonError } from '@/lib/actividades/http';
import { publicActivity, publicParticipant } from '@/lib/actividades/public';
import { checkInWithImpulsa, findPublicByInvite } from '@/lib/actividades/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { code: string } }) {
  const activity = await findPublicByInvite(params.code);
  if (!activity) return NextResponse.json({ ok: false, message: 'No encontrada' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    activity: {
      ...publicActivity(activity),
      checkInOpen: activity.status === 'abierta',
      presentCount: activity.participants.filter((person) => person.state === 'presente').length,
      listCount: activity.participants.length,
    },
  });
}

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      geo?: unknown;
      deviceId?: string;
    };
    const result = await checkInWithImpulsa(
      params.code,
      body.email || '',
      body.password || '',
      parseGeo(body.geo),
      cleanDeviceId(body.deviceId)
    );
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
