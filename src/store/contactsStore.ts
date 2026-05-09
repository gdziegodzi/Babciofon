import { create } from 'zustand';
import { contactsRepository } from '@/repositories/contactsRepository';
import type { Contact, ContactInput } from '@/types/domain';

interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (input: ContactInput) => Promise<Contact>;
  update: (id: string, input: ContactInput) => Promise<Contact>;
  remove: (id: string) => Promise<void>;
  toggleFavourite: (id: string) => Promise<void>;
  importBatch: (inputs: ContactInput[]) => Promise<{ added: number; skipped: number }>;

  getById: (id: string) => Contact | undefined;
  getFavourites: () => Contact[];
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await contactsRepository.getAll();
      set({ contacts, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : String(e),
        isLoading: false,
      });
    }
  },

  add: async (input) => {
    const created = await contactsRepository.create(input);
    await get().load();
    return created;
  },

  update: async (id, input) => {
    const updated = await contactsRepository.update(id, input);
    await get().load();
    return updated;
  },

  remove: async (id) => {
    await contactsRepository.remove(id);
    await get().load();
  },

  toggleFavourite: async (id) => {
    const contact = get().contacts.find((c) => c.id === id);
    if (!contact) return;
    await contactsRepository.setFavourite(id, !contact.isFavourite);
    await get().load();
  },

  importBatch: async (inputs) => {
    const result = await contactsRepository.createBatch(inputs);
    await get().load();
    return result;
  },

  getById: (id) => get().contacts.find((c) => c.id === id),

  getFavourites: () => get().contacts.filter((c) => c.isFavourite),
}));
