import { NextResponse } from 'next/server';
import { saveParticipantAnswers } from '@/lib/mns/store';
import type { MnsAnswers, MnsCheckSnapshot, MnsFichaId, MnsWorkRoute } from '@/lib/mns/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as {
    participantId?: string;
    answers?: MnsAnswers;
    currentFicha?: MnsFichaId;
    workRoute?: MnsWorkRoute;
    productLabel?: string;
    companyName?: string;
    preCheck?: MnsCheckSnapshot | null;
    postCheck?: MnsCheckSnapshot | null;
    complete?: boolean;
  };

  if (!body.participantId) {
    return NextResponse.json({ error: 'participantId required' }, { status: 400 });
  }

  const participant = await saveParticipantAnswers(params.code, body.participantId, {
    answers: body.answers,
    currentFicha: body.currentFicha,
    workRoute: body.workRoute,
    productLabel: body.productLabel,
    companyName: body.companyName,
    preCheck: body.preCheck,
    postCheck: body.postCheck,
    complete: body.complete,
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    participantId: participant.id,
    completedAt: participant.completedAt,
    currentFicha: participant.currentFicha,
    preCheck: participant.preCheck || null,
    postCheck: participant.postCheck || null,
  });
}
