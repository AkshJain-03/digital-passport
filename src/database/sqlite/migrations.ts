/**
 * SQLite Migrations
 *
 * Versioned migration system. Each migration has an integer version
 * and a list of SQL statements to execute in order.
 *
 * The migrations table tracks the highest applied version so
 * the runner is idempotent — safe to call on every app launch.
 */

import type { SQLiteDatabase } from 'react-native-sqlite-storage';
import { ALL_MIGRATIONS }      from './schema';

// ─── Migrations registry ──────────────────────────────────────────────────────

interface Migration {
  version: number;
  name:    string;
  sql:     string[];
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name:    'initial_schema',
    sql:     [...ALL_MIGRATIONS],
  },
  // Future migrations go here:
  // { version: 2, name: 'add_handshakes', sql: [ CREATE_HANDSHAKES_TABLE ] },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  // Ensure the migrations tracking table exists
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version  INTEGER PRIMARY KEY,
      name     TEXT    NOT NULL,
      ran_at   TEXT    NOT NULL
    );
  `);

  // Find the highest version already applied
  const [result] = await db.executeSql(
    'SELECT MAX(version) as max_version FROM _migrations',
  );
  const currentVersion: number = result.rows.item(0).max_version ?? 0;

  // Apply any pending migrations in order
  const pending = MIGRATIONS.filter(m => m.version > currentVersion);

  for (const migration of pending) {
    await db.transaction(async tx => {
      for (const statement of migration.sql) {
        await tx.executeSql(statement);
      }
      await tx.executeSql(
        'INSERT INTO _migrations (version, name, ran_at) VALUES (?, ?, ?)',
        [migration.version, migration.name, new Date().toISOString()],
      );
    });
    console.log(`[DB] Applied migration v${migration.version}: ${migration.name}`);
  }
};
