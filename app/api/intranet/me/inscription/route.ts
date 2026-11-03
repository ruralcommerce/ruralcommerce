import { NextResponse } from 'next/server';
import { resolveBeneficiaryRecord, publicBeneficiaryPayload } from '@/lib/intranet/candidate-access';

export const runtime = 'nodejs';

/** Current beneficiary inscription from unified intranet session (or legacy body). */
export async function GET(request: Request) {
  const auth = await resolveBeneficiaryRecord(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }
  return NextResponse.json({ ok: true, record: publicBeneficiaryPayload(auth.record) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const auth = await resolveBeneficiaryRecord(request, body);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }
  return NextResponse.json({ ok: true, record: publicBeneficiaryPayload(auth.record) });
}
