import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { authenticateCandidate } from '@/lib/project-candidate-auth';
import { getProjectR2DownloadUrl } from '@/lib/project-r2';
import { readInvestments } from '@/lib/project-investments';

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }
  const body = (payload || {}) as Record<string, unknown>;
  const fileId = trimField(body.fileId, 80);

  const investments = await readInvestments();
  const record = investments.find((item) => item.id === params.id);
  if (!record) {
    return NextResponse.json({ ok: false, message: 'Inversión no encontrada.' }, { status: 404 });
  }
  const file = record.files.find((item) => item.id === fileId);
  if (!file) {
    return NextResponse.json({ ok: false, message: 'Archivo no encontrado.' }, { status: 404 });
  }

  const team = verifyTeamAccess(request);
  if (!team.ok) {
    const auth = await authenticateCandidate(trimField(body.email, 254), trimField(body.password, 128));
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
    }
    const participantId = typeof auth.record.id === 'string' ? auth.record.id : '';
    if (record.participantId !== participantId) {
      return NextResponse.json({ ok: false, message: 'No autorizado.' }, { status: 403 });
    }
  }

  const url = await getProjectR2DownloadUrl(file.key, 600);
  return NextResponse.json({ ok: true, url, file: { id: file.id, originalName: file.originalName, contentType: file.contentType } });
}
