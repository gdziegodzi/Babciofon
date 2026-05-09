import { getDatabase } from '@/db/database';
import type {
  AlarmTemplate,
  AlarmTemplateInput,
  Contact,
} from '@/types/domain';

interface TemplateRow {
  id: string;
  label: string;
  body: string;
  include_location: number;
  created_at: string;
  updated_at: string;
}

interface ContactRow {
  id: string;
  name: string;
  phone: string;
  is_favourite: number;
  created_at: string;
  updated_at: string;
}

const rowToContact = (row: ContactRow): Contact => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  isFavourite: row.is_favourite === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

function generateId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function loadRecipients(templateId: string): Promise<Contact[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ContactRow>(
    `SELECT c.* FROM Contacts c
     INNER JOIN AlarmTemplateRecipients r ON r.contact_id = c.id
     WHERE r.template_id = ?
     ORDER BY r.position ASC`,
    [templateId]
  );
  return rows.map(rowToContact);
}

async function rowToTemplate(row: TemplateRow): Promise<AlarmTemplate> {
  return {
    id: row.id,
    label: row.label,
    body: row.body,
    includeLocation: row.include_location === 1,
    recipients: await loadRecipients(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const templatesRepository = {
  async getAll(): Promise<AlarmTemplate[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TemplateRow>(
      'SELECT * FROM AlarmTemplates ORDER BY label COLLATE NOCASE ASC'
    );
    const result: AlarmTemplate[] = [];
    for (const row of rows) {
      result.push(await rowToTemplate(row));
    }
    return result;
  },

  async getById(id: string): Promise<AlarmTemplate | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TemplateRow>(
      'SELECT * FROM AlarmTemplates WHERE id = ?',
      [id]
    );
    return row ? rowToTemplate(row) : null;
  },

  async create(input: AlarmTemplateInput): Promise<AlarmTemplate> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = generateId();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO AlarmTemplates (id, label, body, include_location, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.label.trim(),
          input.body.trim(),
          input.includeLocation ? 1 : 0,
          now,
          now,
        ]
      );

      for (let i = 0; i < input.recipientIds.length; i++) {
        await db.runAsync(
          `INSERT INTO AlarmTemplateRecipients (template_id, contact_id, position)
           VALUES (?, ?, ?)`,
          [id, input.recipientIds[i], i]
        );
      }
    });

    const created = await this.getById(id);
    if (!created) throw new Error('Nie udało się utworzyć szablonu.');
    return created;
  },

  async update(id: string, input: AlarmTemplateInput): Promise<AlarmTemplate> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        `UPDATE AlarmTemplates
         SET label = ?, body = ?, include_location = ?, updated_at = ?
         WHERE id = ?`,
        [
          input.label.trim(),
          input.body.trim(),
          input.includeLocation ? 1 : 0,
          now,
          id,
        ]
      );
      if (result.changes === 0) {
        throw new Error(`Nie znaleziono szablonu o id ${id}.`);
      }

      // Zamiast diff'a - po prostu kasujemy i wstawiamy ponownie odbiorców
      await db.runAsync(
        'DELETE FROM AlarmTemplateRecipients WHERE template_id = ?',
        [id]
      );
      for (let i = 0; i < input.recipientIds.length; i++) {
        await db.runAsync(
          `INSERT INTO AlarmTemplateRecipients (template_id, contact_id, position)
           VALUES (?, ?, ?)`,
          [id, input.recipientIds[i], i]
        );
      }
    });

    const updated = await this.getById(id);
    if (!updated) throw new Error('Szablon zniknął po aktualizacji.');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    // ON DELETE CASCADE w schemacie zajmie się odbiorcami
    await db.runAsync('DELETE FROM AlarmTemplates WHERE id = ?', [id]);
  },

  /** Tworzy domyślne szablony jeśli baza jest pusta. */
  async seedDefaultsIfEmpty(): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM AlarmTemplates'
    );
    if (row && row.count > 0) return;

    const defaults: AlarmTemplateInput[] = [
      {
        label: 'Potrzebuję pomocy',
        body: 'Potrzebuję pomocy. Proszę o kontakt.',
        includeLocation: true,
        recipientIds: [],
      },
      {
        label: 'Wszystko w porządku',
        body: 'Wszystko w porządku. Daję znać, że jestem bezpieczny/a.',
        includeLocation: false,
        recipientIds: [],
      },
      {
        label: 'Wracam do domu',
        body: 'Wracam do domu. Będę za chwilę.',
        includeLocation: false,
        recipientIds: [],
      },
    ];

    for (const tpl of defaults) {
      await this.create(tpl);
    }
  },
};
