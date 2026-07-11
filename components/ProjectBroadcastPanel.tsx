'use client';

import { useEffect, useState } from 'react';
import { getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

type BroadcastSegment = 'consent' | 'consent_approved';
type BroadcastChannel = 'email' | 'push' | 'whatsapp';

type BroadcastResult = {
  recipients: number;
  email: { sent: number; skipped: number; failed: number };
  push: { sent: number; skipped: number; failed: number };
  whatsapp: { sent: number; skipped: number; failed: number };
};

type RecentBroadcast = {
  id: string;
  createdAt: string;
  subject: string;
  result: BroadcastResult;
};

const copy: Record<
  ProjectLocaleKey,
  {
    title: string;
    hint: string;
    subject: string;
    body: string;
    pushTitle: string;
    pushBody: string;
    link: string;
    segment: string;
    segmentConsent: string;
    segmentApproved: string;
    localeAll: string;
    channels: string;
    chEmail: string;
    chPush: string;
    chWhatsApp: string;
    utilityNote: string;
    preview: string;
    send: string;
    sending: string;
    resultTitle: string;
    recipients: string;
    recentTitle: string;
  }
> = {
  es: {
    title: 'Comunicación del proyecto',
    hint: 'Redacta aquí el mensaje y envíalo desde este panel (/admin). Un envío → e-mail (texto completo), push (título + resumen) y WhatsApp Utility (resumen + enlace). Solo llega a quienes firmaron el convenio y aceptaron comunicaciones (sección 6).',
    subject: 'Asunto',
    body: 'Mensaje completo (e-mail)',
    pushTitle: 'Título push (opcional)',
    pushBody: 'Resumen corto (push y WhatsApp)',
    link: 'Enlace (opcional, ej. /es/perfil)',
    segment: 'Destinatarios',
    segmentConsent: 'Convenio + comunicaciones (todos los estados)',
    segmentApproved: 'Convenio + comunicaciones + aprobados',
    localeAll: 'Todos los idiomas',
    channels: 'Canales',
    chEmail: 'E-mail',
    chPush: 'Push web',
    chWhatsApp: 'WhatsApp Utility',
    utilityNote: 'WhatsApp usa plantilla Utility aprobada en Meta (projeto_atualizacao). Sin respuestas por API.',
    preview: 'Ver alcance',
    send: 'Enviar comunicación',
    sending: 'Enviando...',
    resultTitle: 'Resultado del envío',
    recipients: 'Destinatarios',
    recentTitle: 'Envíos recientes',
  },
  'pt-BR': {
    title: 'Comunicação do projeto',
    hint: 'Redija a mensagem aqui e envie deste painel (/admin). Um envio → e-mail (texto completo), push (título + resumo) e WhatsApp Utility (resumo + link). Só chega a quem assinou o convênio e aceitou comunicações (seção 6).',
    subject: 'Assunto',
    body: 'Mensagem completa (e-mail)',
    pushTitle: 'Título push (opcional)',
    pushBody: 'Resumo curto (push e WhatsApp)',
    link: 'Link (opcional, ex. /pt-BR/perfil)',
    segment: 'Destinatários',
    segmentConsent: 'Convênio + comunicações (todos os status)',
    segmentApproved: 'Convênio + comunicações + aprovados',
    localeAll: 'Todos os idiomas',
    channels: 'Canais',
    chEmail: 'E-mail',
    chPush: 'Push web',
    chWhatsApp: 'WhatsApp Utility',
    utilityNote: 'WhatsApp usa template Utility aprovado na Meta (projeto_atualizacao). Sem respostas pela API.',
    preview: 'Ver alcance',
    send: 'Enviar comunicação',
    sending: 'Enviando...',
    resultTitle: 'Resultado do envio',
    recipients: 'Destinatários',
    recentTitle: 'Envios recentes',
  },
  en: {
    title: 'Project communication',
    hint: 'Compose the message here and send from this panel (/admin). One send → email (full text), push (title + summary) and WhatsApp Utility (summary + link). Only reaches participants who signed the agreement and accepted communications (section 6).',
    subject: 'Subject',
    body: 'Full message (email)',
    pushTitle: 'Push title (optional)',
    pushBody: 'Short summary (push and WhatsApp)',
    link: 'Link (optional, e.g. /en/perfil)',
    segment: 'Recipients',
    segmentConsent: 'Agreement + communications (all statuses)',
    segmentApproved: 'Agreement + communications + approved',
    localeAll: 'All languages',
    channels: 'Channels',
    chEmail: 'Email',
    chPush: 'Web push',
    chWhatsApp: 'WhatsApp Utility',
    utilityNote: 'WhatsApp uses an approved Meta Utility template (projeto_atualizacao). No API replies.',
    preview: 'Preview reach',
    send: 'Send communication',
    sending: 'Sending...',
    resultTitle: 'Send result',
    recipients: 'Recipients',
    recentTitle: 'Recent sends',
  },
};

export function ProjectBroadcastPanel({
  locale,
  teamPassword,
}: {
  locale: string;
  teamPassword: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [link, setLink] = useState(`/${localeKey}/perfil`);
  const [segment, setSegment] = useState<BroadcastSegment>('consent');
  const [localeFilter, setLocaleFilter] = useState('all');
  const [channels, setChannels] = useState<Record<BroadcastChannel, boolean>>({
    email: true,
    push: true,
    whatsapp: true,
  });
  const [preview, setPreview] = useState<{ total: number; withPhone: number; withoutPhone: number } | null>(null);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [recent, setRecent] = useState<RecentBroadcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreview(null);
    setResult(null);
  }, [segment, localeFilter]);

  useEffect(() => {
    if (!teamPassword) return;
    const params = new URLSearchParams({ password: teamPassword, segment: 'consent' });
    fetch(`/api/projeto/broadcast?${params.toString()}`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.ok && Array.isArray(payload.recent)) setRecent(payload.recent);
      })
      .catch(() => undefined);
  }, [teamPassword]);

  const selectedChannels = (Object.keys(channels) as BroadcastChannel[]).filter((key) => channels[key]);

  const loadPreview = async () => {
    setError('');
    try {
      const params = new URLSearchParams({
        password: teamPassword,
        segment,
        ...(localeFilter !== 'all' ? { locale: localeFilter } : {}),
      });
      const response = await fetch(`/api/projeto/broadcast?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setPreview(payload.counts);
      if (Array.isArray(payload.recent)) setRecent(payload.recent);
    } catch {
      setError('Error');
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError(localeKey === 'en' ? 'Subject and message are required.' : localeKey === 'pt-BR' ? 'Assunto e mensagem são obrigatórios.' : 'Asunto y mensaje son obligatorios.');
      return;
    }
    if (!selectedChannels.length) {
      setError(localeKey === 'en' ? 'Select at least one channel.' : 'Selecione pelo menos um canal.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/projeto/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: teamPassword,
          subject,
          body,
          pushTitle: pushTitle || subject,
          pushBody: pushBody || body.slice(0, 200),
          link,
          segment,
          localeFilter: localeFilter === 'all' ? undefined : localeFilter,
          channels: selectedChannels,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setResult(payload.result as BroadcastResult);
      loadPreview();
    } catch {
      setError('Error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-2.5 text-sm';

  return (
    <section className="rounded-3xl border border-[#E6EBF1] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.title}</p>
      <p className="mt-1 text-sm text-[#2F3336]/75">{t.hint}</p>
      <p className="mt-2 rounded-2xl bg-[#F6FAFA] p-3 text-xs text-[#2F3336]/70">{t.utilityNote}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[#071F5E]">{t.subject}</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[#071F5E]">{t.body}</span>
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputCls} resize-none`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">{t.pushTitle}</span>
          <input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">{t.pushBody}</span>
          <input value={pushBody} onChange={(e) => setPushBody(e.target.value)} className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[#071F5E]">{t.link}</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">{t.segment}</span>
          <select value={segment} onChange={(e) => setSegment(e.target.value as BroadcastSegment)} className={inputCls}>
            <option value="consent">{t.segmentConsent}</option>
            <option value="consent_approved">{t.segmentApproved}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">Idioma</span>
          <select value={localeFilter} onChange={(e) => setLocaleFilter(e.target.value)} className={inputCls}>
            <option value="all">{t.localeAll}</option>
            <option value="es">es</option>
            <option value="pt-BR">pt-BR</option>
            <option value="en">en</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-[#071F5E]">{t.channels}</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {(
            [
              ['email', t.chEmail],
              ['push', t.chPush],
              ['whatsapp', t.chWhatsApp],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={channels[key]}
                onChange={(e) => setChannels((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {preview ? (
        <p className="mt-3 text-sm text-[#2F3336]/80">
          {t.recipients}: <strong>{preview.total}</strong> · WhatsApp: {preview.withPhone} tel. · sin tel.: {preview.withoutPhone}
        </p>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-2xl bg-[#EEF7F7] p-3 text-sm text-[#1D6359]">
          <p className="font-semibold">{t.resultTitle}</p>
          <p className="mt-1">{t.recipients}: {result.recipients}</p>
          <p>E-mail: {result.email.sent} ok / {result.email.failed} erro / {result.email.skipped} omitido</p>
          <p>Push: {result.push.sent} ok / {result.push.failed} erro / {result.push.skipped} omitido</p>
          <p>WhatsApp: {result.whatsapp.sent} ok / {result.whatsapp.failed} erro / {result.whatsapp.skipped} omitido</p>
        </div>
      ) : null}

      {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {recent.length ? (
        <div className="mt-4 rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D6359]">{t.recentTitle}</p>
          <ul className="mt-2 space-y-2 text-sm text-[#2F3336]/80">
            {recent.map((item) => (
              <li key={item.id} className="border-b border-[#E6EBF1]/80 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-[#071F5E]">{item.subject}</span>
                <span className="ml-2 text-xs text-[#2F3336]/55">
                  {new Date(item.createdAt).toLocaleString()} · {item.result.recipients} {t.recipients.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={loadPreview}
          className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
        >
          {t.preview}
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="rounded-full bg-[#52ADAD] px-5 py-2 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
        >
          {loading ? t.sending : t.send}
        </button>
      </div>
    </section>
  );
}
