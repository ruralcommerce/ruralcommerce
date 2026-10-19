import { NextResponse } from 'next/server';
import { cleanDeviceId, parseGeo } from '@/lib/actividades/geo';
import { jsonError } from '@/lib/actividades/http';
import { listImpulsaPeople } from '@/lib/actividades/impulsa';
import { actividadStaff, staffActor, staffUnauthorized } from '@/lib/actividades/staff';
import {
  addPeople,
  deleteActivity,
  getActivity,
  markParticipant,
  setActivityStatus,
  setSessionGeo,
  updateActivityMeta,
} from '@/lib/actividades/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  action?: string;
  title?: string;
  projectLabel?: string;
  place?: string;
  startsAt?: string;
  notes?: string;
  photoLinks?: unknown;
  inscriptionIds?: string[];
  person?: { name?: string; phone?: string; email?: string; organization?: string };
  participantId?: string;
  mark?: 'ausente' | 'restaurar' | 'anular';
  reason?: string;
  status?: 'abierta' | 'cerrada';
  geo?: unknown;
  deviceId?: string;
};

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();
  const activity = await getActivity(params.id);
  if (!activity) return NextResponse.json({ ok: false, message: 'Actividad no encontrada' }, { status: 404 });
  return NextResponse.json({ ok: true, activity });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();
  const actor = staffActor(session);
  const body = (await request.json().catch(() => ({}))) as Body;

  try {
    if (body.action === 'meta') {
      const activity = await updateActivityMeta(
        params.id,
        {
          title: body.title,
          projectLabel: body.projectLabel,
          place: body.place,
          startsAt: body.startsAt,
          notes: body.notes,
          photoLinks: body.photoLinks,
        },
        actor
      );
      return NextResponse.json({ ok: true, activity });
    }

    if (body.action === 'impulsa') {
      const ids = Array.isArray(body.inscriptionIds) ? body.inscriptionIds.filter((id) => typeof id === 'string') : [];
      const roster = await listImpulsaPeople();
      const selected = roster.filter((person) => ids.includes(person.id));
      if (!selected.length) {
        return NextResponse.json({ ok: false, message: 'Elige al menos una persona de Impulsa CR' }, { status: 400 });
      }
      const result = await addPeople(
        params.id,
        selected.map((person) => ({
          source: 'impulsa' as const,
          inscriptionId: person.id,
          name: person.name,
          phone: person.phone,
          email: person.email,
          organization: person.organization,
        })),
        actor
      );
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === 'manual') {
      const result = await addPeople(
        params.id,
        [
          {
            source: 'manual',
            name: body.person?.name || '',
            phone: body.person?.phone,
            email: body.person?.email,
            organization: body.person?.organization,
          },
        ],
        actor
      );
      if (!result.added && result.skipped) {
        return NextResponse.json(
          { ok: false, message: 'Esa persona ya está en la actividad', activity: result.activity },
          { status: 409 }
        );
      }
      if (!result.added) {
        return NextResponse.json({ ok: false, message: 'Escribe el nombre' }, { status: 400 });
      }
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === 'mark') {
      if (!body.participantId || !body.mark) {
        return NextResponse.json({ ok: false, message: 'Falta la persona' }, { status: 400 });
      }
      const activity = await markParticipant(params.id, body.participantId, body.mark, actor, body.reason);
      return NextResponse.json({ ok: true, activity });
    }

    if (body.action === 'status') {
      if (body.status !== 'abierta' && body.status !== 'cerrada') {
        return NextResponse.json({ ok: false, message: 'Estado inválido' }, { status: 400 });
      }
      const activity = await setActivityStatus(params.id, body.status, {
        userId: session.userId,
        name: session.name,
        email: session.email,
      });
      return NextResponse.json({ ok: true, activity });
    }

    if (body.action === 'session-geo') {
      const activity = await setSessionGeo(params.id, parseGeo(body.geo), cleanDeviceId(body.deviceId), actor);
      return NextResponse.json({ ok: true, activity });
    }

    return NextResponse.json({ ok: false, message: 'Acción desconocida' }, { status: 400 });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = actividadStaff();
  if (!session) return staffUnauthorized();
  try {
    await deleteActivity(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
