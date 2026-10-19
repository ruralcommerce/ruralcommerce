import { NextResponse } from 'next/server';
import { actividadStaff, staffUnauthorized } from '@/lib/actividades/staff';
import { activitiesToCsv, getActivity, listActivities } from '@/lib/actividades/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();

  const id = new URL(request.url).searchParams.get('id') || '';
  const one = id ? await getActivity(id) : null;
  if (id && !one) {
    return NextResponse.json({ ok: false, message: 'Actividad no encontrada' }, { status: 404 });
  }
  const activities = one ? [one] : await listActivities();

  const csv = activitiesToCsv(activities);
  const filename = id ? `actividad-${id}.csv` : 'actividades.csv';
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
