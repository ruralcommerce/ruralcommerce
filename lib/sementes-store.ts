import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { makeSementeAlias } from '@/lib/sementes-alias';
import type {
  SementeDraftPatch,
  SementeImpact,
  SementeLocale,
  SementePath,
  SementeRecord,
  SementesFile,
  SementeStatus,
} from '@/lib/sementes-types';
import { SEMENTES_IMPACTS, SEMENTES_MAX_STEP, SEMENTES_PATHS, SEMENTES_STATUSES } from '@/lib/sementes-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sementes.json');

const emptyFile = (): SementesFile => ({ room: { flipAt: null }, seeds: [] });

let writeChain = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readFileData(): Promise<SementesFile> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text) as SementesFile;
    if (!parsed || !Array.isArray(parsed.seeds)) return emptyFile();
    return {
      room: { flipAt: parsed.room?.flipAt || null },
      seeds: parsed.seeds,
    };
  } catch {
    return emptyFile();
  }
}

async function writeFileData(data: SementesFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function readSementes() {
  return readFileData();
}

export function createSementeIds() {
  return {
    id: `seed_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`,
    publicId: randomBytes(4).toString('hex'),
  };
}

function clampStep(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(SEMENTES_MAX_STEP, Math.round(numeric)));
}

function asPath(value: unknown): SementePath | undefined {
  return typeof value === 'string' && SEMENTES_PATHS.includes(value as SementePath)
    ? (value as SementePath)
    : undefined;
}

function asImpacts(value: unknown): SementeImpact[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SementeImpact =>
    typeof item === 'string' && SEMENTES_IMPACTS.includes(item as SementeImpact)
  );
}

function asChips(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 8);
}

function asStatus(value: unknown): SementeStatus | undefined {
  return typeof value === 'string' && SEMENTES_STATUSES.includes(value as SementeStatus)
    ? (value as SementeStatus)
    : undefined;
}

function asLocale(value: unknown): SementeLocale {
  if (value === 'pt-BR' || value === 'en' || value === 'es') return value;
  return 'es';
}

export function sanitizeDraftPatch(patch: SementeDraftPatch): SementeDraftPatch {
  const next: SementeDraftPatch = {};
  if (typeof patch.name === 'string') next.name = patch.name.trim().slice(0, 80);
  if (patch.locale) next.locale = asLocale(patch.locale);
  if (patch.path !== undefined) next.path = asPath(patch.path);
  if (typeof patch.problem === 'string') next.problem = patch.problem.slice(0, 400);
  if (typeof patch.solution === 'string') next.solution = patch.solution.slice(0, 800);
  if (patch.impacts) next.impacts = asImpacts(patch.impacts);
  if (typeof patch.impactNote === 'string') next.impactNote = patch.impactNote.slice(0, 280);
  if (typeof patch.fuel === 'string') next.fuel = patch.fuel.slice(0, 240);
  if (patch.fuelChips) next.fuelChips = asChips(patch.fuelChips);
  if (patch.step !== undefined) next.step = clampStep(patch.step);
  return next;
}

export async function createSementeRecord(input: {
  name: string;
  whatsapp: string;
  pinHash: string;
  tokenHash: string;
  locale: SementeLocale;
}) {
  return withLock(async () => {
    const data = await readFileData();
    const ids = createSementeIds();
    const used = new Set(data.seeds.map((seed) => seed.alias.toLowerCase()));
    const alias = makeSementeAlias(ids.publicId, used);
    const now = new Date().toISOString();
    const record: SementeRecord = {
      id: ids.id,
      publicId: ids.publicId,
      tokenHash: input.tokenHash,
      pinHash: input.pinHash,
      createdAt: now,
      updatedAt: now,
      locale: input.locale,
      name: input.name.trim().slice(0, 80),
      whatsapp: input.whatsapp,
      alias,
      problem: '',
      solution: '',
      impacts: [],
      impactNote: '',
      fuel: '',
      fuelChips: [],
      heat: 0,
      heatVoters: [],
      status: 'draft',
      step: 1,
    };
    data.seeds.push(record);
    await writeFileData(data);
    return record;
  });
}

export async function updateSementeByTokenHash(tokenHash: string, patch: SementeDraftPatch) {
  return withLock(async () => {
    const data = await readFileData();
    const index = data.seeds.findIndex((seed) => seed.tokenHash === tokenHash);
    if (index === -1) return null;
    const clean = sanitizeDraftPatch(patch);
    data.seeds[index] = {
      ...data.seeds[index],
      ...clean,
      updatedAt: new Date().toISOString(),
    };
    await writeFileData(data);
    return data.seeds[index];
  });
}

export async function mutateSemente(
  predicate: (seed: SementeRecord) => boolean,
  mutate: (seed: SementeRecord, data: SementesFile) => SementeRecord | null
) {
  return withLock(async () => {
    const data = await readFileData();
    const index = data.seeds.findIndex(predicate);
    if (index === -1) return null;
    const next = mutate(data.seeds[index], data);
    if (!next) return null;
    data.seeds[index] = { ...next, updatedAt: new Date().toISOString() };
    await writeFileData(data);
    return data.seeds[index];
  });
}

export async function setSementeFlipAt(iso: string | null) {
  return withLock(async () => {
    const data = await readFileData();
    data.room.flipAt = iso;
    await writeFileData(data);
    return data.room;
  });
}

export async function findSementeByTokenHash(tokenHash: string) {
  const data = await readFileData();
  return data.seeds.find((seed) => seed.tokenHash === tokenHash) || null;
}

export async function findSementeByWhatsapp(whatsapp: string) {
  const data = await readFileData();
  return data.seeds.find((seed) => seed.whatsapp === whatsapp) || null;
}

export async function replaceSementeToken(id: string, tokenHash: string) {
  return withLock(async () => {
    const data = await readFileData();
    const index = data.seeds.findIndex((seed) => seed.id === id);
    if (index === -1) return null;
    data.seeds[index] = { ...data.seeds[index], tokenHash, updatedAt: new Date().toISOString() };
    await writeFileData(data);
    return data.seeds[index];
  });
}

export async function setSementeStatus(publicId: string, status: unknown) {
  const nextStatus = asStatus(status);
  if (!nextStatus) return null;
  return mutateSemente(
    (seed) => seed.publicId === publicId,
    (seed) => ({ ...seed, status: nextStatus })
  );
}
