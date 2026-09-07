import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { inscriptionEmail, inscriptionProfile, readInscriptionRecords } from '@/lib/project-candidate-auth';
import { indicatorUsd, readInvestments } from '@/lib/project-investments';

export async function GET(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
  }

  const investments = await readInvestments();
  const inscriptions = await readInscriptionRecords();
  const byId = new Map(inscriptions.map((item) => [typeof item.id === 'string' ? item.id : '', item]));

  const header = [
    'id',
    'status',
    'participant',
    'email',
    'organization',
    'category',
    'description',
    'currency',
    'amount_original',
    'usd_estimated',
    'usd_18a',
    'attributable',
    'receipts',
    'signed_at',
    'reviewed_at',
    'document_id',
  ];
  const rows = investments
    .filter((item) => item.status !== 'draft')
    .map((item) => {
      const participant = byId.get(item.participantId);
      const profile = participant ? inscriptionProfile(participant) : {};
      const usd18a = indicatorUsd(item);
      const cells = [
        item.id,
        item.status,
        typeof profile.name === 'string' ? profile.name : '',
        participant ? inscriptionEmail(participant) : '',
        typeof profile.organization === 'string' ? profile.organization : '',
        item.category || '',
        (item.description || item.what || '').replace(/\s+/g, ' '),
        item.currency || '',
        item.amountOriginal ?? '',
        item.amountUsdEstimated ?? '',
        usd18a,
        item.attributable || '',
        item.files.filter((file) => file.kind === 'receipt').length,
        item.signature?.signedAt || '',
        item.review?.reviewedAt || '',
        item.signature?.documentId || '',
      ];
      return cells.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
    });

  const csv = `${header.join(',')}\n${rows.join('\n')}\n`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inversiones-18a.csv"',
    },
  });
}
