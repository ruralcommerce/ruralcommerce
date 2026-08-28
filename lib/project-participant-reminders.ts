import { readFile } from 'fs/promises';
import path from 'path';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import {
  buildConvenioReminderEmailContent,
  buildDiagnosisReminderEmailContent,
  convenioUrl,
  diagnosticoUrl,
} from '@/lib/project-email-messages';
import { PROJECT_NAME } from '@/lib/project-brand';
import { sendDirectProjectMessage, type BroadcastRecipient, type ChannelStats } from '@/lib/project-broadcast';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

export type ParticipantReminderType = 'convenio' | 'diagnosis';

export type ParticipantReminderResult = {
  requested: number;
  eligible: number;
  email: ChannelStats;
  skipped: Array<{ id: string; reason: string }>;
};

function recordToRecipient(record: Record<string, unknown>): BroadcastRecipient | null {
  const profile = (record.profile as Record<string, unknown>) || {};
  const user = (record.user as Record<string, unknown>) || {};
  const email = typeof user.email === 'string' ? user.email : '';
  if (!email) return null;

  return {
    id: typeof record.id === 'string' ? record.id : email,
    email,
    phone: typeof profile.phone === 'string' ? profile.phone : undefined,
    name: typeof profile.name === 'string' ? profile.name : '',
    locale: typeof profile.locale === 'string' ? profile.locale : 'es',
  };
}

export function isEligibleForConvenioReminder(record: Record<string, unknown>) {
  if (record.status !== 'approved') return false;
  const profile = (record.profile as Record<string, unknown>) || {};
  const agreement = (profile.agreement as Record<string, unknown>) || {};
  return agreement.signed !== true;
}

export function isEligibleForDiagnosisReminder(record: Record<string, unknown>) {
  if (record.status !== 'approved') return false;
  const profile = (record.profile as Record<string, unknown>) || {};
  const agreement = (profile.agreement as Record<string, unknown>) || {};
  const diagnosis = (profile.diagnosis as Record<string, unknown>) || {};
  if (agreement.signed !== true) return false;
  return !diagnosis.answers;
}

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const pushCopy = {
  convenio: 'Rural Commerce · Impulso MiPyMEs: firma tu convenio en línea para continuar con el diagnóstico.',
  diagnosis: 'Rural Commerce · Impulso MiPyMEs: completa tu diagnóstico para continuar en el programa.',
} as const;

export async function sendParticipantReminders(
  type: ParticipantReminderType,
  ids: string[],
  actor?: { memberId: string; name: string }
): Promise<ParticipantReminderResult> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const result: ParticipantReminderResult = {
    requested: uniqueIds.length,
    eligible: 0,
    email: { sent: 0, skipped: 0, failed: 0 },
    skipped: [],
  };

  const isEligible = type === 'convenio' ? isEligibleForConvenioReminder : isEligibleForDiagnosisReminder;

  for (const id of uniqueIds) {
    const record = records.find((item) => item.id === id);
    if (!record) {
      result.skipped.push({ id, reason: 'not_found' });
      continue;
    }
    if (!isEligible(record)) {
      result.skipped.push({ id, reason: 'not_eligible' });
      continue;
    }

    const recipient = recordToRecipient(record);
    if (!recipient) {
      result.skipped.push({ id, reason: 'no_email' });
      continue;
    }

    result.eligible += 1;
    const displayName = recipient.name || recipient.email;
    const content =
      type === 'convenio'
        ? buildConvenioReminderEmailContent(displayName)
        : buildDiagnosisReminderEmailContent(displayName);

    const dispatch = await sendDirectProjectMessage(
      recipient,
      {
        subject: content.subject,
        body: buildProjectEmailText(content),
        html: buildProjectEmailHtml(content),
        pushTitle: content.subject,
        pushBody: pushCopy[type],
        link: type === 'convenio' ? convenioUrl('es') : diagnosticoUrl('es'),
      },
      ['email']
    );

    result.email.sent += dispatch.email.sent;
    result.email.skipped += dispatch.email.skipped;
    result.email.failed += dispatch.email.failed;

    if (actor) {
      await appendAuditEntry({
        action: type === 'convenio' ? 'team_reminder_convenio' : 'team_reminder_diagnosis',
        actorType: 'team',
        actorId: actor.memberId,
        actorName: actor.name,
        targetRecordId: id,
        metadata: { email: recipient.email, type },
      });
    }
  }

  return result;
}

export function formatReminderResultMessage(result: ParticipantReminderResult) {
  if (result.eligible === 0) {
    return 'Ningún participante elegible para este recordatorio.';
  }
  if (result.email.failed > 0) {
    return `Recordatorio enviado a ${result.email.sent} participante(s). ${result.email.failed} falló.`;
  }
  if (result.email.skipped > 0 && result.email.sent === 0) {
    return 'No se pudo enviar el correo (servicio de e-mail no configurado).';
  }
  return `Recordatorio enviado a ${result.email.sent} participante(s).`;
}
