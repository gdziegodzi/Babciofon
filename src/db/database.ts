import * as SQLite from 'expo-sqlite';

const DB_NAME = 'babciofon.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

/**
 * Inicjalizacja bazy zgodnie ze schematem ERD z dokumentacji (rozdz. 6).
 * Tabele: Contacts, AlarmTemplates, AlarmTemplateRecipients, Settings.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Contacts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      is_favourite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AlarmTemplates (
      id TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL,
      body TEXT NOT NULL,
      include_location INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AlarmTemplateRecipients (
      template_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (template_id, contact_id),
      FOREIGN KEY (template_id) REFERENCES AlarmTemplates(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES Contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      high_contrast INTEGER NOT NULL DEFAULT 0,
      font_scale REAL NOT NULL DEFAULT 1.0,
      default_template_id TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (default_template_id) REFERENCES AlarmTemplates(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_favourite ON Contacts(is_favourite);
    CREATE INDEX IF NOT EXISTS idx_recipients_template ON AlarmTemplateRecipients(template_id);
  `);

  // Wstaw domyślny wiersz ustawień jeśli go nie ma
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO Settings (id, high_contrast, font_scale, default_template_id, updated_at)
     VALUES (1, 0, 1.0, NULL, ?);`,
    [now]
  );
}

/** Pomocnik do testów - kasuje bazę. NIE używać w produkcji. */
export async function _resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS AlarmTemplateRecipients;
    DROP TABLE IF EXISTS AlarmTemplates;
    DROP TABLE IF EXISTS Contacts;
    DROP TABLE IF EXISTS Settings;
  `);
  await initDatabase();
}
