'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatProjectDate, getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';
import type { PlantaInvite } from '@/lib/planta-invites';

const copy: Record<
  ProjectLocaleKey,
  {
    title: string;
    hint: string;
    label: string;
    generate: string;
    generating: string;
    listTitle: string;
    uses: string;
    empty: string;
    error: string;
    copy: string;
    copied: string;
    whatsapp: string;
    demo: string;
  }
> = {
  es: {
    title: 'Convites de la planta compartida',
    hint: 'Genera un código IM-… y envíalo por WhatsApp o correo. No abre Mi perfil ni la intranet: solo la guía de Copey.',
    label: 'Para quién es el código (cooperativa o persona)',
    generate: 'Generar código',
    generating: 'Generando…',
    listTitle: 'Códigos activos',
    uses: '{count} usos',
    empty: 'Aún no hay códigos además del de demostración.',
    error: 'No fue posible generar el código.',
    copy: 'Copiar mensaje',
    copied: 'Copiado',
    whatsapp: 'WhatsApp',
    demo: 'Demostración cooperativa',
  },
  'pt-BR': {
    title: 'Convites da planta compartilhada',
    hint: 'Gere um código IM-… e envie por WhatsApp ou e-mail. Não abre Meu perfil nem a intranet: só o guia de Copey.',
    label: 'Para quem é o código (cooperativa ou pessoa)',
    generate: 'Gerar código',
    generating: 'Gerando…',
    listTitle: 'Códigos ativos',
    uses: '{count} usos',
    empty: 'Ainda não há códigos além do de demonstração.',
    error: 'Não foi possível gerar o código.',
    copy: 'Copiar mensagem',
    copied: 'Copiado',
    whatsapp: 'WhatsApp',
    demo: 'Demonstração cooperativa',
  },
  en: {
    title: 'Shared plant invites',
    hint: 'Generate an IM-… code and send it by WhatsApp or email. It does not open My profile or the intranet: only the Copey guide.',
    label: 'Who the code is for (cooperative or person)',
    generate: 'Generate code',
    generating: 'Generating…',
    listTitle: 'Active codes',
    uses: '{count} uses',
    empty: 'No codes yet besides the demo.',
    error: 'Could not generate the code.',
    copy: 'Copy message',
    copied: 'Copied',
    whatsapp: 'WhatsApp',
    demo: 'Cooperative demo',
  },
};

export function PlantaInvitesPanel({ locale, teamToken }: { locale: string; teamToken: string }) {
  const t = copy[getProjectLocaleKey(locale)];
  const [label, setLabel] = useState('');
  const [invites, setInvites] = useState<PlantaInvite[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [lastShare, setLastShare] = useState<{ code: string; text: string; whatsappUrl: string } | null>(null);

  const load = useCallback(async () => {
    const response = await fetch('/api/projeto/planta/invites', {
      headers: { Authorization: `Bearer ${teamToken}` },
    });
    const data = (await response.json()) as { ok?: boolean; invites?: PlantaInvite[] };
    if (response.ok && data.invites) setInvites(data.invites);
  }, [teamToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/planta/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teamToken}`,
        },
        body: JSON.stringify({ label, locale }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        invite?: PlantaInvite;
        shareText?: string;
        whatsappUrl?: string;
      };
      if (!response.ok || !data.ok || !data.invite) {
        setError(t.error);
        return;
      }
      setLastShare({
        code: data.invite.code,
        text: data.shareText || data.invite.code,
        whatsappUrl: data.whatsappUrl || '',
      });
      setLabel('');
      await load();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function copyMessage(text: string, code: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(code);
    } catch {
      setCopied('');
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-[#071F5E]">{t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.hint}</p>
      </div>
      <label className="block text-sm font-medium text-[#071F5E]">
        {t.label}
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-base text-[#071F5E] outline-none focus:border-[#009179]"
        />
      </label>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="rounded-full bg-[#009179] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? t.generating : t.generate}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {lastShare ? (
        <div className="rounded-2xl bg-[#F3FBF8] p-4 text-sm text-[#071F5E]">
          <p className="font-semibold tracking-[0.12em]">{lastShare.code}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-[#009179] px-4 py-2 font-semibold"
              onClick={() => void copyMessage(lastShare.text, lastShare.code)}
            >
              {copied === lastShare.code ? t.copied : t.copy}
            </button>
            {lastShare.whatsappUrl ? (
              <a
                href={lastShare.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#071F5E] px-4 py-2 font-semibold text-white"
              >
                {t.whatsapp}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{t.listTitle}</h3>
        <ul className="mt-3 space-y-2">
          {invites.length === 0 ? <li className="text-sm text-[#2F3336]/70">{t.empty}</li> : null}
          {invites.map((invite) => (
            <li key={invite.code} className="rounded-2xl border border-[#E6EBF1] px-4 py-3">
              <p className="font-semibold tracking-[0.1em] text-[#071F5E]">{invite.code}</p>
              <p className="mt-1 text-sm text-[#2F3336]/80">
                {invite.seeded ? t.demo : invite.label} · {formatProjectDate(invite.createdAt, locale)} ·{' '}
                {t.uses.replace('{count}', String(invite.uses || 0))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
