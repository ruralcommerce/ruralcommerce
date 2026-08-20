import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { sanitizeTeamMember, upsertTeamMember, verifyTeamMemberCredentials } from '@/lib/project-team-members';
import { signTeamSession } from '@/lib/project-team-session';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');
const TEAM_FILE = path.join(process.cwd(), 'data', 'project-team-members.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
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

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return {
    ...record,
    user: safeUser,
  };
}

async function teamMembersConfigured() {
  try {
    const text = await readFile(TEAM_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254).toLowerCase();
  const password = trimField(body.password, 128);
  const legacyPassword = trimField(body.password, 128);
  const expectedPassword = (process.env.PROJETO_TEAM_PASSWORD || '').trim();
  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const safeRecords = records.map((record) => sanitizeRecord(record));

  if (email) {
    const member = await verifyTeamMemberCredentials(email, password);
    if (!member) {
      return NextResponse.json({ ok: false, message: 'Credenciais da equipe inválidas.' }, { status: 401 });
    }

    const token = signTeamSession({
      memberId: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    });

    await appendAuditEntry({
      action: 'team_login',
      actorType: 'team',
      actorId: member.id,
      actorName: member.name,
      targetRecordId: member.id,
      metadata: { email: member.email, role: member.role },
    });

    return NextResponse.json({
      ok: true,
      token,
      member: sanitizeTeamMember(member),
      records: safeRecords,
    });
  }

  if (!(await teamMembersConfigured()) && expectedPassword && legacyPassword === expectedPassword) {
    const token = signTeamSession({
      memberId: 'team-legacy',
      name: 'Equipe',
      email: 'team@legacy',
      role: 'legacy',
    });

    return NextResponse.json({
      ok: true,
      token,
      member: {
        id: 'team-legacy',
        name: 'Equipe',
        email: 'team@legacy',
        role: 'legacy',
        active: true,
      },
      records: safeRecords,
    });
  }

  if (!expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Equipe não configurada.' }, { status: 500 });
  }

  if (!legacyPassword || legacyPassword !== expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Senha da equipe inválida.' }, { status: 401 });
  }

  const token = signTeamSession({
    memberId: 'team-legacy',
    name: 'Equipe',
    email: 'team@legacy',
    role: 'legacy',
  });

  return NextResponse.json({
    ok: true,
    token,
    member: {
      id: 'team-legacy',
      name: 'Equipe',
      email: 'team@legacy',
      role: 'legacy',
      active: true,
    },
    records: safeRecords,
  });
}
