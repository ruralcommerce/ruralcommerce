'use client';

import { useEffect, useState } from 'react';
import {
  ALL_PERMISSIONS,
  defaultPermissionsFor,
  type IntranetPermission,
  type IntranetProfile,
  type IntranetRole,
  type IntranetUser,
} from '@/lib/intranet/types';
import { IntranetGate } from './IntranetGate';

export function IntranetUsersPage({
  locale,
  kind,
}: {
  locale: string;
  kind: 'user' | 'collaborator';
}) {
  const title = kind === 'collaborator' ? 'Colaboradores' : 'Usuarios';
  const permission = kind === 'collaborator' ? 'collaborators.manage' : 'users.manage';

  return (
    <IntranetGate
      locale={locale}
      title={title}
      breadcrumb={`Páginas / ${title}`}
      permission={permission}
    >
      {() => <UsersBody kind={kind} />}
    </IntranetGate>
  );
}

function UsersBody({ kind }: { kind: 'user' | 'collaborator' }) {
  const [users, setUsers] = useState<IntranetUser[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as IntranetRole,
    profile: 'staff_interno' as IntranetProfile,
    memberRole: 'technician' as 'master' | 'technician' | 'admin',
    inscriptionId: '',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch(`/api/intranet/users?kind=${kind}`);
    if (!res.ok) return;
    const data = (await res.json()) as { users: IntranetUser[] };
    setUsers(data.users);
  }

  useEffect(() => {
    void load();
  }, [kind]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const scope =
      form.profile === 'beneficiario'
        ? { inscriptionId: form.inscriptionId.trim() || undefined }
        : form.profile === 'equipe_projeto'
          ? { memberRole: form.memberRole }
          : {};
    const permissions = defaultPermissionsFor(
      form.profile,
      form.role,
      form.profile === 'equipe_projeto' ? form.memberRole : undefined
    );
    const res = await fetch('/api/intranet/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        profile: form.profile,
        permissions,
        scope,
        kind,
      }),
    });
    if (!res.ok) {
      setMessage('No se pudo guardar');
      return;
    }
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'editor',
      profile: 'staff_interno',
      memberRole: 'technician',
      inscriptionId: '',
    });
    setMessage('Guardado');
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    await fetch(`/api/intranet/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form onSubmit={create} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#071F5E]">
          Nuevo {kind === 'collaborator' ? 'colaborador' : 'usuario'}
        </h2>
        <input
          className="min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm"
          placeholder="Contraseña temporal"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#071F5E]/70">
          Perfil
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm font-normal normal-case tracking-normal"
            value={form.profile}
            onChange={(e) => setForm((f) => ({ ...f, profile: e.target.value as IntranetProfile }))}
          >
            <option value="staff_interno">staff_interno</option>
            <option value="equipe_projeto">equipe_projeto</option>
            <option value="beneficiario">beneficiario</option>
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#071F5E]/70">
          Rol
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm font-normal normal-case tracking-normal"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as IntranetRole }))}
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
        </label>
        {form.profile === 'equipe_projeto' ? (
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#071F5E]/70">
            Rol de proyecto
            <select
              className="mt-1 min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm font-normal normal-case tracking-normal"
              value={form.memberRole}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  memberRole: e.target.value as 'master' | 'technician' | 'admin',
                }))
              }
            >
              <option value="master">master</option>
              <option value="admin">admin</option>
              <option value="technician">technician</option>
            </select>
          </label>
        ) : null}
        {form.profile === 'beneficiario' ? (
          <input
            className="min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm"
            placeholder="ID de inscripción (escopo)"
            value={form.inscriptionId}
            onChange={(e) => setForm((f) => ({ ...f, inscriptionId: e.target.value }))}
          />
        ) : null}
        <p className="text-[11px] leading-4 text-[#1E1E1E]/50">
          Permisos base: {defaultPermissionsFor(form.profile, form.role, form.memberRole).join(', ')}
        </p>
        <button type="submit" className="rounded-xl bg-[#009179] px-4 py-2.5 text-sm font-semibold text-white">
          Guardar
        </button>
        {message ? <p className="text-sm text-[#009179]">{message}</p> : null}
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#071F5E]">Listado</h2>
        <ul className="mt-4 divide-y divide-[#071F5E]/8">
          {users.length === 0 ? (
            <li className="py-3 text-sm text-[#1E1E1E]/55">Sin registros aún.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-[#071F5E]">{u.name}</p>
                  <p className="text-xs text-[#1E1E1E]/55">
                    {u.email} · {u.profile} · {u.role}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#1E1E1E]/40">
                    {(u.permissions || []).slice(0, 6).join(', ')}
                    {(u.permissions || []).length > 6 ? '…' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(u.id)}
                  className="text-xs font-semibold text-red-600"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="mt-4 text-[10px] text-[#1E1E1E]/40">
          Catálogo: {ALL_PERMISSIONS.length} permisos disponibles
        </p>
      </div>
    </div>
  );
}
