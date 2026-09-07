import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import type { InvestmentRecord } from '@/lib/project-investments';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-investments.json');

export async function readInvestments(): Promise<InvestmentRecord[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as InvestmentRecord[]) : [];
  } catch {
    return [];
  }
}

export async function writeInvestments(records: InvestmentRecord[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export function createInvestmentId() {
  return `inv_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

export function createInvestmentFileId() {
  return `file_${Date.now()}_${randomBytes(3).toString('hex')}`;
}

export function createInvestmentDocumentIds() {
  return {
    documentId: `IMLS-INV-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`,
    verificationCode: randomBytes(4).toString('hex').toUpperCase(),
  };
}
