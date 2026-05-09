/**
 * Normalizacja i walidacja numerów telefonu.
 *
 * Zasady:
 * - usuwamy spacje, myślniki, nawiasy
 * - akceptujemy prefiks + (np. +48)
 * - akceptujemy 9-15 cyfr (zgodnie z E.164 maks. 15)
 * - wyświetlamy w formacie czytelnym dla seniora: +48 123 456 789
 */

const PL_COUNTRY_CODE = '+48';

/** Zostawia tylko cyfry i opcjonalny + na początku. */
export function normalizePhone(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Sprawdza czy znormalizowany numer jest poprawny.
 * Akceptuje:
 *  - 9 cyfr (krajowy bez prefiksu)
 *  - +48 + 9 cyfr (krajowy z prefiksem)
 *  - +CC + 7..14 cyfr (zagraniczny)
 */
export function isValidPhone(normalized: string): boolean {
  if (!normalized) return false;
  if (normalized.startsWith('+')) {
    const rest = normalized.slice(1);
    return /^\d{8,15}$/.test(rest);
  }
  return /^\d{9,15}$/.test(normalized);
}

/**
 * Format do wyświetlania: dodaje spacje co 3 cyfry.
 * Przykład: "+48123456789" → "+48 123 456 789"
 */
export function formatPhoneForDisplay(input: string): string {
  const normalized = normalizePhone(input);
  if (!normalized) return '';

  if (normalized.startsWith('+')) {
    const cc = normalized.slice(0, 3); // "+48"
    const rest = normalized.slice(3);
    return `${cc} ${rest.replace(/(\d{3})(?=\d)/g, '$1 ')}`;
  }
  // krajowy bez prefiksu - rozdziel co 3
  return normalized.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/** Forma kanoniczna do zapisu w DB (dodaje +48 dla 9-cyfrowych krajowych). */
export function toCanonicalPhone(input: string): string {
  const normalized = normalizePhone(input);
  if (!normalized) return '';
  if (!normalized.startsWith('+') && /^\d{9}$/.test(normalized)) {
    return `${PL_COUNTRY_CODE}${normalized}`;
  }
  return normalized;
}
