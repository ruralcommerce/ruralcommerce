#!/usr/bin/env node
/**
 * Prueba de conexión al bucket R2 de Impulso MiPyMEs.
 * Uso: node scripts/test-r2.mjs
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env.local');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = { ...parseEnvFile(envFile), ...process.env };
const accountId = (env.R2_ACCOUNT_ID || '').trim();
const bucket = (env.R2_BUCKET || '').trim();
const accessKeyId = (env.R2_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (env.R2_SECRET_ACCESS_KEY || '').trim();
const endpoint =
  (env.R2_ENDPOINT || '').trim() ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
const folderPrefix = ((env.R2_FOLDER_PREFIX || 'Inversión Beneficiários/').trim().replace(/\/+$/, '') ||
  'Inversión Beneficiários') + '/';

if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !endpoint) {
  console.error('Faltan R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID o R2_SECRET_ACCESS_KEY en .env.local');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

const probeKey = `${folderPrefix}.r2-ok`;

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: probeKey,
      Body: `ok ${new Date().toISOString()}\n`,
      ContentType: 'text/plain; charset=utf-8',
    })
  );
  const listed = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: folderPrefix,
      MaxKeys: 10,
    })
  );
  const keys = (listed.Contents || []).map((item) => item.Key);
  console.log('R2 OK');
  console.log(`  bucket: ${bucket}`);
  console.log(`  carpeta: ${folderPrefix}`);
  console.log(`  prueba: ${probeKey}`);
  console.log(`  objetos: ${keys.length}`);
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('R2 FALLÓ:', message);
  process.exit(1);
}
