import { getProjectR2DownloadUrl, isProjectR2Configured, putProjectR2Object, r2ObjectKey } from '@/lib/project-r2';

export const SEMENTES_MAX_VIDEO_BYTES = 22 * 1024 * 1024;

function prefix() {
  const raw = (process.env.SEMENTES_R2_PREFIX || 'sementes').trim().replace(/^\/+|\/+$/g, '');
  return `${raw}/`;
}

export function isSementesR2Ready() {
  return isProjectR2Configured();
}

export function sementesVideoKey(publicId: string, ext: string) {
  const safeExt = ext.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'webm';
  const relative = `${prefix()}videos/${publicId}-${Date.now()}.${safeExt}`;
  return r2ObjectKey(relative);
}

export async function putSementesVideo(key: string, body: Buffer, contentType: string) {
  return putProjectR2Object({ key, body, contentType });
}

export async function getSementesVideoUrl(key: string, expiresIn = 60 * 30) {
  return getProjectR2DownloadUrl(key, expiresIn);
}

export function videoExtension(contentType: string, fileName = '') {
  const lower = `${contentType} ${fileName}`.toLowerCase();
  if (lower.includes('mp4')) return 'mp4';
  if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
  return 'webm';
}
