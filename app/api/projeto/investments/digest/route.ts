import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { sendInvestmentMonthlyDigest } from '@/lib/project-investment-notify';
import { monthKey } from '@/lib/project-investments';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const cronSecret = (process.env.PROJETO_CRON_SECRET || '').trim();
  const providedSecret = trimField(payload.secret, 200) || request.headers.get('x-cron-secret') || '';
  const cronOk = Boolean(cronSecret) && providedSecret === cronSecret;
  const team = verifyTeamAccess(request);

  if (!cronOk && !team.ok) {
    return NextResponse.json({ ok: false, message: 'No autorizado.' }, { status: 401 });
  }

  const month = trimField(payload.month, 7) || monthKey();
  const remindBeneficiaries = payload.remindBeneficiaries !== false;
  const result = await sendInvestmentMonthlyDigest({ month, remindBeneficiaries });
  return NextResponse.json({ ok: true, result });
}
