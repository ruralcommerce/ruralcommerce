import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { notifyApprovalForRawRecord } from '@/lib/project-inscription-notify';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

const VALID_ACTIONS = ['approve', 'reject', 'delete'] as const;
type BulkAction = (typeof VALID_ACTIONS)[number];

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRecords(records: unknown[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string' && id.length > 0) : [];
  const action = typeof body.action === 'string' ? body.action : '';

  if (!ids.length) {
    return NextResponse.json({ ok: false, message: 'Nenhuma inscrição selecionada.' }, { status: 400 });
  }

  if (!VALID_ACTIONS.includes(action as BulkAction)) {
    return NextResponse.json({ ok: false, message: 'Ação inválida.' }, { status: 400 });
  }

  const records = (await readRecords()) as Array<Record<string, unknown>>;

  if (action === 'delete') {
    const idSet = new Set(ids);
    const remaining = records.filter((record) => !idSet.has(String(record.id || '')));
    const deletedCount = records.length - remaining.length;

    if (deletedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Inscrição não encontrada.' }, { status: 404 });
    }

    await writeRecords(remaining);
    return NextResponse.json({ ok: true, count: deletedCount });
  }

  const idSet = new Set(ids);
  let updatedCount = 0;
  const status = action === 'approve' ? 'approved' : 'rejected';
  const newlyApproved: Array<Record<string, unknown>> = [];

  const updatedRecords = records.map((record) => {
    if (!idSet.has(String(record.id || ''))) return record;

    updatedCount += 1;
    const previousUser = (record.user as Record<string, unknown>) || {};
    const wasApproved = record.status === 'approved';

    const updated = {
      ...record,
      status,
      updatedAt: new Date().toISOString(),
      user: {
        ...previousUser,
        accessStatus: status === 'approved' ? 'active' : 'pending',
      },
    };

    if (status === 'approved' && !wasApproved) {
      newlyApproved.push(updated);
    }

    return updated;
  });

  if (updatedCount === 0) {
    return NextResponse.json({ ok: false, message: 'Inscrição não encontrada.' }, { status: 404 });
  }

  await writeRecords(updatedRecords);

  for (const approvedRecord of newlyApproved) {
    await notifyApprovalForRawRecord(approvedRecord);
  }

  return NextResponse.json({ ok: true, count: updatedCount });
}
