import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { getSessionById, updateSession } from '@/lib/mns/store';
import type { MnsLocale, MnsSessionStatus } from '@/lib/mns/types';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const session = await getSessionById(params.id);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    groupName?: string;
    title?: string;
    notes?: string;
    status?: MnsSessionStatus;
    locale?: MnsLocale;
  };
  const session = await updateSession(params.id, body);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session });
}
