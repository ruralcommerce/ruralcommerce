import { NextResponse } from 'next/server';
import { authenticateCandidate, isApprovedWithAgreement } from '@/lib/project-candidate-auth';
import {
  isAllowedInvestmentFile,
  MAX_INVESTMENT_FILE_BYTES,
  MAX_RECEIPT_FILES,
  sanitizeFileName,
  type InvestmentFileKind,
} from '@/lib/project-investments';
import { createInvestmentFileId, readInvestments, writeInvestments } from '@/lib/project-investment-store';
import { putProjectR2Object, r2ObjectKey, isProjectR2Configured } from '@/lib/project-r2';

export const runtime = 'nodejs';

function kindFromForm(value: FormDataEntryValue | null): InvestmentFileKind {
  return value === 'object' ? 'object' : 'receipt';
}

export async function POST(request: Request) {
  if (!isProjectR2Configured()) {
    return NextResponse.json({ ok: false, message: 'El almacén de archivos no está configurado.' }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'No se pudo leer el archivo.' }, { status: 400 });
  }

  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const investmentId = String(form.get('investmentId') || '');
  const kind = kindFromForm(form.get('kind'));
  const file = form.get('file');

  const auth = await authenticateCandidate(email, password);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }
  if (!isApprovedWithAgreement(auth.record)) {
    return NextResponse.json({ ok: false, message: 'Debes firmar el convenio primero.' }, { status: 403 });
  }
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ ok: false, message: 'Sube una foto o un PDF del comprobante.' }, { status: 400 });
  }

  const rawType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  const lowerName = (file.name || '').toLowerCase();
  const contentType =
    rawType ||
    (lowerName.endsWith('.pdf')
      ? 'application/pdf'
      : lowerName.endsWith('.png')
        ? 'image/png'
        : lowerName.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg');
  if (!isAllowedInvestmentFile(contentType, file.size)) {
    return NextResponse.json(
      { ok: false, message: 'Usa foto JPG/PNG o PDF, de hasta 10 MB, nítida y completa.' },
      { status: 400 }
    );
  }

  const participantId = typeof auth.record.id === 'string' ? auth.record.id : '';
  const investments = await readInvestments();
  const record = investments.find((item) => item.id === investmentId && item.participantId === participantId);
  if (!record || record.status !== 'draft') {
    return NextResponse.json({ ok: false, message: 'Inversión no encontrada o ya firmada.' }, { status: 404 });
  }

  if (kind === 'receipt' && record.files.filter((item) => item.kind === 'receipt').length >= MAX_RECEIPT_FILES) {
    return NextResponse.json({ ok: false, message: `Máximo ${MAX_RECEIPT_FILES} comprobantes.` }, { status: 400 });
  }

  const fileId = createInvestmentFileId();
  const originalName = sanitizeFileName(file.name || 'comprobante');
  const key = r2ObjectKey(`${participantId}/${record.id}/${fileId}-${originalName}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_INVESTMENT_FILE_BYTES) {
    return NextResponse.json({ ok: false, message: 'El archivo pesa más de 10 MB.' }, { status: 400 });
  }

  await putProjectR2Object({ key, body: buffer, contentType });

  const uploaded = {
    id: fileId,
    kind,
    key,
    originalName,
    contentType,
    size: buffer.byteLength,
    uploadedAt: new Date().toISOString(),
  };
  record.files.push(uploaded);
  record.updatedAt = uploaded.uploadedAt;
  await writeInvestments(investments);

  return NextResponse.json({ ok: true, file: uploaded, record });
}
