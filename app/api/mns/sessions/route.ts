import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { createSession, listSessions } from '@/lib/mns/store';
import type { MnsLocale } from '@/lib/mns/types';

export const runtime = 'nodejs';

export async function GET() {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    groupName?: string;
    title?: string;
    notes?: string;
    locale?: MnsLocale;
    createdBy?: string;
  };

  if (!body.groupName?.trim()) {
    return NextResponse.json({ error: 'groupName required' }, { status: 400 });
  }

  const session = await createSession({
    groupName: body.groupName,
    title: body.title || '',
    notes: body.notes,
    locale: body.locale,
    createdBy: body.createdBy,
  });

  return NextResponse.json({ session }, { status: 201 });
}
