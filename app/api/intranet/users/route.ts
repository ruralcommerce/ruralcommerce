import { NextResponse } from 'next/server';
import { requireSession, sessionHas } from '@/lib/intranet/auth';
import { deleteUser, listUsers, upsertUser } from '@/lib/intranet/users-store';
import type { IntranetPermission, IntranetRole } from '@/lib/intranet/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = requireSession();
  if (!sessionHas(session, 'users.manage') && !sessionHas(session, 'collaborators.manage')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind') as 'user' | 'collaborator' | null;
  const users = await listUsers(kind || undefined);
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = requireSession();
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: IntranetRole;
    permissions?: IntranetPermission[];
    kind?: 'user' | 'collaborator';
    active?: boolean;
  };

  const kind = body.kind || 'user';
  const needed = kind === 'collaborator' ? 'collaborators.manage' : 'users.manage';
  if (!sessionHas(session, needed)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }

  const user = await upsertUser({
    id: body.id,
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role || 'viewer',
    permissions: body.permissions,
    kind,
    active: body.active,
  });
  return NextResponse.json({ user }, { status: body.id ? 200 : 201 });
}

export async function DELETE(request: Request) {
  const session = requireSession();
  if (!sessionHas(session, 'users.manage')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteUser(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
