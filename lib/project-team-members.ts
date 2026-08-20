import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { createPasswordResetToken, hashPassword, verifyPassword } from '@/lib/project-password';

export type TeamMemberRole = 'master' | 'technician' | 'admin';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  passwordHash?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  invitedAt?: string;
  invitedBy?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
};

export type PublicTeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  invitedAt?: string;
  status: 'invited' | 'active';
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-team-members.json');

export async function readTeamMembers(): Promise<TeamMember[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as TeamMember[]) : [];
  } catch {
    return [];
  }
}

async function writeTeamMembers(members: TeamMember[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
}

export function sanitizeTeamMember(member: TeamMember) {
  const { passwordHash, inviteToken, inviteExpiresAt, ...safe } = member;
  return safe;
}

export function toPublicTeamMember(member: TeamMember): PublicTeamMember {
  const hasPassword = Boolean(member.passwordHash);
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    active: member.active,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    invitedAt: member.invitedAt,
    status: member.active && hasPassword ? 'active' : 'invited',
  };
}

export async function findTeamMemberByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const members = await readTeamMembers();
  return members.find((member) => member.email.toLowerCase() === normalized) || null;
}

export async function verifyTeamMemberCredentials(email: string, password: string) {
  const member = await findTeamMemberByEmail(email);
  if (!member || !member.active || !member.passwordHash) return null;
  if (!verifyPassword(password, member.passwordHash)) return null;
  return member;
}

export async function findTeamMemberByInviteToken(token: string) {
  const normalized = token.trim();
  if (!normalized) return null;
  const members = await readTeamMembers();
  const member = members.find((item) => item.inviteToken === normalized) || null;
  if (!member?.inviteExpiresAt) return null;
  if (Date.parse(member.inviteExpiresAt) < Date.now()) return null;
  return member;
}

export async function createOrRefreshTeamInvite(input: {
  email: string;
  invitedBy: string;
  role?: TeamMemberRole;
}) {
  const members = await readTeamMembers();
  const now = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();
  const token = createPasswordResetToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const index = members.findIndex((member) => member.email.toLowerCase() === normalizedEmail);

  if (index !== -1 && members[index].active && members[index].passwordHash) {
    return { ok: false as const, reason: 'exists' as const };
  }

  if (index === -1) {
    members.push({
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: '',
      email: normalizedEmail,
      role: input.role || 'technician',
      active: false,
      createdAt: now,
      updatedAt: now,
      invitedAt: now,
      invitedBy: input.invitedBy,
      inviteToken: token,
      inviteExpiresAt: expiresAt,
    });
  } else {
    members[index] = {
      ...members[index],
      role: input.role || members[index].role || 'technician',
      active: false,
      updatedAt: now,
      invitedAt: now,
      invitedBy: input.invitedBy,
      inviteToken: token,
      inviteExpiresAt: expiresAt,
    };
  }

  await writeTeamMembers(members);
  const member = members[index === -1 ? members.length - 1 : index];
  return { ok: true as const, member, token };
}

export async function completeTeamInvite(input: { token: string; name: string; password: string }) {
  const members = await readTeamMembers();
  const index = members.findIndex((member) => member.inviteToken === input.token.trim());
  if (index === -1) return { ok: false as const, reason: 'invalid' as const };

  const member = members[index];
  if (!member.inviteExpiresAt || Date.parse(member.inviteExpiresAt) < Date.now()) {
    return { ok: false as const, reason: 'expired' as const };
  }

  const now = new Date().toISOString();
  members[index] = {
    ...member,
    name: input.name.trim(),
    passwordHash: hashPassword(input.password),
    active: true,
    updatedAt: now,
    inviteToken: undefined,
    inviteExpiresAt: undefined,
  };

  await writeTeamMembers(members);
  return { ok: true as const, member: members[index] };
}

export async function upsertTeamMember(input: {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  password: string;
  active?: boolean;
}) {
  const members = await readTeamMembers();
  const now = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = hashPassword(input.password);
  const index = members.findIndex(
    (member) => member.id === input.id || member.email.toLowerCase() === normalizedEmail
  );

  if (index === -1) {
    members.push({
      id: input.id,
      name: input.name.trim(),
      email: normalizedEmail,
      role: input.role,
      passwordHash,
      active: input.active ?? true,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    members[index] = {
      ...members[index],
      name: input.name.trim(),
      email: normalizedEmail,
      role: input.role,
      passwordHash,
      active: input.active ?? members[index].active,
      updatedAt: now,
    };
  }

  await writeTeamMembers(members);
  return members[index === -1 ? members.length - 1 : index];
}
