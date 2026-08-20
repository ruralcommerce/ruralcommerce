import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { hashPassword, verifyPassword } from '@/lib/project-password';

export type TeamMemberRole = 'master' | 'technician' | 'admin';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
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
  const { passwordHash, ...safe } = member;
  return safe;
}

export async function findTeamMemberByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const members = await readTeamMembers();
  return members.find((member) => member.active && member.email.toLowerCase() === normalized) || null;
}

export async function verifyTeamMemberCredentials(email: string, password: string) {
  const member = await findTeamMemberByEmail(email);
  if (!member) return null;
  if (!verifyPassword(password, member.passwordHash)) return null;
  return member;
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
