'use client';

import { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';

const EMAIL = 'contacto@ruralcommerce.com';

export function RuralContactForm() {
  const [sending, setSending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [locality, setLocality] = useState('');
  const [interest, setInterest] = useState('sustentabilidad');
  const [profile, setProfile] = useState('Productor rural');
  const [message, setMessage] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    const lines = [
      `Consulta Rural Commerce`,
      `Nombre/empresa: ${name}`,
      `Email: ${email}`,
      `Localidad: ${locality}`,
      `Interés: ${interest}`,
      `Perfil: ${profile}`,
      ``,
      message,
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const subject = encodeURIComponent(`[Rural Commerce] ${name || 'Consulta'}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => setSending(false), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#071F5E]/10 bg-white p-6 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-[#1E1E1E]/55">Nombre completo / empresa</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#009179]/30"
            placeholder="Nombre o razón social"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[#1E1E1E]/55">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#009179]/30"
            placeholder="email@ejemplo.com"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[#1E1E1E]/55">Departamento / localidad</span>
          <input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#009179]/30"
            placeholder="Para logística"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-[#1E1E1E]/55">Interés principal</span>
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#009179]/30"
          >
            <option value="sustentabilidad">Combo Sustentabilidad</option>
            <option value="procesamiento">Procesamiento</option>
            <option value="gestion">Gestión</option>
            <option value="viabilizacion">Viabilización financiera</option>
            <option value="aliado">Alianza / inversión</option>
          </select>
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-xs font-medium text-[#1E1E1E]/55">Tipo de perfil</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Productor rural', 'Empresa B2B', 'Gobierno', 'Inversor'].map((label) => (
              <label
                key={label}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-[#1E1E1E] has-[:checked]:border-[#009179] has-[:checked]:bg-[#009179]/8"
              >
                <input
                  type="radio"
                  name="perfil"
                  checked={profile === label}
                  onChange={() => setProfile(label)}
                  className="text-[#009179]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-[#1E1E1E]/55">Mensaje</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#009179]/30"
            placeholder="Contanos brevemente tu proyecto o necesidad…"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#009179] py-2.5 text-sm font-semibold text-white transition hover:bg-[#007d6b] disabled:opacity-70 sm:w-auto sm:px-8"
      >
        <Send className="h-4 w-4" />
        {sending ? 'Abriendo correo…' : 'Enviar consulta'}
      </button>
    </form>
  );
}
