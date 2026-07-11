const DEFAULT_COUNTRY_CODE = '+506';

/** Best-effort normalization to E.164. Returns null if it can't build a plausible number. */
export function normalizePhone(raw: string | undefined, countryCode?: string): string | null {
  if (!raw) return null;
  const cc = (countryCode || process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || DEFAULT_COUNTRY_CODE).trim();

  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits.length >= 8 ? `+${digits}` : null;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8) return null;

  const ccDigits = cc.replace(/\D/g, '');
  if (digits.startsWith(ccDigits) && digits.length > 8) {
    return `+${digits}`;
  }

  return `${cc}${digits}`;
}
