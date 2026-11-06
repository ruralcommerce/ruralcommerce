import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { resolveBeneficiaryRecord, publicBeneficiaryPayload } from '@/lib/intranet/candidate-access';
import { normalizeProjectSex } from '@/lib/project-sex';

export const runtime = 'nodejs';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

const MAX = {
  name: 160,
  phone: 40,
  organization: 200,
  city: 120,
  interest: 120,
  message: 3000,
  cooperative: 160,
  email: 254,
  password: 128,
} as const;

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/** Authenticated candidate updates their registration profile fields. */
export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, MAX.email);
  const password = trimField(body.password, MAX.password);
  const name = trimField(body.name, MAX.name);
  const phone = trimField(body.phone, MAX.phone);
  const organization = trimField(body.organization, MAX.organization);
  const city = trimField(body.city, MAX.city);
  const interest = trimField(body.interest, MAX.interest);
  const message = trimField(body.message, MAX.message);
  const cooperative = trimField(body.cooperative, MAX.cooperative);
  const sex = normalizeProjectSex(body.sex);

  if (!name) {
    return NextResponse.json({ ok: false, message: 'Nombre es obligatorio.' }, { status: 400 });
  }

  const auth = await resolveBeneficiaryRecord(request, { email, password });
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { record, records } = auth;
  const index = records.findIndex((item) => item.id === record.id);
  if (index < 0) {
    return NextResponse.json({ ok: false, message: 'Inscripción no encontrada.' }, { status: 404 });
  }

  const profile = ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
  const answers =
    typeof profile.answers === 'object' && profile.answers !== null
      ? ({ ...(profile.answers as Record<string, unknown>) } as Record<string, unknown>)
      : null;

  if (answers) {
    if (organization) answers.q1 = organization;
    answers.q2 = name;
    if (phone) answers.q3 = phone;
    if (city) answers.q5 = city;
    if (interest) answers.q7 = interest;
    if (message) answers.q15 = message;
  }

  const nextProfile: Record<string, unknown> = {
    ...profile,
    name,
    phone: phone || (typeof profile.phone === 'string' ? profile.phone : ''),
    organization: organization || (typeof profile.organization === 'string' ? profile.organization : ''),
    city: city || (typeof profile.city === 'string' ? profile.city : ''),
    interest: interest || (typeof profile.interest === 'string' ? profile.interest : ''),
    message: message || (typeof profile.message === 'string' ? profile.message : ''),
    answers,
  };

  if (cooperative || typeof profile.cooperative === 'string') {
    nextProfile.cooperative = cooperative || profile.cooperative || '';
  }
  if (sex) {
    nextProfile.sex = sex;
  }

  const nextRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
    profile: nextProfile,
  };
  records[index] = nextRecord;
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');

  return NextResponse.json({ ok: true, record: publicBeneficiaryPayload(nextRecord) });
}
