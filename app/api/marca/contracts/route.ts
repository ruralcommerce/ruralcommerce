import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/marca/auth';
import { createContract, listContracts } from '@/lib/marca/store';
import type { MarcaLocale } from '@/lib/marca/types';

export const runtime = 'nodejs';

export async function GET() {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const contracts = await listContracts();
  return NextResponse.json({ contracts });
}

export async function POST(request: Request) {
  if (!requireStaff()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    clientName?: string;
    title?: string;
    notes?: string;
    locale?: MarcaLocale;
    createdBy?: string;
  };

  if (!body.clientName?.trim()) {
    return NextResponse.json({ error: 'clientName required' }, { status: 400 });
  }

  const contract = await createContract({
    clientName: body.clientName,
    title: body.title || '',
    notes: body.notes,
    locale: body.locale,
    createdBy: body.createdBy,
  });

  return NextResponse.json({ contract }, { status: 201 });
}
