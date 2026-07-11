/**
 * WhatsApp Cloud API — outbound Utility templates only (no inbox / no Marketing).
 *
 * Required env:
 *   WHATSAPP_CLOUD_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 * Optional:
 *   WHATSAPP_UTILITY_TEMPLATE_NAME  (default: projeto_atualizacao)
 *   WHATSAPP_UTILITY_TEMPLATE_LANG  (default: es)
 *
 * Create the Utility template in Meta Business Manager before use.
 * Suggested body (Spanish):
 *   Hola {{1}}, actualización del proyecto Impulso MiPyMEs: {{2}}. Detalles: {{3}}
 */

import { normalizePhone } from '@/lib/project-phone';

const GRAPH = 'https://graph.facebook.com/v21.0';

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_CLOUD_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

function templateName() {
  return (process.env.WHATSAPP_UTILITY_TEMPLATE_NAME?.trim() || 'projeto_atualizacao');
}

function templateLang(locale?: string) {
  if (locale === 'pt-BR') return 'pt_BR';
  if (locale === 'en') return 'en';
  return process.env.WHATSAPP_UTILITY_TEMPLATE_LANG?.trim() || 'es';
}

/** Trim for WhatsApp template variable limits (~1024 chars total, keep short). */
function clip(value: string, max: number) {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export type UtilityWhatsAppPayload = {
  toPhone: string;
  recipientName: string;
  summary: string;
  link: string;
  locale?: string;
};

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendUtilityWhatsApp(payload: UtilityWhatsAppPayload): Promise<SendResult> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!token || !phoneNumberId) {
    console.warn('[project-whatsapp] WhatsApp Cloud API not configured — skipped');
    return { ok: false, skipped: true };
  }

  const to = normalizePhone(payload.toPhone);
  if (!to) {
    console.warn('[project-whatsapp] Invalid phone — skipped:', payload.toPhone);
    return { ok: false, skipped: true, error: 'invalid-phone' };
  }

  const name = clip(payload.recipientName || 'Participante', 60);
  const summary = clip(payload.summary, 200);
  const link = clip(payload.link, 200);

  const body = {
    messaging_product: 'whatsapp',
    to: to.replace('+', ''),
    type: 'template',
    template: {
      name: templateName(),
      language: { code: templateLang(payload.locale) },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: name },
            { type: 'text', text: summary },
            { type: 'text', text: link },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[project-whatsapp] API error:', response.status, text);
      return { ok: false, error: `whatsapp-${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error('[project-whatsapp] Request failed:', error);
    return { ok: false, error: 'request-failed' };
  }
}
