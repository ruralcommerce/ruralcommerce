import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import {
  authenticateCandidate,
  clientIp,
  inscriptionEmail,
  inscriptionProfile,
  isApprovedWithAgreement,
  readInscriptionRecords,
  sanitizeInscriptionRecord,
} from '@/lib/project-candidate-auth';
import {
  canSubmitInvestment,
  estimateUsd,
  getCrcPerUsd,
  isInvestmentCategory,
  isPendingDocumentation,
  type InvestmentAmountKind,
  type InvestmentAttributable,
  type InvestmentCurrency,
  type InvestmentRecord,
} from '@/lib/project-investments';
import {
  createInvestmentDocumentIds,
  createInvestmentId,
  readInvestments,
  writeInvestments,
} from '@/lib/project-investment-store';
import { notifyTeamInvestmentSubmitted } from '@/lib/project-investment-notify';
import { appendAuditEntry } from '@/lib/project-audit-log';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function parseAmountKind(value: unknown): InvestmentAmountKind | undefined {
  return value === 'exact' || value === 'approximate' || value === 'unknown' ? value : undefined;
}

function parseAttributable(value: unknown): InvestmentAttributable | undefined {
  return value === 'yes' || value === 'partial' || value === 'no' ? value : undefined;
}

function parseCurrency(value: unknown): InvestmentCurrency | undefined {
  return value === 'CRC' || value === 'USD' ? value : undefined;
}

function applyDraftFields(record: InvestmentRecord, body: Record<string, unknown>) {
  if (isInvestmentCategory(body.category)) record.category = body.category;
  if (typeof body.what === 'string') record.what = trimField(body.what, 240);
  if (typeof body.why === 'string') record.why = trimField(body.why, 240);
  if (typeof body.description === 'string') record.description = trimField(body.description, 800);
  const attributable = parseAttributable(body.attributable);
  if (attributable) record.attributable = attributable;
  const amountKind = parseAmountKind(body.amountKind);
  if (amountKind) record.amountKind = amountKind;
  const currency = parseCurrency(body.currency);
  if (currency) record.currency = currency;
  if (body.amountOriginal === null) {
    record.amountOriginal = undefined;
  } else if (typeof body.amountOriginal === 'number' && Number.isFinite(body.amountOriginal)) {
    record.amountOriginal = Math.max(0, body.amountOriginal);
  } else if (typeof body.amountOriginal === 'string' && body.amountOriginal.trim()) {
    const parsed = Number(body.amountOriginal.replace(',', '.'));
    if (Number.isFinite(parsed)) record.amountOriginal = Math.max(0, parsed);
  }
  if (typeof body.spentAt === 'string') record.spentAt = trimField(body.spentAt, 32);
  record.exchangeRateUsed = getCrcPerUsd();
  record.amountUsdEstimated = estimateUsd(record.amountOriginal, record.currency || 'CRC', record.exchangeRateUsed);
  record.updatedAt = new Date().toISOString();
}

export async function GET(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  const investments = await readInvestments();
  const inscriptions = await readInscriptionRecords();
  const byId = new Map(inscriptions.map((item) => [typeof item.id === 'string' ? item.id : '', item]));
  const records = investments.map((item) => {
      const participant = byId.get(item.participantId);
      const profile = participant ? inscriptionProfile(participant) : {};
      return {
        ...item,
        participant: participant
          ? {
              id: participant.id,
              name: typeof profile.name === 'string' ? profile.name : '',
              email: inscriptionEmail(participant),
              organization: typeof profile.organization === 'string' ? profile.organization : '',
              city: typeof profile.city === 'string' ? profile.city : '',
            }
          : null,
      };
    });

  const acceptedUsd = records
    .filter((item) => item.status === 'accepted_18a')
    .reduce((sum, item) => sum + (item.review?.amountUsdFinal ?? item.amountUsdEstimated ?? 0), 0);

  return NextResponse.json({
    ok: true,
    records,
    totals: {
      submitted: records.filter((item) => item.status === 'submitted').length,
      pending: records.filter((item) => item.status === 'submitted').length,
      pendingDocs: records.filter((item) => isPendingDocumentation(item)).length,
      acceptedUsd: Math.round(acceptedUsd * 100) / 100,
    },
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = (payload || {}) as Record<string, unknown>;
  const email = trimField(body.email, 254);
  const password = trimField(body.password, 128);
  const auth = await authenticateCandidate(email, password);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }
  if (!isApprovedWithAgreement(auth.record)) {
    return NextResponse.json(
      { ok: false, message: 'Debes tener el perfil aprobado y el convenio firmado.' },
      { status: 403 }
    );
  }

  const participantId = typeof auth.record.id === 'string' ? auth.record.id : '';
  const investments = await readInvestments();
  const existingId = trimField(body.id, 80);
  let record = existingId ? investments.find((item) => item.id === existingId) : undefined;

  if (record && record.participantId !== participantId) {
    return NextResponse.json({ ok: false, message: 'Inversión no encontrada.' }, { status: 404 });
  }

  if (!record) {
    const now = new Date().toISOString();
    record = {
      id: createInvestmentId(),
      participantId,
      status: 'draft',
      files: [],
      locale: trimField(body.locale, 10) || 'es',
      createdAt: now,
      updatedAt: now,
    };
    investments.push(record);
  }

  if (record.status !== 'draft') {
    return NextResponse.json({ ok: false, message: 'Esta inversión ya fue firmada.' }, { status: 409 });
  }

  applyDraftFields(record, body);

  const submit = body.submit === true;
  if (submit) {
    if (!canSubmitInvestment(record)) {
      return NextResponse.json(
        { ok: false, message: 'Faltan datos o el comprobante (factura / recibo).' },
        { status: 400 }
      );
    }
    const fullName = trimField(body.fullName, 160);
    const paidByMe = body.paidByMe === true;
    const documentsReal = body.documentsReal === true;
    const projectRelated = body.projectRelated === true;
    const authorizeUse = body.authorizeUse === true;
    if (!fullName || !paidByMe || !documentsReal || !projectRelated || !authorizeUse) {
      return NextResponse.json({ ok: false, message: 'Debes firmar y aceptar las declaraciones.' }, { status: 400 });
    }
    if (record.attributable === 'no') {
      record.status = 'not_attributable';
    } else {
      record.status = 'submitted';
    }
    const ids = createInvestmentDocumentIds();
    const signedAt = new Date().toISOString();
    record.signature = {
      signed: true,
      signedAt,
      fullName,
      documentId: ids.documentId,
      verificationCode: ids.verificationCode,
      paidByMe,
      documentsReal,
      projectRelated,
      authorizeUse,
      locale: trimField(body.locale, 10) || record.locale || 'es',
      ip: clientIp(request),
    };
    record.submittedAt = signedAt;
    record.updatedAt = signedAt;
  }

  await writeInvestments(investments);

  if (submit) {
    try {
      await appendAuditEntry({
        action: 'investment_submit',
        actorType: 'candidate',
        actorId: participantId,
        actorName: record.signature?.fullName,
        targetRecordId: record.id,
        metadata: { status: record.status, receipts: record.files.filter((file) => file.kind === 'receipt').length },
      });
      await notifyTeamInvestmentSubmitted({ investment: record, participant: auth.record });
    } catch (error) {
      console.error('[investments] notify/audit failed:', error);
    }
  }

  return NextResponse.json({
    ok: true,
    record,
    participant: sanitizeInscriptionRecord(auth.record),
  });
}
