import * as SMS from 'expo-sms';
import type { AlarmTemplate, Contact } from '@/types/domain';
import {
  getCurrentLocation,
  formatLocationAsLink,
  LocationPermissionError,
  type LocationResult,
} from './location';

export interface SmsAvailabilityCheck {
  available: boolean;
  reason?: string;
}

export interface AlarmPreparationResult {
  body: string;
  recipients: Contact[];
  location: LocationResult | null;
  warnings: string[];
}

export interface AlarmSendResult {
  /** 'sent' / 'cancelled' / 'unknown' - wynik z natywnego komponentu SMS */
  status: 'sent' | 'cancelled' | 'unknown';
}

/**
 * Sprawdza, czy urządzenie wspiera wysyłkę SMS przez expo-sms.
 */
export async function checkSmsAvailable(): Promise<SmsAvailabilityCheck> {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    return {
      available: false,
      reason: 'To urządzenie nie obsługuje wysyłania SMS.',
    };
  }
  return { available: true };
}

/**
 * Buduje treść wiadomości - jeśli szablon ma `includeLocation`, próbuje pobrać lokalizację.
 * Zwraca warnings jeśli nie udało się np. pobrać GPS.
 */
export async function prepareAlarm(
  template: AlarmTemplate
): Promise<AlarmPreparationResult> {
  const warnings: string[] = [];
  let location: LocationResult | null = null;
  let body = template.body;

  if (template.includeLocation) {
    try {
      location = await getCurrentLocation();
      const link = formatLocationAsLink(location);
      body = `${template.body}\nMoja lokalizacja: ${link}`;
      if (location.isStale) {
        warnings.push(
          'Lokalizacja jest przybliżona (ostatnia znana, nie aktualna).'
        );
      }
    } catch (e) {
      if (e instanceof LocationPermissionError) {
        warnings.push(
          'Brak uprawnień do lokalizacji - SMS zostanie wysłany bez niej.'
        );
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        warnings.push(`Nie udało się pobrać lokalizacji: ${msg}`);
      }
    }
  }

  if (template.recipients.length === 0) {
    warnings.push(
      'Szablon nie ma przypisanych odbiorców. Dodaj odbiorców w zarządzaniu szablonami.'
    );
  }

  return {
    body,
    recipients: template.recipients,
    location,
    warnings,
  };
}

/**
 * Wysyła SMS do odbiorców.
 * Używa expo-sms (otwiera natywny komponent SMS z uzupełnioną treścią) -
 * to bezpieczniejszy wariant zgodny z dokumentacją UC-03 (alternatywny scenariusz
 * "wysyłka z otwarciem aplikacji SMS z uzupełnioną treścią").
 */
export async function sendAlarmSms(
  prep: AlarmPreparationResult
): Promise<AlarmSendResult> {
  const availability = await checkSmsAvailable();
  if (!availability.available) {
    throw new Error(availability.reason ?? 'SMS niedostępny');
  }
  if (prep.recipients.length === 0) {
    throw new Error('Brak odbiorców - dodaj co najmniej jeden kontakt do szablonu.');
  }

  const phones = prep.recipients.map((r) => r.phone);
  const { result } = await SMS.sendSMSAsync(phones, prep.body);

  return { status: result };
}
