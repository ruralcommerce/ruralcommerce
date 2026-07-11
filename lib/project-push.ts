import webpush from 'web-push';
import { listPushSubscriptionsForEmails } from '@/lib/project-push-store';

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim()
  );
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY?.trim() || '';
}

function configureWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!.trim(),
    process.env.VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
}

export type PushMessage = {
  title: string;
  body: string;
  url?: string;
};

export async function sendPushToEmails(emails: string[], message: PushMessage) {
  if (!isPushConfigured()) {
    return { sent: 0, skipped: emails.length, failed: 0 };
  }

  configureWebPush();
  const subs = await listPushSubscriptionsForEmails(emails);
  let sent = 0;
  let failed = 0;
  const skipped = emails.length - subs.length;

  const payload = JSON.stringify({
    title: message.title,
    body: message.body,
    url: message.url || '/',
  });

  for (const record of subs) {
    try {
      await webpush.sendNotification(record.subscription, payload);
      sent += 1;
    } catch (error) {
      console.error('[project-push] send failed for', record.email, error);
      failed += 1;
    }
  }

  return { sent, skipped, failed };
}
