import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import {
  ROLE_DEFAULT_PERMISSIONS,
  type IntranetPermission,
  type IntranetRole,
  type IntranetUser,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'intranet-users.json');

type UsersFile = { users: IntranetUser[] };

function now() {
  return new Date().toISOString();
}

function seedUsers(): IntranetUser[] {
  const ts = now();
  return [
    {
      id: 'usr_admin',
      name: 'Equipo Rural Commerce',
      email: 'equipo@ruralcommerceglobal.com',
      password: process.env.RC_INTRANET_PASSWORD || process.env.EDITOR_BASIC_PASSWORD || 'ruralcommerce123',
      role: 'admin',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.admin],
      active: true,
      kind: 'user',
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

async function readOrSeed(): Promise<UsersFile> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as UsersFile;
    if (parsed?.users?.length) return parsed;
  } catch {
    // seed
  }
  const seeded = { users: seedUsers() };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf8');
  return seeded;
}

async function save(file: UsersFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(file, null, 2), 'utf8');
}

export async function listUsers(kind?: 'user' | 'collaborator'): Promise<IntranetUser[]> {
  const file = await readOrSeed();
  const list = kind ? file.users.filter((u) => u.kind === kind) : file.users;
  return list.map(({ password: _p, ...rest }) => ({ ...rest, password: '' }) as IntranetUser);
}

export async function findUserByEmail(email: string): Promise<IntranetUser | null> {
  const file = await readOrSeed();
  const normalized = email.trim().toLowerCase();
  return file.users.find((u) => u.email.toLowerCase() === normalized && u.active) || null;
}

export async function authenticateUser(email: string, password: string): Promise<IntranetUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export async function upsertUser(input: {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: IntranetRole;
  permissions?: IntranetPermission[];
  kind: 'user' | 'collaborator';
  active?: boolean;
}): Promise<IntranetUser> {
  const file = await readOrSeed();
  const ts = now();
  const permissions = input.permissions?.length ? input.permissions : ROLE_DEFAULT_PERMISSIONS[input.role];

  if (input.id) {
    const idx = file.users.findIndex((u) => u.id === input.id);
    if (idx >= 0) {
      const current = file.users[idx];
      const next: IntranetUser = {
        ...current,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        permissions,
        kind: input.kind,
        active: input.active !== undefined ? input.active : current.active,
        password: input.password?.trim() ? input.password.trim() : current.password,
        updatedAt: ts,
      };
      file.users[idx] = next;
      await save(file);
      return { ...next, password: '' };
    }
  }

  const created: IntranetUser = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password?.trim() || 'cambiar123',
    role: input.role,
    permissions,
    kind: input.kind,
    active: input.active !== false,
    createdAt: ts,
    updatedAt: ts,
  };
  file.users.unshift(created);
  await save(file);
  return { ...created, password: '' };
}

export async function deleteUser(id: string): Promise<boolean> {
  const file = await readOrSeed();
  const next = file.users.filter((u) => u.id !== id);
  if (next.length === file.users.length) return false;
  file.users = next;
  await save(file);
  return true;
}
