import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/actividades/http';
import { publicActivity, publicParticipant } from '@/lib/actividades/public';
import { enrollByInvite, findPublicByInvite } from '@/lib/actividades/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { code: string } }) {
  const activity = await findPublicByInvite(params.code);
  if (!activity) return NextResponse.json({ ok: false, message: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ ok: true, activity: publicActivity(activity) });
}

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      phone?: string;
      email?: string;
      organization?: string;
    };
    const result = await enrollByInvite(params.code, body);
    return NextResponse.json({
      ok: true,
      already: result.already,
      activity: publicActivity(result.activity),
      participant: publicParticipant(result.participant, true),
    });
  } catch (err) {
    return jsonError(err);
  }
}
