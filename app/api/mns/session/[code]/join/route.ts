import { NextResponse } from 'next/server';
import { joinSession } from '@/lib/mns/store';
import type { MnsWorkRoute } from '@/lib/mns/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    forceNew?: boolean;
    participantId?: string;
    workRoute?: MnsWorkRoute;
  };
  const name = (body.name || '').trim();
  if (!name && !body.participantId) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const result = await joinSession(params.code, name || 'Participante', {
    forceNew: Boolean(body.forceNew),
    participantId: body.participantId,
    workRoute: body.workRoute,
  });

  if (!result) {
    return NextResponse.json({ error: 'Sala no disponible' }, { status: 404 });
  }

  const p = result.participant;
  return NextResponse.json({
    participantId: p.id,
    name: p.name,
    code: result.session.code,
    resumed: result.resumed,
    answers: p.answers,
    currentFicha: p.currentFicha,
    workRoute: p.workRoute,
    productLabel: p.productLabel,
    completedAt: p.completedAt || null,
    preCheck: p.preCheck || null,
    postCheck: p.postCheck || null,
  });
}
