import {
  getProjectR2DownloadUrl,
  getProjectR2UploadUrl,
  headProjectR2Object,
  isProjectR2Configured,
  putProjectR2Object,
  r2ObjectKey,
  ensureProjectR2BrowserCors,
} from '@/lib/project-r2';

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

export function isOwnedSementesVideoKey(key: string, publicId: string) {
  if (!key || key.includes('..')) return false;
  return key.includes(`${prefix()}videos/${publicId}-`);
}

export async function putSementesVideo(key: string, body: Buffer, contentType: string) {
  return putProjectR2Object({ key, body, contentType });
}

export async function getSementesVideoUrl(key: string, expiresIn = 60 * 30) {
  return getProjectR2DownloadUrl(key, expiresIn);
}

export async function getSementesVideoUploadUrl(key: string, contentType: string) {
  await ensureProjectR2BrowserCors();
  return getProjectR2UploadUrl(key, contentType, 600);
}

export async function headSementesVideo(key: string) {
  return headProjectR2Object(key);
}

export function videoExtension(contentType: string, fileName = '') {
  const lower = `${contentType} ${fileName}`.toLowerCase();
  if (lower.includes('mp4') || lower.includes('m4v')) return 'mp4';
  if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
  return 'webm';
}

export function normalizeSementesVideoType(contentType: string, fileName = '') {
  const type = (contentType || '').toLowerCase();
  if (type.startsWith('video/')) return type;
  const name = fileName.toLowerCase();
  if (name.endsWith('.mp4') || name.endsWith('.m4v')) return 'video/mp4';
  if (name.endsWith('.mov')) return 'video/quicktime';
  if (name.endsWith('.webm')) return 'video/webm';
  return '';
}

