import { NextResponse } from 'next/server';
import { parseGeo, cleanDeviceId } from '@/lib/actividades/geo';
import { jsonError } from '@/lib/actividades/http';
import { actividadStaff, staffActor, staffUnauthorized } from '@/lib/actividades/staff';
import { createActivity, listActivities } from '@/lib/actividades/store';
import type { ActivityKind } from '@/lib/actividades/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();
  const activities = await listActivities();
  return NextResponse.json({ ok: true, activities });
}

export async function POST(request: Request) {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();

  try {
    const body = (await request.json().catch(() => ({}))) as {
      kind?: ActivityKind;
      title?: string;
      projectLabel?: string;
      place?: string;
      startsAt?: string;
      notes?: string;
      geo?: unknown;
      deviceId?: string;
    };
    const activity = await createActivity({
      kind: body.kind || 'capacitacion',
      title: body.title || '',
      projectLabel: body.projectLabel,
      place: body.place,
      startsAt: body.startsAt,
      notes: body.notes,
      geo: parseGeo(body.geo),
      deviceId: cleanDeviceId(body.deviceId),
      actor: {
        userId: session.userId,
        name: session.name,
        email: session.email,
      },
    });
    return NextResponse.json({ ok: true, activity, actor: staffActor(session) });
  } catch (err) {
    return jsonError(err);
  }
}
