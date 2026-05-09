import { create } from 'zustand';
import { templatesRepository } from '@/repositories/templatesRepository';
import type { AlarmTemplate, AlarmTemplateInput } from '@/types/domain';

interface TemplatesState {
  templates: AlarmTemplate[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (input: AlarmTemplateInput) => Promise<AlarmTemplate>;
  update: (id: string, input: AlarmTemplateInput) => Promise<AlarmTemplate>;
  remove: (id: string) => Promise<void>;
  seedDefaultsIfEmpty: () => Promise<void>;

  getById: (id: string) => AlarmTemplate | undefined;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await templatesRepository.getAll();
      set({ templates, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : String(e),
        isLoading: false,
      });
    }
  },

  add: async (input) => {
    const created = await templatesRepository.create(input);
    await get().load();
    return created;
  },

  update: async (id, input) => {
    const updated = await templatesRepository.update(id, input);
    await get().load();
    return updated;
  },

  remove: async (id) => {
    await templatesRepository.remove(id);
    await get().load();
  },

  seedDefaultsIfEmpty: async () => {
    await templatesRepository.seedDefaultsIfEmpty();
    await get().load();
  },

  getById: (id) => get().templates.find((t) => t.id === id),
}));