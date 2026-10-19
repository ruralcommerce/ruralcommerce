import { randomBytes } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { normalizePhone } from '@/lib/project-phone';
import { classifyGeo, cleanDeviceId } from './geo';
import type {
  Activity,
  ActivityActor,
  ActivityKind,
  ActivityParticipant,
  ActivityStatus,
  GeoFix,
  GeoStatus,
  ParticipantSource,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'actividades.json');
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_PEOPLE = 300;

export class ActividadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function now() {
  return new Date().toISOString();
}

function clean(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F]/g, '').trim().slice(0, max);
}

function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return digits.slice(-8);
}

function storePhone(phone: string) {
  return normalizePhone(phone) || clean(phone, 40);
}

function isEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseStarts(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) throw new ActividadError(400, 'Fecha inválida');
  return date.toISOString();
}

export function parsePhotoLinks(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\s,]+/)
      : [];
  const links: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const url = item.trim();
    if (!/^https?:\/\//i.test(url) || url.length > 500) continue;
    if (!links.includes(url)) links.push(url);
    if (links.length >= 20) break;
  }
  return links;
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(3).toString('hex')}`;
}

function makeInviteCode(taken: Set<string>) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const bytes = randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i += 1) code += INVITE_ALPHABET[bytes[i] % INVITE_ALPHABET.length];
    if (!taken.has(code)) return code;
  }
  return randomBytes(4).toString('hex').toUpperCase();
}

function makeToken() {
  return randomBytes(12).toString('base64url');
}

async function readAll(): Promise<Activity[]> {
  try {
    const parsed = JSON.parse(await readFile(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? (parsed as Activity[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(activities: Activity[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(activities, null, 2), 'utf8');
}

function audit(activity: Activity, actor: string, action: string, detail?: string) {
  activity.audit.unshift({ at: now(), actor, action, detail });
  if (activity.audit.length > 200) activity.audit.length = 200;
}

function assertOpen(activity: Activity) {
  if (activity.status === 'cerrada') {
    throw new ActividadError(409, 'La actividad está cerrada. Reábrela para corregir la lista.');
  }
}

function applyDeviceFlags(activity: Activity) {
  const counts = new Map<string, number>();
  for (const person of activity.participants) {
    if (person.state !== 'presente' || !person.confirmDeviceId) continue;
    counts.set(person.confirmDeviceId, (counts.get(person.confirmDeviceId) || 0) + 1);
  }
  for (const person of activity.participants) {
    if (person.state !== 'presente' || !person.confirmDeviceId) {
      person.sameDevice = false;
      continue;
    }
    const shared = (counts.get(person.confirmDeviceId) || 0) > 1;
    const technicianPhone = Boolean(
      activity.sessionDeviceId && person.confirmDeviceId === activity.sessionDeviceId
    );
    person.sameDevice = shared || technicianPhone;
  }
}

function touch(activity: Activity) {
  applyDeviceFlags(activity);
  activity.updatedAt = now();
}

async function mutate(id: string, fn: (activity: Activity) => void): Promise<Activity> {
  return withLock(async () => {
    const all = await readAll();
    const activity = all.find((item) => item.id === id);
    if (!activity) throw new ActividadError(404, 'Actividad no encontrada');
    fn(activity);
    touch(activity);
    await writeAll(all);
    return activity;
  });
}

export function activityStats(activity: Activity) {
  const counts = { invitado: 0, inscrito: 0, presente: 0, ausente: 0 };
  for (const person of activity.participants) counts[person.state] += 1;
  return {
    counts,
    sameDevice: activity.participants.some((person) => person.state === 'presente' && person.sameDevice),
    lejos: activity.participants.filter((person) => person.geoStatus === 'lejos').length,
    sinGps: activity.participants.filter(
      (person) => person.state === 'presente' && person.geoStatus === 'sin_gps'
    ).length,
  };
}

export async function listActivities(): Promise<Activity[]> {
  const all = await readAll();
  return all.sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1));
}

export async function getActivity(id: string): Promise<Activity | null> {
  const all = await readAll();
  return all.find((item) => item.id === id) || null;
}

export async function createActivity(input: {
  kind: ActivityKind;
  title: string;
  projectLabel?: string;
  place?: string;
  startsAt?: string;
  notes?: string;
  geo?: GeoFix | null;
  deviceId?: string;
  actor: ActivityActor;
}): Promise<Activity> {
  if (input.kind !== 'capacitacion' && input.kind !== 'visita') {
    throw new ActividadError(400, 'Elige capacitación o visita de campo');
  }
  const title = clean(input.title, 160);
  if (title.length < 2) throw new ActividadError(400, 'Escribe el título de la actividad');

  return withLock(async () => {
    const all = await readAll();
    const stamp = now();
    const activity: Activity = {
      id: makeId('act'),
      kind: input.kind,
      title,
      projectLabel: clean(input.projectLabel, 120),
      place: clean(input.place, 160),
      startsAt: parseStarts(input.startsAt),
      notes: clean(input.notes, 4000),
      photoLinks: [],
      status: 'abierta',
      inviteCode: makeInviteCode(new Set(all.map((item) => item.inviteCode))),
      openedAt: stamp,
      updatedAt: stamp,
      openedBy: input.actor,
      sessionGeo: input.geo || null,
      sessionDeviceId: cleanDeviceId(input.deviceId),
      participants: [],
      audit: [],
    };
    audit(activity, `${input.actor.name} (${input.actor.email})`, 'Actividad creada', activity.kind);
    all.unshift(activity);
    await writeAll(all);
    return activity;
  });
}

function newParticipant(input: {
  source: ParticipantSource;
  inscriptionId?: string;
  name: string;
  phone: string;
  email: string;
  organization: string;
  state: ActivityParticipant['state'];
}): ActivityParticipant {
  const stamp = now();
  return {
    id: makeId('par'),
    source: input.source,
    inscriptionId: input.inscriptionId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    organization: input.organization,
    state: input.state,
    confirmToken: makeToken(),
    invitedAt: input.state === 'invitado' ? stamp : undefined,
    enrolledAt: input.state === 'inscrito' ? stamp : undefined,
  };
}

export async function addPeople(
  id: string,
  people: Array<{
    source: 'impulsa' | 'manual';
    inscriptionId?: string;
    name: string;
    phone?: string;
    email?: string;
    organization?: string;
  }>,
  actor: string
): Promise<{ activity: Activity; added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;
  const activity = await mutate(id, (current) => {
    assertOpen(current);
    for (const person of people) {
      const name = clean(person.name, 160);
      if (name.length < 2) continue;
      const phone = storePhone(clean(person.phone, 40));
      const email = clean(person.email, 254);
      if (!isEmail(email)) throw new ActividadError(400, 'Correo inválido');
      if (person.source === 'impulsa' && person.inscriptionId) {
        if (current.participants.some((item) => item.inscriptionId === person.inscriptionId)) {
          skipped += 1;
          continue;
        }
      } else if (phoneKey(phone) && current.participants.some((item) => phoneKey(item.phone) === phoneKey(phone))) {
        skipped += 1;
        continue;
      }
      if (current.participants.length >= MAX_PEOPLE) {
        throw new ActividadError(400, 'Esta actividad ya tiene el máximo de personas.');
      }
      current.participants.push(
        newParticipant({
          source: person.source,
          inscriptionId: person.source === 'impulsa' ? clean(person.inscriptionId, 80) : undefined,
          name,
          phone,
          email,
          organization: clean(person.organization, 200),
          state: person.source === 'impulsa' ? 'invitado' : 'inscrito',
        })
      );
      added += 1;
    }
    if (added > 0) audit(current, actor, 'Personas agregadas', String(added));
  });
  return { activity, added, skipped };
}

export async function enrollByInvite(
  code: string,
  input: { name?: string; phone?: string; email?: string; organization?: string }
): Promise<{ activity: Activity; participant: ActivityParticipant; already: boolean }> {
  const inviteCode = clean(code, 16).toUpperCase();
  const name = clean(input.name, 160);
  const phone = storePhone(clean(input.phone, 40));
  const email = clean(input.email, 254);
  const organization = clean(input.organization, 200);
  if (name.length < 2) throw new ActividadError(400, 'Escribe tu nombre');
  if (!phoneKey(phone)) throw new ActividadError(400, 'Escribe un teléfono válido');
  if (!isEmail(email)) throw new ActividadError(400, 'Correo inválido');

  return withLock(async () => {
    const all = await readAll();
    const activity = all.find((item) => item.inviteCode.toUpperCase() === inviteCode);
    if (!activity) throw new ActividadError(404, 'Actividad no encontrada');
    if (activity.kind !== 'capacitacion') {
      throw new ActividadError(400, 'Esta visita no admite inscripción abierta');
    }
    if (activity.status !== 'abierta') throw new ActividadError(409, 'La actividad está cerrada');

    const key = phoneKey(phone);
    const existing = activity.participants.find((item) => phoneKey(item.phone) === key);
    if (existing) return { activity, participant: existing, already: true };
    if (activity.participants.length >= MAX_PEOPLE) {
      throw new ActividadError(400, 'Esta actividad ya no acepta más inscripciones');
    }

    const participant = newParticipant({
      source: 'convite',
      name,
      phone,
      email,
      organization,
      state: 'inscrito',
    });
    activity.participants.push(participant);
    audit(activity, name, 'Inscripción por convite', phone);
    touch(activity);
    await writeAll(all);
    return { activity, participant, already: false };
  });
}

export async function confirmByToken(
  token: string,
  geo: GeoFix | null,
  deviceId: string
): Promise<{ activity: Activity; participant: ActivityParticipant; already: boolean }> {
  const confirmToken = clean(token, 80);
  if (!confirmToken) throw new ActividadError(404, 'Enlace inválido');

  return withLock(async () => {
    const all = await readAll();
    const activity = all.find((item) => item.participants.some((person) => person.confirmToken === confirmToken));
    if (!activity) throw new ActividadError(404, 'Enlace inválido');
    const participant = activity.participants.find((person) => person.confirmToken === confirmToken);
    if (!participant) throw new ActividadError(404, 'Enlace inválido');
    if (activity.status !== 'abierta') throw new ActividadError(409, 'La actividad está cerrada');
    if (participant.state === 'presente') {
      return { activity, participant, already: true };
    }

    participant.state = 'presente';
    participant.confirmedAt = now();
    participant.confirmGeo = geo;
    participant.confirmDeviceId = cleanDeviceId(deviceId) || undefined;
    participant.geoStatus = classifyGeo(activity.sessionGeo, geo);
    audit(activity, participant.name, 'Presencia confirmada', participant.geoStatus);
    touch(activity);
    await writeAll(all);
    return { activity, participant, already: false };
  });
}

export async function findPublicByInvite(code: string): Promise<Activity | null> {
  const inviteCode = clean(code, 16).toUpperCase();
  if (!inviteCode) return null;
  const all = await readAll();
  return all.find((item) => item.inviteCode.toUpperCase() === inviteCode) || null;
}

export async function findPublicByToken(token: string): Promise<{ activity: Activity; participant: ActivityParticipant } | null> {
  const confirmToken = clean(token, 80);
  if (!confirmToken) return null;
  const all = await readAll();
  for (const activity of all) {
    const participant = activity.participants.find((person) => person.confirmToken === confirmToken);
    if (participant) return { activity, participant };
  }
  return null;
}

export async function updateActivityMeta(
  id: string,
  patch: {
    title?: string;
    projectLabel?: string;
    place?: string;
    startsAt?: string;
    notes?: string;
    photoLinks?: unknown;
  },
  actor: string
): Promise<Activity> {
  return mutate(id, (activity) => {
    if (patch.title != null) {
      const title = clean(patch.title, 160);
      if (title.length < 2) throw new ActividadError(400, 'Escribe el título de la actividad');
      activity.title = title;
    }
    if (patch.projectLabel != null) activity.projectLabel = clean(patch.projectLabel, 120);
    if (patch.place != null) activity.place = clean(patch.place, 160);
    if (patch.startsAt != null) activity.startsAt = parseStarts(patch.startsAt);
    if (patch.notes != null) activity.notes = clean(patch.notes, 4000);
    if (patch.photoLinks != null) activity.photoLinks = parsePhotoLinks(patch.photoLinks);
    audit(activity, actor, 'Ficha actualizada');
  });
}

export async function setSessionGeo(id: string, geo: GeoFix | null, deviceId: string, actor: string): Promise<Activity> {
  if (!geo) throw new ActividadError(400, 'No llegó la ubicación de este celular');
  return mutate(id, (activity) => {
    assertOpen(activity);
    activity.sessionGeo = geo;
    const device = cleanDeviceId(deviceId);
    if (device) activity.sessionDeviceId = device;
    for (const person of activity.participants) {
      if (person.state !== 'presente') continue;
      person.geoStatus = classifyGeo(activity.sessionGeo, person.confirmGeo || null);
    }
    audit(activity, actor, 'Ubicación de la sesión actualizada');
  });
}

export async function markParticipant(
  id: string,
  participantId: string,
  action: 'ausente' | 'restaurar' | 'anular',
  actor: string,
  reason?: string
): Promise<Activity> {
  return mutate(id, (activity) => {
    assertOpen(activity);
    const person = activity.participants.find((item) => item.id === participantId);
    if (!person) throw new ActividadError(404, 'Persona no encontrada');

    if (action === 'ausente') {
      if (person.state === 'presente') {
        throw new ActividadError(400, 'La presencia confirmada se anula con un motivo, no se marca ausente.');
      }
      person.state = 'ausente';
      audit(activity, actor, 'Marcada como ausente', person.name);
      return;
    }

    if (action === 'restaurar') {
      if (person.state === 'presente') {
        throw new ActividadError(400, 'Anula la presencia con un motivo.');
      }
      person.state = person.source === 'impulsa' ? 'invitado' : 'inscrito';
      audit(activity, actor, 'Volvió a la lista', person.name);
      return;
    }

    const motive = clean(reason, 300);
    if (motive.length < 3) throw new ActividadError(400, 'Escribe el motivo de la anulación');
    if (person.state !== 'presente') throw new ActividadError(400, 'Esta persona no tiene presencia confirmada');
    person.state = person.source === 'impulsa' ? 'invitado' : 'inscrito';
    person.confirmedAt = undefined;
    person.confirmGeo = null;
    person.confirmDeviceId = undefined;
    person.geoStatus = undefined;
    person.sameDevice = false;
    audit(activity, actor, 'Presencia anulada', `${person.name}: ${motive}`);
  });
}

export async function setActivityStatus(id: string, status: ActivityStatus, actor: ActivityActor): Promise<Activity> {
  return mutate(id, (activity) => {
    if (status === 'cerrada') {
      activity.status = 'cerrada';
      activity.closedAt = now();
      activity.closedBy = actor;
      audit(activity, `${actor.name} (${actor.email})`, 'Actividad cerrada');
      return;
    }
    activity.status = 'abierta';
    activity.closedAt = undefined;
    activity.closedBy = undefined;
    audit(activity, `${actor.name} (${actor.email})`, 'Actividad reabierta');
  });
}

export async function deleteActivity(id: string): Promise<void> {
  await withLock(async () => {
    const all = await readAll();
    const activity = all.find((item) => item.id === id);
    if (!activity) throw new ActividadError(404, 'Actividad no encontrada');
    if (activity.status === 'cerrada') throw new ActividadError(409, 'Reabre la actividad antes de borrarla');
    if (activity.participants.some((person) => person.state === 'presente')) {
      throw new ActividadError(409, 'Hay presencias confirmadas. Anúlalas antes de borrar.');
    }
    await writeAll(all.filter((item) => item.id !== id));
  });
}

function csvCell(value: string | number | undefined | null) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const GEO_LABEL: Record<GeoStatus, string> = {
  ok: 'ok',
  sin_gps: 'sin_gps',
  lejos: 'lejos',
};

export function activitiesToCsv(activities: Activity[]) {
  const header = [
    'id_actividad',
    'tipo',
    'titulo',
    'proyecto',
    'lugar',
    'inicio',
    'estado_actividad',
    'abierta_por',
    'nombre',
    'organizacion',
    'telefono',
    'correo',
    'origen',
    'estado_persona',
    'confirmado_en',
    'lat',
    'lng',
    'precision_m',
    'gps',
    'mismo_celular',
    'notas',
    'fotos',
  ];
  const lines = [header.join(',')];
  for (const activity of activities) {
    const base = [
      activity.id,
      activity.kind,
      activity.title,
      activity.projectLabel,
      activity.place,
      activity.startsAt,
      activity.status,
      activity.openedBy?.name || '',
    ];
    const rows = activity.participants.length ? activity.participants : [null];
    for (const person of rows) {
      const cells = [
        ...base,
        person?.name || '',
        person?.organization || '',
        person?.phone || '',
        person?.email || '',
        person?.source || '',
        person?.state || '',
        person?.confirmedAt || '',
        person?.confirmGeo?.lat ?? '',
        person?.confirmGeo?.lng ?? '',
        person?.confirmGeo?.accuracy ?? '',
        person?.geoStatus ? GEO_LABEL[person.geoStatus] : '',
        person?.sameDevice ? 'si' : '',
        activity.notes,
        activity.photoLinks.join(' '),
      ];
      lines.push(cells.map((cell) => csvCell(cell)).join(','));
    }
  }
  return `\uFEFF${lines.join('\n')}`;
}
