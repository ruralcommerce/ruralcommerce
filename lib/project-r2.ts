import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const DEFAULT_R2_FOLDER_PREFIX = 'Inversión Beneficiários/';

export type ProjectR2Config = {
  accountId: string;
  bucket: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  folderPrefix: string;
};

function trimEnv(key: string) {
  return (process.env[key] || '').trim();
}

export function normalizeR2Prefix(value: string) {
  const trimmed = value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `${trimmed}/` : '';
}

export function getProjectR2Config(): ProjectR2Config | null {
  const accountId = trimEnv('R2_ACCOUNT_ID');
  const bucket = trimEnv('R2_BUCKET');
  const accessKeyId = trimEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = trimEnv('R2_SECRET_ACCESS_KEY');
  const endpoint =
    trimEnv('R2_ENDPOINT') ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  const folderPrefix = normalizeR2Prefix(trimEnv('R2_FOLDER_PREFIX') || DEFAULT_R2_FOLDER_PREFIX);

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !endpoint) {
    return null;
  }

  return { accountId, bucket, endpoint, accessKeyId, secretAccessKey, folderPrefix };
}

export function isProjectR2Configured() {
  return Boolean(getProjectR2Config());
}

export function createProjectR2Client(config = getProjectR2Config()) {
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado (faltan R2_ACCOUNT_ID / bucket / keys).');
  }
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function r2ObjectKey(fileName: string, config = getProjectR2Config()) {
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const safeName = fileName.replace(/^\/+/, '').replace(/\.\.\//g, '');
  return `${config.folderPrefix}${safeName}`;
}

export async function assertProjectR2Bucket(client?: S3Client, config = getProjectR2Config()) {
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const s3 = client || createProjectR2Client(config);
  await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));
}

export async function putProjectR2Object(input: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}) {
  const config = getProjectR2Config();
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const s3 = createProjectR2Client(config);
  const key = input.key.startsWith(config.folderPrefix) ? input.key : r2ObjectKey(input.key, config);
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType || 'application/octet-stream',
    })
  );
  return { bucket: config.bucket, key };
}

export async function listProjectR2Objects(maxKeys = 20) {
  const config = getProjectR2Config();
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const s3 = createProjectR2Client(config);
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: config.folderPrefix,
      MaxKeys: maxKeys,
    })
  );
  return result.Contents || [];
}

export async function getProjectR2DownloadUrl(key: string, expiresIn = 3600) {
  const config = getProjectR2Config();
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const s3 = createProjectR2Client(config);
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn }
  );
}

export async function deleteProjectR2Object(key: string) {
  const config = getProjectR2Config();
  if (!config) {
    throw new Error('Cloudflare R2 no está configurado.');
  }
  const s3 = createProjectR2Client(config);
  await s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
