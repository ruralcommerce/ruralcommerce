import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-push-subscriptions.json');

export type PushSubscriptionRecord = {
  email: string;
  locale?: string;
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  updatedAt: string;
};

async function readAll(): Promise<PushSubscriptionRecord[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as PushSubscriptionRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(records: PushSubscriptionRecord[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function upsertPushSubscription(record: PushSubscriptionRecord) {
  const email = record.email.toLowerCase();
  const records = await readAll();
  const index = records.findIndex((item) => item.email.toLowerCase() === email);
  const next = { ...record, email };
  if (index === -1) {
    records.push(next);
  } else {
    records[index] = next;
  }
  await writeAll(records);
}

export async function removePushSubscription(email: string) {
  const normalized = email.toLowerCase();
  const records = await readAll();
  const remaining = records.filter((item) => item.email.toLowerCase() !== normalized);
  await writeAll(remaining);
}

export async function getPushSubscription(email: string) {
  const normalized = email.toLowerCase();
  const records = await readAll();
  return records.find((item) => item.email.toLowerCase() === normalized) || null;
}

export async function listPushSubscriptionsForEmails(emails: string[]) {
  const set = new Set(emails.map((e) => e.toLowerCase()));
  const records = await readAll();
  return records.filter((item) => set.has(item.email.toLowerCase()));
}
