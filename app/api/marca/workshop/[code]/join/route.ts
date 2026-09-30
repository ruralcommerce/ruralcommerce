import { NextResponse } from 'next/server';
import { joinContract } from '@/lib/marca/store';

export const runtime = 'nodejs';

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = (body.name || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const result = await joinContract(params.code, name);
  if (!result) {
    return NextResponse.json({ error: 'Oficina no disponible' }, { status: 404 });
  }

  return NextResponse.json({
    participantId: result.participant.id,
    name: result.participant.name,
    code: result.contract.code,
  });
}
