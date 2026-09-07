import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { estimateUsd, getCrcPerUsd, canAcceptInvestmentFor18a } from '@/lib/project-investments';
import { readInvestments, writeInvestments } from '@/lib/project-investment-store';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }
  const body = (payload || {}) as Record<string, unknown>;
  const decision = trimField(body.decision, 32);
  if (!['accepted_18a', 'rejected', 'not_attributable'].includes(decision)) {
    return NextResponse.json({ ok: false, message: 'Decisión inválida.' }, { status: 400 });
  }

  const investments = await readInvestments();
  const record = investments.find((item) => item.id === params.id);
  if (!record) {
    return NextResponse.json({ ok: false, message: 'Inversión no encontrada.' }, { status: 404 });
  }

  if (decision === 'accepted_18a' && !canAcceptInvestmentFor18a(record)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'No se puede aceptar: falta comprobante o firma. Queda pendiente de envío de documentación.',
        pendingDocumentation: true,
      },
      { status: 409 }
    );
  }

  let amountUsdFinal: number | undefined;
  if (typeof body.amountUsdFinal === 'number' && Number.isFinite(body.amountUsdFinal)) {
    amountUsdFinal = Math.max(0, Math.round(body.amountUsdFinal * 100) / 100);
  } else if (typeof body.amountUsdFinal === 'string' && body.amountUsdFinal.trim()) {
    const parsed = Number(body.amountUsdFinal.replace(',', '.'));
    if (Number.isFinite(parsed)) amountUsdFinal = Math.max(0, Math.round(parsed * 100) / 100);
  }
  if (amountUsdFinal == null) {
    amountUsdFinal = record.amountUsdEstimated ?? estimateUsd(record.amountOriginal, record.currency || 'CRC', getCrcPerUsd());
  }

  record.status = decision as typeof record.status;
  record.review = {
    reviewedAt: new Date().toISOString(),
    reviewerId: auth.session.memberId,
    reviewerName: auth.session.name,
    countsFor18a: decision === 'accepted_18a',
    amountUsdFinal: decision === 'accepted_18a' ? amountUsdFinal : 0,
    notes: trimField(body.notes, 800) || undefined,
  };
  record.updatedAt = record.review.reviewedAt;
  await writeInvestments(investments);

  await appendAuditEntry({
    action: 'investment_review',
    actorType: 'team',
    actorId: auth.session.memberId,
    actorName: auth.session.name,
    targetRecordId: record.id,
    metadata: { decision, amountUsdFinal: record.review.amountUsdFinal },
  });

  return NextResponse.json({ ok: true, record });
}
