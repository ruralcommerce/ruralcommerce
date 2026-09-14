import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import type { LoteFile, LoteRecord } from '@/lib/lote-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sementes-lotes.json');

let writeChain = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readFileData(): Promise<LoteFile> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text) as LoteFile;
    if (!parsed || !Array.isArray(parsed.lotes)) return { lotes: [] };
    return parsed;
  } catch {
    return { lotes: [] };
  }
}

async function writeFileData(data: LoteFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function createLoteIds() {
  return {
    id: `lote_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`,
    publicId: randomBytes(4).toString('hex'),
  };
}

export async function findLoteByTokenHash(tokenHash: string) {
  const data = await readFileData();
  return data.lotes.find((item) => item.tokenHash === tokenHash) || null;
}

export async function saveLote(lote: LoteRecord) {
  return withLock(async () => {
    const data = await readFileData();
    const index = data.lotes.findIndex((item) => item.id === lote.id);
    const next = { ...lote, updatedAt: new Date().toISOString() };
    if (index === -1) data.lotes.push(next);
    else data.lotes[index] = next;
    await writeFileData(data);
    return next;
  });
}
