import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { SementeOwnerView, SementePublicCard, SementeRecord, SementeTeamView } from '@/lib/sementes-types';
import { sementeHook } from '@/lib/sementes-score';
import { scoreSemente } from '@/lib/sementes-score';

function secret() {
  return (
    process.env.SEMENTES_SESSION_SECRET?.trim() ||
    process.env.SEMENTES_TEAM_PASSWORD?.trim() ||
    'sementes-dev-secret'
  );
}

export function hashToken(token: string) {
  return createHash('sha256').update(`${secret()}:${token}`).digest('hex');
}

export function newParticipantToken() {
  return `sem_${randomBytes(24).toString('hex')}`;
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(pin, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string) {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hash = scryptSync(pin, salt, 32).toString('hex');
  const left = Buffer.from(hash);
  const right = Buffer.from(storedHash);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, '').slice(0, 16);
}

export function isValidPin(value: string) {
  return /^\d{4}$/.test(value);
}

export function hashDeviceId(deviceId: string) {
  return createHmac('sha256', secret()).update(deviceId).digest('hex').slice(0, 32);
}

export function teamPasswordConfigured() {
  if (process.env.SEMENTES_TEAM_PASSWORD?.trim()) return true;
  return process.env.NODE_ENV !== 'production';
}

export function verifyTeamPassword(password: string) {
  const expected = process.env.SEMENTES_TEAM_PASSWORD?.trim() || (process.env.NODE_ENV !== 'production' ? 'sementes' : '');
  if (!expected) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signTeamToken(hours = 16) {
  const body = Buffer.from(JSON.stringify({ role: 'sementes-team', exp: Date.now() + hours * 3600 * 1000 })).toString(
    'base64url'
  );
  const signature = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyTeamToken(token: string) {
  const [body, signature] = token.split('.');
  if (!body || !signature) return false;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { exp?: number };
    return Boolean(payload.exp && Date.now() < payload.exp);
  } catch {
    return false;
  }
}

export function readBearer(request: Request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function toPublicCard(seed: SementeRecord): SementePublicCard {
  return {
    publicId: seed.publicId,
    alias: seed.alias,
    path: seed.path,
    hook: sementeHook(seed),
    problem: seed.problem.trim(),
    impactNote: seed.impactNote.trim(),
    fuel: seed.fuel.trim(),
    fuelChips: seed.fuelChips || [],
    impacts: seed.impacts,
    heat: seed.heat,
    publishedAt: seed.publishedAt,
    hasVideo: Boolean(seed.videoKey),
  };
}

export function toOwnerView(seed: SementeRecord): SementeOwnerView {
  return {
    ...toPublicCard(seed),
    id: seed.id,
    name: seed.name,
    whatsapp: seed.whatsapp,
    solution: seed.solution,
    impactNote: seed.impactNote,
    fuel: seed.fuel,
    fuelChips: seed.fuelChips,
    status: seed.status,
    step: seed.step,
    updatedAt: seed.updatedAt,
    hasPin: Boolean(seed.pinHash),
  };
}

export function toTeamView(seed: SementeRecord, others: SementeRecord[]): SementeTeamView {
  const scored = scoreSemente(seed, others);
  return {
    ...toOwnerView(seed),
    createdAt: seed.createdAt,
    videoContentType: seed.videoContentType,
    score: scored.total,
    scoreBreakdown: scored.breakdown,
  };
}
