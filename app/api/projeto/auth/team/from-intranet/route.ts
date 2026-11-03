import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getSessionFromRequest, sessionHas } from '@/lib/intranet/auth';
import { signTeamSession } from '@/lib/project-team-session';
import { appendAuditEntry } from '@/lib/project-audit-log';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return { ...record, user: safeUser };
}

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Issue project-team Bearer from unified intranet session (cookie). */
export async function POST(request: Request) {
  const intranet = getSessionFromRequest(request);
  if (!intranet || !sessionHas(intranet, 'projeto.access')) {
    return NextResponse.json({ ok: false, message: 'Sem acesso ao módulo de projeto.' }, { status: 401 });
  }

  const role = intranet.scope?.memberRole || (intranet.profile === 'staff_interno' ? 'admin' : 'technician');
  const token = signTeamSession({
    memberId: intranet.userId,
    name: intranet.name,
    email: intranet.email,
    role,
  });

  const records = ((await readRecords()) as Array<Record<string, unknown>>).map(sanitizeRecord);

  await appendAuditEntry({
    action: 'team_login',
    actorType: 'team',
    actorId: intranet.userId,
    actorName: intranet.name,
    targetRecordId: intranet.userId,
    metadata: { email: intranet.email, role, via: 'intranet' },
  });

  return NextResponse.json({
    ok: true,
    token,
    member: {
      id: intranet.userId,
      name: intranet.name,
      email: intranet.email,
      role,
      active: true,
    },
    records,
  });
}
