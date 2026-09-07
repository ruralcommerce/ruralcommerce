import { NextResponse } from 'next/server';
import { authenticateCandidate, isApprovedWithAgreement, sanitizeInscriptionRecord } from '@/lib/project-candidate-auth';
import { readInvestments } from '@/lib/project-investment-store';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }
  const body = (payload || {}) as Record<string, unknown>;
  const auth = await authenticateCandidate(trimField(body.email, 254), trimField(body.password, 128));
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const participantId = typeof auth.record.id === 'string' ? auth.record.id : '';
  const records = (await readInvestments()).filter((item) => item.participantId === participantId);
  return NextResponse.json({
    ok: true,
    eligible: isApprovedWithAgreement(auth.record),
    records,
    participant: sanitizeInscriptionRecord(auth.record),
  });
}
