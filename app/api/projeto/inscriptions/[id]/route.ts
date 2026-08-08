import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { notifyApprovalForRawRecord } from '@/lib/project-inscription-notify';
import { isProjectTeamTag, normalizeProjectTeamTag } from '@/lib/project-team-tags';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const hasStatus = typeof body.status === 'string' && body.status.length > 0;
  const hasTeamTag = Object.prototype.hasOwnProperty.call(body, 'teamTag');
  const status = hasStatus ? String(body.status) : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;

  if (!hasStatus && !hasTeamTag) {
    return NextResponse.json({ ok: false, message: 'Nada para actualizar.' }, { status: 400 });
  }

  if (hasStatus && !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ ok: false, message: 'Status inválido.' }, { status: 400 });
  }

  if (hasTeamTag && body.teamTag !== null && body.teamTag !== '' && !isProjectTeamTag(body.teamTag)) {
    return NextResponse.json({ ok: false, message: 'Etiqueta inválida.' }, { status: 400 });
  }

  const records = await readRecords();
  const typedRecords = records as Array<Record<string, unknown>>;
  const index = typedRecords.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Inscrição não encontrada.' }, { status: 404 });
  }

  const previousRecord = typedRecords[index] as Record<string, unknown>;
  const previousUser = (previousRecord.user as Record<string, unknown>) || {};
  const wasApproved = previousRecord.status === 'approved';

  const nextRecord: Record<string, unknown> = {
    ...previousRecord,
    updatedAt: new Date().toISOString(),
  };

  if (hasStatus) {
    nextRecord.status = status;
    nextRecord.user = {
      ...previousUser,
      accessStatus: status === 'approved' ? 'active' : 'pending',
    };
    if (typeof notes === 'string') {
      nextRecord.notes = notes;
    }
  }

  if (hasTeamTag) {
    nextRecord.teamTag = normalizeProjectTeamTag(body.teamTag);
  }

  typedRecords[index] = nextRecord;
  await writeRecords(typedRecords);

  if (hasStatus && status === 'approved' && !wasApproved) {
    await notifyApprovalForRawRecord(typedRecords[index]);
  }

  return NextResponse.json({ ok: true, record: typedRecords[index] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const records = await readRecords();
  const typedRecords = records as Array<Record<string, unknown>>;
  const index = typedRecords.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Inscrição não encontrada.' }, { status: 404 });
  }

  typedRecords.splice(index, 1);
  await writeRecords(typedRecords);
  return NextResponse.json({ ok: true });
}
