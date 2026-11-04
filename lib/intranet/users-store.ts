import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { hashPassword, verifyPassword } from '@/lib/project-password';
import {
  defaultPermissionsFor,
  ROLE_DEFAULT_PERMISSIONS,
  type IntranetPermission,
  type IntranetProfile,
  type IntranetRole,
  type IntranetScope,
  type IntranetUser,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'intranet-users.json');
const TEAM_FILE = path.join(DATA_DIR, 'project-team-members.json');
const INSCRIPTIONS_FILE = path.join(DATA_DIR, 'project-inscriptions.json');
const MIGRATION_FLAG = path.join(DATA_DIR, 'intranet-unified-migrated.json');

type UsersFile = { users: IntranetUser[] };

function now() {
  return new Date().toISOString();
}

function isHashedPassword(value: string) {
  return Boolean(value && value.includes(':') && value.length > 40);
}

function normalizeUser(raw: Partial<IntranetUser> & { email: string }): IntranetUser {
  const role = (raw.role || 'viewer') as IntranetRole;
  const profile = (raw.profile || 'staff_interno') as IntranetProfile;
  const scope = raw.scope || {};
  const permissions =
    raw.permissions?.length
      ? raw.permissions
      : defaultPermissionsFor(profile, role, scope.memberRole);
  const password = raw.password || '';
  return {
    id: raw.id || `usr_${Date.now().toString(36)}`,
    name: raw.name || raw.email.split('@')[0],
    email: raw.email.trim().toLowerCase(),
    password,
    passwordHashed: raw.passwordHashed ?? isHashedPassword(password),
    passwordReset: raw.passwordReset,
    role,
    profile,
    permissions,
    scope,
    active: raw.active !== false,
    kind: raw.kind || 'user',
    linkedTeamMemberId: raw.linkedTeamMemberId,
    linkedInscriptionId: raw.linkedInscriptionId || scope.inscriptionId,
    createdAt: raw.createdAt || now(),
    updatedAt: raw.updatedAt || now(),
  };
}

function seedUsers(): IntranetUser[] {
  const ts = now();
  const plain = process.env.RC_INTRANET_PASSWORD || process.env.EDITOR_BASIC_PASSWORD || 'ruralcommerce123';
  return [
    normalizeUser({
      id: 'usr_admin',
      name: 'Equipo Rural Commerce',
      email: 'equipo@ruralcommerceglobal.com',
      password: hashPassword(plain),
      passwordHashed: true,
      role: 'admin',
      profile: 'staff_interno',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.admin],
      scope: {},
      active: true,
      kind: 'user',
      createdAt: ts,
      updatedAt: ts,
    }),
  ];
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function migrateInto(file: UsersFile): Promise<UsersFile> {
  const flag = await readJsonFile<{ done?: boolean }>(MIGRATION_FLAG, {});
  if (flag.done) {
    return { users: file.users.map((u) => normalizeUser(u)) };
  }

  const byEmail = new Map<string, IntranetUser>();
  for (const u of file.users) {
    const normalized = normalizeUser(u);
    // re-hash legacy plain passwords for existing staff
    if (!normalized.passwordHashed && normalized.password) {
      normalized.password = hashPassword(normalized.password);
      normalized.passwordHashed = true;
    }
    if (!normalized.profile) normalized.profile = 'staff_interno';
    byEmail.set(normalized.email, normalized);
  }

  const team = await readJsonFile<
    Array<{
      id: string;
      name: string;
      email: string;
      role?: 'master' | 'technician' | 'admin';
      passwordHash?: string;
      active?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>
  >(TEAM_FILE, []);

  for (const member of team) {
    const email = (member.email || '').trim().toLowerCase();
    if (!email || !member.passwordHash) continue;
    const existing = byEmail.get(email);
    const memberRole = member.role || 'technician';
    const permissions = defaultPermissionsFor('equipe_projeto', 'editor', memberRole);
    if (existing) {
      existing.profile = existing.profile === 'staff_interno' ? existing.profile : 'equipe_projeto';
      if (existing.profile === 'equipe_projeto') {
        existing.permissions = Array.from(new Set([...existing.permissions, ...permissions]));
        existing.scope = { ...existing.scope, memberRole };
      } else {
        // staff who is also team: add projeto perms
        existing.permissions = Array.from(new Set([...existing.permissions, ...permissions]));
        existing.scope = { ...existing.scope, memberRole };
      }
      existing.linkedTeamMemberId = member.id;
      if (!existing.passwordHashed && member.passwordHash) {
        existing.password = member.passwordHash;
        existing.passwordHashed = true;
      }
      byEmail.set(email, existing);
      continue;
    }
    byEmail.set(
      email,
      normalizeUser({
        id: `usr_team_${member.id}`,
        name: member.name,
        email,
        password: member.passwordHash,
        passwordHashed: true,
        role: memberRole === 'technician' ? 'viewer' : 'editor',
        profile: 'equipe_projeto',
        permissions,
        scope: { memberRole },
        active: member.active !== false,
        kind: 'user',
        linkedTeamMemberId: member.id,
        createdAt: member.createdAt || now(),
        updatedAt: member.updatedAt || now(),
      })
    );
  }

  const inscriptions = await readJsonFile<
    Array<{
      id?: string;
      user?: { email?: string; passwordHash?: string };
      profile?: { name?: string };
      createdAt?: string;
      updatedAt?: string;
    }>
  >(INSCRIPTIONS_FILE, []);

  for (const record of inscriptions) {
    const email = (record.user?.email || '').trim().toLowerCase();
    const passwordHash = record.user?.passwordHash;
    const inscriptionId = typeof record.id === 'string' ? record.id : '';
    if (!email || !passwordHash || !inscriptionId) continue;
    if (byEmail.has(email)) {
      const existing = byEmail.get(email)!;
      if (existing.profile === 'beneficiario' || !existing.linkedInscriptionId) {
        existing.linkedInscriptionId = inscriptionId;
        existing.scope = { ...existing.scope, inscriptionId };
      }
      continue;
    }
    byEmail.set(
      email,
      normalizeUser({
        id: `usr_benef_${inscriptionId}`,
        name: record.profile?.name || email.split('@')[0],
        email,
        password: passwordHash,
        passwordHashed: true,
        role: 'viewer',
        profile: 'beneficiario',
        permissions: defaultPermissionsFor('beneficiario', 'viewer'),
        scope: { inscriptionId },
        active: true,
        kind: 'user',
        linkedInscriptionId: inscriptionId,
        createdAt: record.createdAt || now(),
        updatedAt: record.updatedAt || now(),
      })
    );
  }

  const users = Array.from(byEmail.values());
  const next = { users };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf8');
  await writeFile(MIGRATION_FLAG, JSON.stringify({ done: true, at: now() }, null, 2), 'utf8');
  return next;
}

async function readOrSeed(): Promise<UsersFile> {
  let file: UsersFile;
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as UsersFile;
    if (parsed?.users?.length) {
      file = parsed;
    } else {
      file = { users: seedUsers() };
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(DATA_FILE, JSON.stringify(file, null, 2), 'utf8');
    }
  } catch {
    file = { users: seedUsers() };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(file, null, 2), 'utf8');
  }
  return migrateInto(file);
}

async function save(file: UsersFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(file, null, 2), 'utf8');
}

function publicUser(user: IntranetUser): IntranetUser {
  return { ...user, password: '' };
}

export async function listUsers(kind?: 'user' | 'collaborator'): Promise<IntranetUser[]> {
  const file = await readOrSeed();
  const list = kind ? file.users.filter((u) => u.kind === kind) : file.users;
  return list.map(publicUser);
}

export async function findUserByEmail(email: string): Promise<IntranetUser | null> {
  const file = await readOrSeed();
  const normalized = email.trim().toLowerCase();
  return file.users.find((u) => u.email.toLowerCase() === normalized && u.active) || null;
}

export async function findUserById(id: string): Promise<IntranetUser | null> {
  const file = await readOrSeed();
  return file.users.find((u) => u.id === id && u.active) || null;
}

async function linkTeamOrBeneficiaryOnTheFly(
  email: string,
  password: string
): Promise<IntranetUser | null> {
  const normalized = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalized);

  // Team member not yet migrated / password synced from team store
  try {
    const team = await readJsonFile<
      Array<{
        id: string;
        name: string;
        email: string;
        role?: 'master' | 'technician' | 'admin';
        passwordHash?: string;
        active?: boolean;
      }>
    >(TEAM_FILE, []);
    const member = team.find((m) => m.email?.toLowerCase() === normalized && m.active !== false);
    if (member?.passwordHash && verifyPassword(password, member.passwordHash)) {
      return upsertUser({
        id: existing?.id || `usr_team_${member.id}`,
        name: member.name,
        email: normalized,
        password,
        role: member.role === 'technician' ? 'viewer' : 'editor',
        profile: existing?.profile === 'staff_interno' ? 'staff_interno' : 'equipe_projeto',
        permissions:
          existing?.profile === 'staff_interno'
            ? Array.from(
                new Set([
                  ...(existing.permissions || []),
                  ...defaultPermissionsFor('equipe_projeto', 'editor', member.role || 'technician'),
                ])
              )
            : defaultPermissionsFor('equipe_projeto', 'editor', member.role || 'technician'),
        scope: { ...(existing?.scope || {}), memberRole: member.role || 'technician' },
        kind: 'user',
        linkedTeamMemberId: member.id,
      });
    }
  } catch {
    // ignore
  }

  // Beneficiary inscription not yet migrated
  try {
    const inscriptions = await readJsonFile<
      Array<{
        id?: string;
        user?: { email?: string; passwordHash?: string };
        profile?: { name?: string };
      }>
    >(INSCRIPTIONS_FILE, []);
    const record = inscriptions.find((r) => r.user?.email?.toLowerCase() === normalized);
    const hash = record?.user?.passwordHash;
    const inscriptionId = typeof record?.id === 'string' ? record.id : '';
    if (record && hash && inscriptionId && verifyPassword(password, hash)) {
      return upsertUser({
        id: existing?.id || `usr_benef_${inscriptionId}`,
        name: record.profile?.name || normalized.split('@')[0],
        email: normalized,
        password,
        role: 'viewer',
        profile: 'beneficiario',
        permissions: defaultPermissionsFor('beneficiario', 'viewer'),
        scope: { inscriptionId },
        kind: 'user',
        linkedInscriptionId: inscriptionId,
      });
    }
  } catch {
    // ignore
  }

  return null;
}

export async function authenticateUser(email: string, password: string): Promise<IntranetUser | null> {
  const file = await readOrSeed();
  const normalized = email.trim().toLowerCase();
  const idx = file.users.findIndex((u) => u.email.toLowerCase() === normalized && u.active);
  if (idx < 0) {
    return linkTeamOrBeneficiaryOnTheFly(normalized, password);
  }
  const user = file.users[idx];
  const ok = user.passwordHashed
    ? verifyPassword(password, user.password)
    : user.password === password;
  if (!ok) {
    // password may have been updated only on team/inscription store
    return linkTeamOrBeneficiaryOnTheFly(normalized, password);
  }

  // upgrade legacy plain password on successful login
  if (!user.passwordHashed) {
    file.users[idx] = {
      ...user,
      password: hashPassword(password),
      passwordHashed: true,
      updatedAt: now(),
    };
    await save(file);
    return file.users[idx];
  }
  return user;
}

export async function upsertUser(input: {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: IntranetRole;
  profile?: IntranetProfile;
  permissions?: IntranetPermission[];
  scope?: IntranetScope;
  kind: 'user' | 'collaborator';
  active?: boolean;
  linkedTeamMemberId?: string;
  linkedInscriptionId?: string;
}): Promise<IntranetUser> {
  const file = await readOrSeed();
  const ts = now();
  const profile = input.profile || 'staff_interno';
  const scope = input.scope || {};
  const permissions =
    input.permissions?.length
      ? input.permissions
      : defaultPermissionsFor(profile, input.role, scope.memberRole);

  if (input.id) {
    const idx = file.users.findIndex((u) => u.id === input.id);
    if (idx >= 0) {
      const current = file.users[idx];
      const nextPassword = input.password?.trim()
        ? hashPassword(input.password.trim())
        : current.password;
      const next: IntranetUser = {
        ...current,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        profile,
        permissions,
        scope,
        kind: input.kind,
        active: input.active !== undefined ? input.active : current.active,
        password: nextPassword,
        passwordHashed: input.password?.trim() ? true : current.passwordHashed ?? isHashedPassword(nextPassword),
        linkedTeamMemberId: input.linkedTeamMemberId ?? current.linkedTeamMemberId,
        linkedInscriptionId: input.linkedInscriptionId ?? current.linkedInscriptionId ?? scope.inscriptionId,
        updatedAt: ts,
      };
      file.users[idx] = next;
      await save(file);
      return publicUser(next);
    }
  }

  const created: IntranetUser = normalizeUser({
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: hashPassword(input.password?.trim() || 'cambiar123'),
    passwordHashed: true,
    role: input.role,
    profile,
    permissions,
    scope,
    kind: input.kind,
    active: input.active !== false,
    linkedTeamMemberId: input.linkedTeamMemberId,
    linkedInscriptionId: input.linkedInscriptionId || scope.inscriptionId,
    createdAt: ts,
    updatedAt: ts,
  });
  file.users.unshift(created);
  await save(file);
  return publicUser(created);
}

export async function deleteUser(id: string): Promise<boolean> {
  const file = await readOrSeed();
  const next = file.users.filter((u) => u.id !== id);
  if (next.length === file.users.length) return false;
  file.users = next;
  await save(file);
  return true;
}

async function syncPasswordToLinkedStores(email: string, passwordHash: string, user: IntranetUser) {
  const normalized = email.trim().toLowerCase();

  try {
    const team = await readJsonFile<
      Array<{ id: string; email: string; passwordHash?: string; updatedAt?: string }>
    >(TEAM_FILE, []);
    let changed = false;
    for (const member of team) {
      if (member.email?.toLowerCase() !== normalized) continue;
      if (user.linkedTeamMemberId && member.id !== user.linkedTeamMemberId) continue;
      member.passwordHash = passwordHash;
      member.updatedAt = now();
      changed = true;
    }
    if (changed) {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(TEAM_FILE, JSON.stringify(team, null, 2), 'utf8');
    }
  } catch {
    // ignore
  }

  try {
    const inscriptions = await readJsonFile<Array<Record<string, unknown>>>(INSCRIPTIONS_FILE, []);
    let changed = false;
    for (const record of inscriptions) {
      const userObj = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
      const userEmail = typeof userObj.email === 'string' ? userObj.email.toLowerCase() : '';
      const recordId = typeof record.id === 'string' ? record.id : '';
      if (userEmail !== normalized) continue;
      if (user.linkedInscriptionId && recordId && recordId !== user.linkedInscriptionId) continue;
      const { passwordReset: _pr, ...restUser } = userObj;
      record.user = { ...restUser, passwordHash };
      record.updatedAt = now();
      changed = true;
    }
    if (changed) {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(INSCRIPTIONS_FILE, JSON.stringify(inscriptions, null, 2), 'utf8');
    }
  } catch {
    // ignore
  }
}

/** Ensure an intranet user exists for password reset (from team / inscription if needed). */
export async function ensureUserForPasswordReset(email: string): Promise<IntranetUser | null> {
  const normalized = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalized);
  if (existing) return existing;

  const team = await readJsonFile<
    Array<{
      id: string;
      name: string;
      email: string;
      role?: 'master' | 'technician' | 'admin';
      passwordHash?: string;
      active?: boolean;
    }>
  >(TEAM_FILE, []);
  const member = team.find((m) => m.email?.toLowerCase() === normalized && m.active !== false);
  if (member) {
    return upsertUser({
      id: `usr_team_${member.id}`,
      name: member.name,
      email: normalized,
      password: 'temp-reset-pending',
      role: member.role === 'technician' ? 'viewer' : 'editor',
      profile: 'equipe_projeto',
      permissions: defaultPermissionsFor('equipe_projeto', 'editor', member.role || 'technician'),
      scope: { memberRole: member.role || 'technician' },
      kind: 'user',
      linkedTeamMemberId: member.id,
    });
  }

  const inscriptions = await readJsonFile<
    Array<{
      id?: string;
      user?: { email?: string; passwordHash?: string };
      profile?: { name?: string };
    }>
  >(INSCRIPTIONS_FILE, []);
  const record = inscriptions.find((r) => r.user?.email?.toLowerCase() === normalized);
  const inscriptionId = typeof record?.id === 'string' ? record.id : '';
  if (record && inscriptionId) {
    return upsertUser({
      id: `usr_benef_${inscriptionId}`,
      name: record.profile?.name || normalized.split('@')[0],
      email: normalized,
      password: 'temp-reset-pending',
      role: 'viewer',
      profile: 'beneficiario',
      permissions: defaultPermissionsFor('beneficiario', 'viewer'),
      scope: { inscriptionId },
      kind: 'user',
      linkedInscriptionId: inscriptionId,
    });
  }

  return null;
}

export async function setUserPasswordReset(
  email: string,
  token: string,
  expiresAt: string
): Promise<IntranetUser | null> {
  const file = await readOrSeed();
  const normalized = email.trim().toLowerCase();
  let idx = file.users.findIndex((u) => u.email.toLowerCase() === normalized && u.active);
  if (idx < 0) {
    const ensured = await ensureUserForPasswordReset(normalized);
    if (!ensured) return null;
    const refreshed = await readOrSeed();
    idx = refreshed.users.findIndex((u) => u.email.toLowerCase() === normalized && u.active);
    if (idx < 0) return null;
    refreshed.users[idx] = {
      ...refreshed.users[idx],
      passwordReset: { token, expiresAt },
      updatedAt: now(),
    };
    await save(refreshed);
    return publicUser(refreshed.users[idx]);
  }

  file.users[idx] = {
    ...file.users[idx],
    passwordReset: { token, expiresAt },
    updatedAt: now(),
  };
  await save(file);
  return publicUser(file.users[idx]);
}

export async function completeUserPasswordReset(
  email: string,
  token: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; reason: 'invalid' | 'expired' }> {
  const file = await readOrSeed();
  const normalized = email.trim().toLowerCase();
  const idx = file.users.findIndex((u) => u.email.toLowerCase() === normalized && u.active);
  if (idx < 0) return { ok: false, reason: 'invalid' };

  const user = file.users[idx];
  const reset = user.passwordReset;
  if (!reset?.token || reset.token !== token) return { ok: false, reason: 'invalid' };
  if (Date.parse(reset.expiresAt) < Date.now()) return { ok: false, reason: 'expired' };

  const passwordHash = hashPassword(newPassword);
  const { passwordReset: _pr, ...rest } = user;
  const next: IntranetUser = {
    ...rest,
    password: passwordHash,
    passwordHashed: true,
    updatedAt: now(),
  };
  file.users[idx] = next;
  await save(file);
  await syncPasswordToLinkedStores(normalized, passwordHash, next);
  return { ok: true };
}
