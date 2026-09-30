'use client';

import { useEffect, useState } from 'react';
import type { IntranetRole, IntranetUser } from '@/lib/intranet/types';
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
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as IntranetRole });
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
    const res = await fetch('/api/intranet/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, kind }),
    });
    if (!res.ok) {
      setMessage('No se pudo guardar');
      return;
    }
    setForm({ name: '', email: '', password: '', role: 'editor' });
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
        <h2 className="text-lg font-bold text-[#071F5E]">Nuevo {kind === 'collaborator' ? 'colaborador' : 'usuario'}</h2>
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
        <select
          className="min-h-11 w-full rounded-xl border border-[#071F5E]/15 px-4 text-sm"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as IntranetRole }))}
        >
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="viewer">viewer</option>
        </select>
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
                    {u.email} · {u.role}
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
      </div>
    </div>
  );
}
