import { NextResponse } from 'next/server';
import { joinContract } from '@/lib/marca/store';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    forceNew?: boolean;
    participantId?: string;
  };
  const name = (body.name || '').trim();
  if (!name && !body.participantId) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const result = await joinContract(params.code, name || 'Participante', {
    forceNew: Boolean(body.forceNew),
    participantId: body.participantId,
  });
  if (!result) {
    return NextResponse.json({ error: 'Oficina no disponible' }, { status: 404 });
  }

  const p = result.participant;
  return NextResponse.json({
    participantId: p.id,
    name: p.name,
    code: result.contract.code,
    resumed: result.resumed,
    paletteTones: p.paletteTones || [],
    styleImageIds: p.styleImageIds || [],
    completedAt: p.completedAt || null,
  });
}
