import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export const INVESTMENT_CATEGORIES = [
  'tool',
  'premises',
  'digital',
  'supplies',
  'training',
  'other',
] as const;

export type InvestmentCategory = (typeof INVESTMENT_CATEGORIES)[number];

export type InvestmentStatus =
  | 'draft'
  | 'submitted'
  | 'accepted_18a'
  | 'rejected'
  | 'not_attributable';

export type InvestmentAmountKind = 'exact' | 'approximate' | 'unknown';
export type InvestmentCurrency = 'CRC' | 'USD';
export type InvestmentAttributable = 'yes' | 'partial' | 'no';
export type InvestmentFileKind = 'receipt' | 'object';

export type InvestmentFile = {
  id: string;
  kind: InvestmentFileKind;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
};

export type InvestmentSignature = {
  signed: boolean;
  signedAt: string;
  fullName: string;
  documentId: string;
  verificationCode: string;
  paidByMe: boolean;
  documentsReal: boolean;
  projectRelated: boolean;
  authorizeUse: boolean;
  locale: string;
  ip: string;
};

export type InvestmentReview = {
  reviewedAt: string;
  reviewerId: string;
  reviewerName: string;
  countsFor18a: boolean;
  amountUsdFinal?: number;
  notes?: string;
};

export type InvestmentRecord = {
  id: string;
  participantId: string;
  status: InvestmentStatus;
  category?: InvestmentCategory;
  what?: string;
  why?: string;
  description?: string;
  attributable?: InvestmentAttributable;
  amountKind?: InvestmentAmountKind;
  currency?: InvestmentCurrency;
  amountOriginal?: number;
  amountUsdEstimated?: number;
  exchangeRateUsed?: number;
  spentAt?: string;
  files: InvestmentFile[];
  signature?: InvestmentSignature;
  review?: InvestmentReview;
  locale?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-investments.json');

export const ALLOWED_INVESTMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_INVESTMENT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_RECEIPT_FILES = 8;

export function getCrcPerUsd() {
  const raw = Number(process.env.PROJETO_CRC_PER_USD || 515);
  return Number.isFinite(raw) && raw > 0 ? raw : 515;
}

export function estimateUsd(amount: number | undefined, currency: InvestmentCurrency | undefined, rate = getCrcPerUsd()) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) return undefined;
  if (currency === 'USD') return Math.round(amount * 100) / 100;
  return Math.round((amount / rate) * 100) / 100;
}

export function indicatorUsd(record: InvestmentRecord) {
  if (record.status !== 'accepted_18a') return 0;
  if (typeof record.review?.amountUsdFinal === 'number') return record.review.amountUsdFinal;
  return record.amountUsdEstimated || 0;
}

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

export function isInvestmentCategory(value: unknown): value is InvestmentCategory {
  return typeof value === 'string' && (INVESTMENT_CATEGORIES as readonly string[]).includes(value);
}

export function receiptCount(record: InvestmentRecord) {
  return record.files.filter((file) => file.kind === 'receipt').length;
}

export function hasInvestmentReceipt(record: InvestmentRecord) {
  return receiptCount(record) >= 1;
}

export function hasInvestmentSignature(record: InvestmentRecord) {
  return record.signature?.signed === true;
}

export function isPendingDocumentation(record: InvestmentRecord) {
  if (record.status === 'accepted_18a' || record.status === 'rejected' || record.status === 'not_attributable') {
    return false;
  }
  return !hasInvestmentReceipt(record) || !hasInvestmentSignature(record);
}

export function canAcceptInvestmentFor18a(record: InvestmentRecord) {
  return (
    hasInvestmentReceipt(record) &&
    hasInvestmentSignature(record) &&
    record.attributable !== 'no' &&
    record.status === 'submitted'
  );
}

export const INVESTMENT_STAGE_IDS = ['story', 'amount', 'receipt', 'signature', 'review'] as const;
export type InvestmentStageId = (typeof INVESTMENT_STAGE_IDS)[number];

export type InvestmentStageState = {
  id: InvestmentStageId;
  done: boolean;
  current: boolean;
};

export function getInvestmentStageStates(record: InvestmentRecord): InvestmentStageState[] {
  const storyDone = Boolean(record.category && (record.what || '').trim() && record.attributable);
  const amountDone = Boolean(record.amountKind);
  const receiptDone = hasInvestmentReceipt(record);
  const signatureDone = hasInvestmentSignature(record);
  const closed =
    record.status === 'accepted_18a' || record.status === 'rejected' || record.status === 'not_attributable';
  const reviewDone = closed;
  const flags = [storyDone, amountDone, receiptDone, signatureDone, reviewDone];
  const firstOpen = flags.findIndex((done) => !done);
  return INVESTMENT_STAGE_IDS.map((id, index) => ({
    id,
    done: flags[index],
    current: firstOpen === -1 ? index === flags.length - 1 : index === firstOpen,
  }));
}

export function pendingInvestmentItems(record: InvestmentRecord) {
  return getInvestmentStageStates(record)
    .filter((item) => !item.done)
    .map((item) => item.id);
}

export function canSubmitInvestment(record: InvestmentRecord) {
  return Boolean(
    record.category &&
      (record.what || '').trim() &&
      record.attributable &&
      record.amountKind &&
      hasInvestmentReceipt(record)
  );
}

export function monthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function inMonth(iso: string | undefined, key: string) {
  if (!iso) return false;
  return iso.slice(0, 7) === key;
}

export function sanitizeFileName(name: string) {
  const base = name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '-').slice(0, 80);
  return base || 'comprobante';
}

export function isAllowedInvestmentFile(contentType: string, size: number) {
  if (size <= 0 || size > MAX_INVESTMENT_FILE_BYTES) return false;
  if (ALLOWED_INVESTMENT_TYPES.includes(contentType)) return true;
  return contentType === 'image/jpg';
}
