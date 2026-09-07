'use client';

import { getProjectLocaleKey } from '@/lib/project-locale';
import {
  getInvestmentStageStates,
  isPendingDocumentation,
  type InvestmentRecord,
  type InvestmentStageId,
} from '@/lib/project-investments';

const labels: Record<
  'es' | 'pt-BR' | 'en',
  {
    title: string;
    pendingTitle: string;
    pendingDocs: string;
    now: string;
    stages: Record<InvestmentStageId, { name: string; pending: string }>;
  }
> = {
  es: {
    title: 'Etapas',
    pendingTitle: 'Pendiente ahora',
    pendingDocs: 'Pendiente de envío de documentación',
    now: 'Estás aquí',
    stages: {
      story: { name: 'Qué hiciste', pending: 'Falta contar qué compraste o mejoraste.' },
      amount: { name: 'Cuánto', pending: 'Falta decir el monto o marcar que está en el papel.' },
      receipt: { name: 'Comprobante', pending: 'Falta la factura, recibo o comprobante de pago.' },
      signature: { name: 'Firma', pending: 'Falta firmar con tu nombre.' },
      review: { name: 'Revisión', pending: 'El equipo técnico todavía no revisó.' },
    },
  },
  'pt-BR': {
    title: 'Etapas',
    pendingTitle: 'Pendente agora',
    pendingDocs: 'Pendente de envio da documentação',
    now: 'Você está aqui',
    stages: {
      story: { name: 'O que fez', pending: 'Falta contar o que comprou ou melhorou.' },
      amount: { name: 'Quanto', pending: 'Falta o valor ou marcar que está no papel.' },
      receipt: { name: 'Comprovante', pending: 'Falta a fatura, recibo ou comprovante de pagamento.' },
      signature: { name: 'Assinatura', pending: 'Falta assinar com seu nome.' },
      review: { name: 'Revisão', pending: 'A equipe técnica ainda não revisou.' },
    },
  },
  en: {
    title: 'Stages',
    pendingTitle: 'Pending now',
    pendingDocs: 'Pending documentation',
    now: 'You are here',
    stages: {
      story: { name: 'What you did', pending: 'Still need to say what you bought or improved.' },
      amount: { name: 'Amount', pending: 'Still need the amount, or mark that it is on the paper.' },
      receipt: { name: 'Receipt', pending: 'Still need the invoice, receipt or payment proof.' },
      signature: { name: 'Signature', pending: 'Still need to sign with your name.' },
      review: { name: 'Review', pending: 'The technical team has not reviewed it yet.' },
    },
  },
};

export function ProjectInvestmentStageMarker({
  locale,
  record,
  compact = false,
}: {
  locale: string;
  record: InvestmentRecord;
  compact?: boolean;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = labels[localeKey];
  const states = getInvestmentStageStates(record);
  const current = states.find((item) => item.current && !item.done) || states.find((item) => item.current);
  const pendingText = current && !current.done ? t.stages[current.id].pending : '';
  const showPendingBanner = isPendingDocumentation(record);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {showPendingBanner ? (
        <p className="rounded-xl bg-[#FFF6F0] px-3 py-2 text-sm font-semibold text-[#8A4B12]">{t.pendingDocs}</p>
      ) : null}
      <div className="flex gap-1 sm:gap-2">
        {states.map((item, index) => (
          <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                item.done
                  ? 'bg-[#1D6359] text-white'
                  : item.current
                    ? 'bg-[#52ADAD] text-[#071F5E]'
                    : 'bg-[#E6EBF1] text-[#2F3336]/50'
              }`}
            >
              {item.done ? '✓' : index + 1}
            </span>
            <span className={`mt-1 text-[10px] leading-tight sm:text-xs ${item.current ? 'font-semibold text-[#071F5E]' : 'text-[#2F3336]/65'}`}>
              {t.stages[item.id].name}
            </span>
          </div>
        ))}
      </div>
      {pendingText ? (
        <p className="text-sm text-[#2F3336]/85">
          <span className="font-semibold text-[#1D6359]">{t.pendingTitle}:</span> {pendingText}
        </p>
      ) : null}
    </div>
  );
}
