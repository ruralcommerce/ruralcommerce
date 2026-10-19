import { NextResponse } from 'next/server';
import { listImpulsaPeople } from '@/lib/actividades/impulsa';
import { actividadStaff, staffUnauthorized } from '@/lib/actividades/staff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();
  const people = await listImpulsaPeople();
  return NextResponse.json({ ok: true, people });
}
