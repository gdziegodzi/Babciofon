/**
 * Typy domenowe Babciofon - zgodne z diagramem klas UML i schematem ERD
 */

export interface Contact {
  id: string;
  name: string;
  phone: string;
  isFavourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlarmTemplate {
  id: string;
  label: string;
  body: string;
  includeLocation: boolean;
  recipients: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface AlarmTemplateRecipient {
  templateId: string;
  contactId: string;
  position: number;
}

export interface Settings {
  id: number;
  highContrast: boolean;
  fontScale: number;
  defaultTemplateId: string | null;
  updatedAt: string;
}

/** DTO do tworzenia/edycji kontaktu (bez pól generowanych przez bazę) */
export type ContactInput = Pick<Contact, 'name' | 'phone' | 'isFavourite'>;

/** DTO do tworzenia/edycji szablonu alarmowego */
export type AlarmTemplateInput = {
  label: string;
  body: string;
  includeLocation: boolean;
  recipientIds: string[];
};
