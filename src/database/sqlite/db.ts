/**
 * SQLite Database Connection
 *
 * Singleton pattern — call getDb() anywhere to get the open DB handle.
 * Opens once on first call, reuses connection on subsequent calls.
 *
 * Depends on: react-native-sqlite-storage
 */

import SQLite from 'react-native-sqlite-storage';
import { ALL_MIGRATIONS } from './schema';

SQLite.enablePromise(true);

const DB_NAME    = 'sovereign_trust.db';
const DB_VERSION = '1.0';
const DB_DISPLAY = 'Sovereign Trust';
const DB_SIZE    = 200000;


let _db: any | null = null;

export const getDb = async (): Promise<any> => {
  if (_db) return _db;

  _db = await SQLite.openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY, DB_SIZE);
  await runMigrations(_db);
  return _db;
};

const runMigrations = async (db: any): Promise<void> => {
  for (const sql of ALL_MIGRATIONS) {
    await db.executeSql(sql);
  }
};

export const closeDb = async (): Promise<void> => {
  if (_db) {
    await _db.close();
    _db = null;
  }
};