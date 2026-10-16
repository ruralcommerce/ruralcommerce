import { NextResponse } from 'next/server';
import { saveParticipantResponse } from '@/lib/marca/store';
import type { MarcaCustomer, MarcaSectionPicks, MarcaWords } from '@/lib/marca/types';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as {
    participantId?: string;
    sectionPicks?: MarcaSectionPicks;
    paletteTones?: string[];
    styleImageIds?: string[];
    words?: Partial<MarcaWords>;
    perceptionPicks?: string[];
    freeText?: string;
    audioDataUrl?: string;
    customer?: MarcaCustomer;
    specialMeaning?: string;
    complete?: boolean;
  };

  if (!body.participantId) {
    return NextResponse.json({ error: 'participantId required' }, { status: 400 });
  }

  const participant = await saveParticipantResponse(params.code, body.participantId, {
    sectionPicks: body.sectionPicks,
    paletteTones: body.paletteTones,
    styleImageIds: body.styleImageIds,
    words: body.words
      ? {
          selected: body.words.selected,
          people: body.words.people,
          places: body.words.places,
          product: body.words.product,
        }
      : undefined,
    perceptionPicks: Array.isArray(body.perceptionPicks) ? body.perceptionPicks.slice(0, 5) : undefined,
    freeText: body.freeText,
    audioDataUrl: body.audioDataUrl,
    customer: body.customer,
    specialMeaning: body.specialMeaning,
    completedAt: body.complete ? new Date().toISOString() : undefined,
  });

  if (!participant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, participantId: participant.id, completedAt: participant.completedAt });
}
