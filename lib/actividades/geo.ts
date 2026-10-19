import type { GeoFix, GeoStatus } from './types';

const NEAR_METERS = 800;

export function parseGeo(input: unknown): GeoFix | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const lat = typeof raw.lat === 'number' ? raw.lat : Number(raw.lat);
  const lng = typeof raw.lng === 'number' ? raw.lng : Number(raw.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  let accuracy: number | null = null;
  if (raw.accuracy != null && raw.accuracy !== '') {
    const value = Number(raw.accuracy);
    if (Number.isFinite(value) && value >= 0 && value < 100000) accuracy = value;
  }

  return {
    lat,
    lng,
    accuracy,
    capturedAt: new Date().toISOString(),
  };
}

export function cleanDeviceId(input: unknown): string {
  if (typeof input !== 'string') return '';
  const id = input.trim().slice(0, 80);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) return '';
  return id;
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const earth = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function classifyGeo(session: GeoFix | null | undefined, point: GeoFix | null): GeoStatus {
  if (!point) return 'sin_gps';
  if (!session) return 'ok';
  const distance = distanceMeters(session, point);
  const accuracy = Math.max(session.accuracy || 0, point.accuracy || 0);
  const limit = Math.max(NEAR_METERS, accuracy * 3);
  return distance <= limit ? 'ok' : 'lejos';
}
