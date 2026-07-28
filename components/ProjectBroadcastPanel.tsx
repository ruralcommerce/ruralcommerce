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
    previewEmail: string;
    previewEmailTitle: string;
    closePreview: string;
    resendTitle: string;
    resendHint: string;
    resendPreview: string;
    resendCta: string;
    resending: string;
  }
> = {
  es: {
    title: 'Comunicación del proyecto',
    hint: 'Redacta aquí el mensaje y envíalo desde este panel (/admin). Un envío → e-mail (texto completo), push (título + resumen) y WhatsApp Utility (resumen + enlace). Solo llega a quienes firmaron el convenio y aceptaron comunicaciones (sección 6).',
    subject: 'Asunto',
    body: 'Mensaje completo (e-mail)',
    pushTitle: 'Título push (opcional)',
    pushBody: 'Resumen corto (push y WhatsApp)',
    link: 'Enlace (recomendado: /es/projeto/convenio para firma del convenio)',
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
    previewEmail: 'Ver ejemplo del e-mail',
    previewEmailTitle: 'Vista previa del e-mail',
    closePreview: 'Cerrar',
    resendTitle: 'Reenviar invitación al convenio',
    resendHint:
      'Envía de nuevo el e-mail con el nuevo diseño a participantes aprobados que aún no firmaron el convenio. No requiere que hayan aceptado comunicaciones antes.',
    resendPreview: 'Ver cuántos pendientes',
    resendCta: 'Reenviar invitación al convenio',
    resending: 'Reenviando...',
  },
  'pt-BR': {
    title: 'Comunicação do projeto',
    hint: 'Redija a mensagem aqui e envie deste painel (/admin). Um envio → e-mail (texto completo), push (título + resumo) e WhatsApp Utility (resumo + link). Só chega a quem assinou o convênio e aceitou comunicações (seção 6).',
    subject: 'Assunto',
    body: 'Mensagem completa (e-mail)',
    pushTitle: 'Título push (opcional)',
    pushBody: 'Resumo curto (push e WhatsApp)',
    link: 'Link (recomendado: /pt-BR/projeto/convenio para assinatura)',
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
    previewEmail: 'Ver exemplo do e-mail',
    previewEmailTitle: 'Pré-visualização do e-mail',
    closePreview: 'Fechar',
    resendTitle: 'Reenviar convite do convênio',
    resendHint:
      'Reenvia o e-mail com o novo layout para aprovados que ainda não assinaram o convênio. Não exige consentimento de comunicações anterior.',
    resendPreview: 'Ver quantos pendentes',
    resendCta: 'Reenviar convite do convênio',
    resending: 'Reenviando...',
  },
  en: {
    title: 'Project communication',
    hint: 'Compose the message here and send from this panel (/admin). One send → email (full text), push (title + summary) and WhatsApp Utility (summary + link). Only reaches participants who signed the agreement and accepted communications (section 6).',
    subject: 'Subject',
    body: 'Full message (email)',
    pushTitle: 'Push title (optional)',
    pushBody: 'Short summary (push and WhatsApp)',
    link: 'Link (recommended: /en/projeto/convenio to sign the agreement)',
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
    previewEmail: 'View email sample',
    previewEmailTitle: 'Email preview',
    closePreview: 'Close',
    resendTitle: 'Resend agreement invitation',
    resendHint:
      'Resend the redesigned email to approved participants who have not signed the agreement yet. Does not require prior communications consent.',
    resendPreview: 'Preview pending count',
    resendCta: 'Resend agreement invitation',
    resending: 'Resending...',
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
  const [link, setLink] = useState(`/${localeKey}/projeto/convenio`);
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
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);
  const [convenioPending, setConvenioPending] = useState<{ total: number; withPhone: number; withoutPhone: number } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResult, setResendResult] = useState<BroadcastResult | null>(null);

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

  const loadEmailPreview = async (type: 'approval' | 'broadcast' = 'approval') => {
    setError('');
    try {
      const params = new URLSearchParams({
        password: teamPassword,
        locale: localeFilter === 'all' ? localeKey : localeFilter,
        type,
      });
      const response = await fetch(`/api/projeto/email-preview?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setEmailPreviewHtml(payload.html as string);
    } catch {
      setError('Error');
    }
  };

  const loadConvenioPending = async () => {
    setError('');
    try {
      const params = new URLSearchParams({
        password: teamPassword,
        ...(localeFilter !== 'all' ? { locale: localeFilter } : {}),
      });
      const response = await fetch(`/api/projeto/broadcast/resend-convenio?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setConvenioPending(payload.counts);
    } catch {
      setError('Error');
    }
  };

  const handleResendConvenio = async () => {
    setResendLoading(true);
    setError('');
    setResendResult(null);
    try {
      const response = await fetch('/api/projeto/broadcast/resend-convenio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: teamPassword,
          localeFilter: localeFilter === 'all' ? undefined : localeFilter,
          channels: ['email'],
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setResendResult(payload.result as BroadcastResult);
      loadConvenioPending();
    } catch {
      setError('Error');
    } finally {
      setResendLoading(false);
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
          onClick={() => loadEmailPreview('approval')}
          className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
        >
          {t.previewEmail}
        </button>
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

      <div className="mt-6 rounded-2xl border border-[#D9E3EC] bg-[#FBFCFD] p-4">
        <p className="text-sm font-semibold text-[#071F5E]">{t.resendTitle}</p>
        <p className="mt-1 text-sm text-[#2F3336]/75">{t.resendHint}</p>
        {convenioPending ? (
          <p className="mt-2 text-sm text-[#2F3336]/80">
            {t.recipients}: <strong>{convenioPending.total}</strong> ({localeKey === 'en' ? 'approved, agreement not signed' : localeKey === 'pt-BR' ? 'aprovados, convênio pendente' : 'aprobados, convenio pendiente'})
          </p>
        ) : null}
        {resendResult ? (
          <div className="mt-2 rounded-2xl bg-[#EEF7F7] p-3 text-sm text-[#1D6359]">
            <p className="font-semibold">{t.resultTitle}</p>
            <p className="mt-1">{t.recipients}: {resendResult.recipients}</p>
            <p>E-mail: {resendResult.email.sent} ok / {resendResult.email.failed} erro</p>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadConvenioPending}
            className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
          >
            {t.resendPreview}
          </button>
          <button
            type="button"
            onClick={handleResendConvenio}
            disabled={resendLoading}
            className="rounded-full bg-[#071F5E] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {resendLoading ? t.resending : t.resendCta}
          </button>
        </div>
      </div>

      {emailPreviewHtml ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6EBF1] px-4 py-3">
              <p className="font-semibold text-[#071F5E]">{t.previewEmailTitle}</p>
              <button
                type="button"
                onClick={() => setEmailPreviewHtml(null)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-[#071F5E]"
              >
                {t.closePreview}
              </button>
            </div>
            <iframe
              title={t.previewEmailTitle}
              srcDoc={emailPreviewHtml}
              className="min-h-[60vh] w-full flex-1 border-0"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
