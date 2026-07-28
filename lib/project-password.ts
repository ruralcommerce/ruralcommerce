import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hashBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (hashBuffer.length !== storedBuffer.length) return false;
  return timingSafeEqual(hashBuffer, storedBuffer);
}

export function createPasswordResetToken() {
  return randomBytes(32).toString('hex');
}

export function passwordResetExpiresAt(hours = 2) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function isPasswordResetValid(stored: unknown, token: string) {
  if (!stored || typeof stored !== 'object') return false;
  const entry = stored as Record<string, unknown>;
  if (typeof entry.token !== 'string' || typeof entry.expiresAt !== 'string') return false;
  if (entry.token !== token) return false;
  if (Date.parse(entry.expiresAt) < Date.now()) return false;
  return true;
}
