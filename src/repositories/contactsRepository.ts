import { getDatabase } from '@/db/database';
import type { Contact, ContactInput } from '@/types/domain';

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

/** Generator ID - krótki, czytelny, wystarczająco unikalny dla aplikacji lokalnej. */
function generateId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class DuplicatePhoneError extends Error {
  constructor(phone: string) {
    super(`Kontakt z numerem ${phone} już istnieje.`);
    this.name = 'DuplicatePhoneError';
  }
}

export const contactsRepository = {
  async getAll(): Promise<Contact[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ContactRow>(
      'SELECT * FROM Contacts ORDER BY is_favourite DESC, name COLLATE NOCASE ASC'
    );
    return rows.map(rowToContact);
  },

  async getById(id: string): Promise<Contact | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ContactRow>(
      'SELECT * FROM Contacts WHERE id = ?',
      [id]
    );
    return row ? rowToContact(row) : null;
  },

  async findByPhone(phone: string): Promise<Contact | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ContactRow>(
      'SELECT * FROM Contacts WHERE phone = ?',
      [phone]
    );
    return row ? rowToContact(row) : null;
  },

  async create(input: ContactInput): Promise<Contact> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = generateId();

    try {
      await db.runAsync(
        `INSERT INTO Contacts (id, name, phone, is_favourite, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, input.name.trim(), input.phone, input.isFavourite ? 1 : 0, now, now]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('UNIQUE') && msg.includes('phone')) {
        throw new DuplicatePhoneError(input.phone);
      }
      throw e;
    }

    return {
      id,
      name: input.name.trim(),
      phone: input.phone,
      isFavourite: input.isFavourite,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: string, input: ContactInput): Promise<Contact> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    try {
      const result = await db.runAsync(
        `UPDATE Contacts
         SET name = ?, phone = ?, is_favourite = ?, updated_at = ?
         WHERE id = ?`,
        [input.name.trim(), input.phone, input.isFavourite ? 1 : 0, now, id]
      );
      if (result.changes === 0) {
        throw new Error(`Nie znaleziono kontaktu o id ${id}.`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('UNIQUE') && msg.includes('phone')) {
        throw new DuplicatePhoneError(input.phone);
      }
      throw e;
    }

    const updated = await this.getById(id);
    if (!updated) throw new Error(`Kontakt ${id} zniknął po aktualizacji.`);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM Contacts WHERE id = ?', [id]);
  },

  async setFavourite(id: string, isFavourite: boolean): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE Contacts SET is_favourite = ?, updated_at = ? WHERE id = ?',
      [isFavourite ? 1 : 0, now, id]
    );
  },

  /** Insert wsadowy - używany przy imporcie z książki telefonicznej. */
  async createBatch(
    items: ContactInput[]
  ): Promise<{ added: number; skipped: number }> {
    const db = await getDatabase();
    let added = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    await db.withTransactionAsync(async () => {
      for (const item of items) {
        const id = generateId();
        try {
          await db.runAsync(
            `INSERT INTO Contacts (id, name, phone, is_favourite, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, item.name.trim(), item.phone, item.isFavourite ? 1 : 0, now, now]
          );
          added++;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes('UNIQUE')) {
            skipped++;
          } else {
            throw e;
          }
        }
      }
    });

    return { added, skipped };
  },
};
