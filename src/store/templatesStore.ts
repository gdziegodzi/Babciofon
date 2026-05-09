import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import type { AlarmTemplate } from '@/types/domain';

interface TemplatesState {
  templates: AlarmTemplate[];
  load: () => Promise<void>;
}

interface TemplateRow {
  id: string;
  label: string;
  body: string;
  include_location: number;
  created_at: string;
  updated_at: string;
}

export const useTemplatesStore = create<TemplatesState>((set) => ({
  templates: [],

  load: async () => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TemplateRow>(
      'SELECT * FROM AlarmTemplates ORDER BY label ASC'
    );
    set({
      templates: rows.map((r) => ({
        id: r.id,
        label: r.label,
        body: r.body,
        includeLocation: r.include_location === 1,
        recipients: [], // doczytamy w pełnej implementacji modułu alarmów
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  },
}));
