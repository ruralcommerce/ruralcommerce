'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProjectLocaleKey, mapProjectApiMessage } from '@/lib/project-locale';
import { canAcceptInvestmentFor18a, isPendingDocumentation, type InvestmentRecord } from '@/lib/project-investments';
import { ProjectInvestmentStageMarker } from '@/components/ProjectInvestmentStageMarker';

type AdminInvestment = InvestmentRecord & {
  participant?: {
    id: string;
    name: string;
    email: string;
    organization: string;
    city: string;
  } | null;
};

const copy = {
  es: {
    title: 'Inversiones de beneficiarios (18a)',
    hint: 'Sin factura/recibo o sin firma no se acepta para el 18a: queda pendiente de documentación. El marcador muestra la etapa y lo que falta.',
    pending: 'En revisión',
    pendingDocs: 'Pendiente de documentación',
    accepted: 'Aceptadas 18a',
    totalUsd: 'Total USD 18a',
    filterAll: 'Todas',
    cannotAccept: 'No se puede aceptar: falta comprobante o firma.',
    sendDigest: 'Enviar informe de este mes',
    sending: 'Enviando...',
    exportCsv: 'Exportar CSV 18a',
    accept: 'Aceptar para 18a',
    reject: 'Rechazar',
    notAttr: 'No atribuible',
    usdLabel: 'USD final (indicador)',
    notes: 'Nota interna',
    save: 'Guardar revisión',
    openFile: 'Ver comprobante',
    empty: 'Aún no hay fichas. Las incompletas aparecen como pendiente de documentación.',
    digestOk: 'Informe enviado al equipo y recordatorios a quien no subió nada.',
  },
  'pt-BR': {
    title: 'Investimentos dos beneficiários (18a)',
    hint: 'Sem fatura/recibo ou sem assinatura não se aceita no 18a: fica pendente de documentação. O marcador mostra a etapa e o que falta.',
    pending: 'Em revisão',
    pendingDocs: 'Pendente de documentação',
    accepted: 'Aceitas 18a',
    totalUsd: 'Total USD 18a',
    filterAll: 'Todas',
    cannotAccept: 'Não se pode aceitar: falta comprovante ou assinatura.',
    sendDigest: 'Enviar informe deste mês',
    sending: 'Enviando...',
    exportCsv: 'Exportar CSV 18a',
    accept: 'Aceitar para 18a',
    reject: 'Rejeitar',
    notAttr: 'Não atribuível',
    usdLabel: 'USD final (indicador)',
    notes: 'Nota interna',
    save: 'Salvar revisão',
    openFile: 'Ver comprovante',
    empty: 'Ainda não há fichas. As incompletas aparecem como pendente de documentação.',
    digestOk: 'Informe enviado à equipe e lembretes a quem não enviou nada.',
  },
  en: {
    title: 'Beneficiary investments (18a)',
    hint: 'Without a receipt or signature it cannot be accepted for 18a: it stays pending documentation. The marker shows the stage and what is missing.',
    pending: 'Under review',
    pendingDocs: 'Pending documentation',
    accepted: 'Accepted 18a',
    totalUsd: 'Total USD 18a',
    filterAll: 'All',
    cannotAccept: 'Cannot accept: receipt or signature is missing.',
    sendDigest: 'Send this month’s report',
    sending: 'Sending...',
    exportCsv: 'Export 18a CSV',
    accept: 'Accept for 18a',
    reject: 'Reject',
    notAttr: 'Not attributable',
    usdLabel: 'Final USD (indicator)',
    notes: 'Internal note',
    save: 'Save review',
    openFile: 'View receipt',
    empty: 'No records yet. Incomplete ones appear as pending documentation.',
    digestOk: 'Report sent to the team and reminders to those who uploaded nothing.',
  },
} as const;

export function ProjectInvestmentAdminPanel({
  locale,
  teamToken,
}: {
  locale: string;
  teamToken: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [records, setRecords] = useState<AdminInvestment[]>([]);
  const [totals, setTotals] = useState({ submitted: 0, pending: 0, pendingDocs: 0, acceptedUsd: 0 });
  const [filter, setFilter] = useState<'pending_docs' | 'submitted' | 'accepted_18a' | 'all'>('pending_docs');
  const [selected, setSelected] = useState<AdminInvestment | null>(null);
  const [usd, setUsd] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${teamToken}`, 'Content-Type': 'application/json' }),
    [teamToken]
  );

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/investments', { headers: { Authorization: `Bearer ${teamToken}` } });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(mapProjectApiMessage(payload.message, localeKey, 'Error'));
      }
      setRecords(payload.records || []);
      setTotals(payload.totals || { submitted: 0, pending: 0, pendingDocs: 0, acceptedUsd: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamToken]);

  const visible = records.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending_docs') return isPendingDocumentation(item);
    return item.status === filter;
  });

  async function openFile(record: AdminInvestment, fileId: string) {
    const response = await fetch(`/api/projeto/investments/${record.id}/file`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fileId }),
    });
    const payload = await response.json();
    if (payload.ok && payload.url) window.open(payload.url, '_blank', 'noopener,noreferrer');
  }

  async function review(decision: 'accepted_18a' | 'rejected' | 'not_attributable') {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/projeto/investments/${selected.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ decision, amountUsdFinal: usd, notes }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(mapProjectApiMessage(payload.message, localeKey, 'Error'));
      }
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1D6359]">18a</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#071F5E]">{t.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#2F3336]/75">{t.hint}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs uppercase text-[#1D6359]">{t.pendingDocs}</p>
          <p className="mt-1 text-2xl font-semibold text-[#071F5E]">{totals.pendingDocs}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs uppercase text-[#1D6359]">{t.pending}</p>
          <p className="mt-1 text-2xl font-semibold text-[#071F5E]">{totals.pending}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs uppercase text-[#1D6359]">{t.accepted}</p>
          <p className="mt-1 text-2xl font-semibold text-[#071F5E]">{records.filter((item) => item.status === 'accepted_18a').length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs uppercase text-[#1D6359]">{t.totalUsd}</p>
          <p className="mt-1 text-2xl font-semibold text-[#071F5E]">{totals.acceptedUsd.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['pending_docs', 'submitted', 'accepted_18a', 'all'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm ${filter === key ? 'bg-[#52ADAD] text-[#071F5E]' : 'border text-[#071F5E]'}`}
          >
            {key === 'submitted' ? t.pending : key === 'accepted_18a' ? t.accepted : key === 'pending_docs' ? t.pendingDocs : t.filterAll}
          </button>
        ))}
        <button
          type="button"
          className="rounded-full border px-4 py-2 text-sm"
          onClick={async () => {
            const response = await fetch('/api/projeto/investments/export', { headers: { Authorization: `Bearer ${teamToken}` } });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'inversiones-18a.csv';
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        >
          {t.exportCsv}
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-full border px-4 py-2 text-sm"
          onClick={async () => {
            setBusy(true);
            setInfo('');
            try {
              const response = await fetch('/api/projeto/investments/digest', { method: 'POST', headers, body: JSON.stringify({}) });
              const payload = await response.json();
              if (!response.ok || !payload.ok) throw new Error(payload.message || 'Error');
              setInfo(t.digestOk);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? t.sending : t.sendDigest}
        </button>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {info ? <p className="rounded-2xl bg-[#F3FAFA] p-3 text-sm text-[#1D6359]">{info}</p> : null}
      {loading ? <p className="text-sm">...</p> : null}
      {!loading && !visible.length ? <p className="text-sm text-[#2F3336]/70">{t.empty}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelected(item);
                setUsd(String(item.review?.amountUsdFinal ?? item.amountUsdEstimated ?? ''));
                setNotes(item.review?.notes || '');
              }}
              className="w-full rounded-2xl border bg-white p-4 text-left hover:border-[#52ADAD]"
            >
              <p className="font-semibold text-[#071F5E]">{item.participant?.organization || item.participant?.name || item.participantId}</p>
              <p className="mt-1 text-sm text-[#2F3336]/75">{item.what || item.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-[#1D6359]">
                {isPendingDocumentation(item) ? t.pendingDocs : item.status}
              </p>
              <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                <ProjectInvestmentStageMarker locale={localeKey} record={item} compact />
              </div>
            </button>
          ))}
        </div>
        {selected ? (
          <div className="rounded-2xl border bg-white p-4">
            <p className="font-semibold text-[#071F5E]">{selected.participant?.name}</p>
            <p className="text-sm">{selected.participant?.email}</p>
            <p className="mt-3 text-sm">{selected.description || selected.what}</p>
            <p className="mt-2 text-sm">
              {selected.currency} {selected.amountOriginal ?? '—'} · USD est. {selected.amountUsdEstimated ?? '—'}
            </p>
            <div className="mt-3">
              <ProjectInvestmentStageMarker locale={localeKey} record={selected} />
            </div>
            <div className="mt-3 space-y-2">
              {selected.files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="block w-full rounded-xl bg-[#F7FAFB] px-3 py-2 text-left text-sm"
                  onClick={() => void openFile(selected, file.id)}
                >
                  {t.openFile}: {file.originalName} ({file.kind})
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm">
              {t.usdLabel}
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={usd} onChange={(e) => setUsd(e.target.value)} />
            </label>
            <label className="mt-3 block text-sm">
              {t.notes}
              <textarea className="mt-1 w-full rounded-xl border px-3 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div className="mt-4 grid gap-2">
              {!canAcceptInvestmentFor18a(selected) ? (
                <p className="rounded-xl bg-[#FFF6F0] px-3 py-2 text-sm text-[#8A4B12]">{t.cannotAccept}</p>
              ) : null}
              <button
                type="button"
                disabled={busy || !canAcceptInvestmentFor18a(selected)}
                className="rounded-full bg-[#52ADAD] px-4 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={() => void review('accepted_18a')}
              >
                {t.accept}
              </button>
              <button type="button" disabled={busy} className="rounded-full border px-4 py-2 text-sm" onClick={() => void review('rejected')}>
                {t.reject}
              </button>
              <button type="button" disabled={busy} className="rounded-full border px-4 py-2 text-sm" onClick={() => void review('not_attributable')}>
                {t.notAttr}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
