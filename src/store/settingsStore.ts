import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import type { Settings } from '@/types/domain';

interface SettingsState {
  settings: Settings;
  load: () => Promise<void>;
  update: (patch: Partial<Omit<Settings, 'id' | 'updatedAt'>>) => Promise<void>;
  reset: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  highContrast: false,
  fontScale: 1.0,
  defaultTemplateId: null,
  updatedAt: new Date().toISOString(),
};

interface SettingsRow {
  id: number;
  high_contrast: number;
  font_scale: number;
  default_template_id: string | null;
  updated_at: string;
}

const rowToSettings = (row: SettingsRow): Settings => ({
  id: row.id,
  highContrast: row.high_contrast === 1,
  fontScale: row.font_scale,
  defaultTemplateId: row.default_template_id,
  updatedAt: row.updated_at,
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  load: async () => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SettingsRow>(
      'SELECT * FROM Settings WHERE id = 1'
    );
    if (row) set({ settings: rowToSettings(row) });
  },

  update: async (patch) => {
    const db = await getDatabase();
    const current = get().settings;
    const next: Settings = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await db.runAsync(
      `UPDATE Settings
       SET high_contrast = ?, font_scale = ?, default_template_id = ?, updated_at = ?
       WHERE id = 1`,
      [
        next.highContrast ? 1 : 0,
        next.fontScale,
        next.defaultTemplateId,
        next.updatedAt,
      ]
    );
    set({ settings: next });
  },

  reset: async () => {
    await get().update({
      highContrast: false,
      fontScale: 1.0,
      defaultTemplateId: null,
    });
  },
}));
