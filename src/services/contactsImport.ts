import * as Contacts from 'expo-contacts';
import type { ContactInput } from '@/types/domain';
import { toCanonicalPhone, isValidPhone } from '@/utils/phone';

export interface DeviceContact {
  id: string;
  name: string;
  phone: string;
}

export class ContactsPermissionError extends Error {
  constructor() {
    super('Brak uprawnień do kontaktów.');
    this.name = 'ContactsPermissionError';
  }
}

/**
 * Prosi o uprawnienia do kontaktów. Zwraca true jeśli przyznane.
 */
export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Pobiera kontakty z książki telefonicznej i zamienia je na płaską listę
 * (jeden kontakt z wieloma numerami → wiele wpisów).
 */
export async function loadDeviceContacts(): Promise<DeviceContact[]> {
  const granted = await requestContactsPermission();
  if (!granted) {
    throw new ContactsPermissionError();
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    sort: Contacts.SortTypes.FirstName,
  });

  const result: DeviceContact[] = [];

  for (const contact of data) {
    const name = contact.name?.trim();
    if (!name) continue;

    const phones = contact.phoneNumbers ?? [];
    for (const p of phones) {
      const raw = p.number ?? '';
      const canonical = toCanonicalPhone(raw);
      if (!isValidPhone(canonical)) continue;

      // Etykieta numeru np. "Komórka", "Dom" - dołączymy do nazwy gdy >1 numer
      const label = p.label ? ` (${p.label})` : '';
      const displayName = phones.length > 1 ? `${name}${label}` : name;

      result.push({
        id: `${contact.id}_${canonical}`,
        name: displayName,
        phone: canonical,
      });
    }
  }

  // Deduplikacja po numerze
  const seen = new Set<string>();
  return result.filter((c) => {
    if (seen.has(c.phone)) return false;
    seen.add(c.phone);
    return true;
  });
}

/** Konwertuje wybrane DeviceContact na ContactInput do zapisu. */
export function deviceContactsToInputs(
  selected: DeviceContact[]
): ContactInput[] {
  return selected.map((c) => ({
    name: c.name,
    phone: c.phone,
    isFavourite: false,
  }));
}
