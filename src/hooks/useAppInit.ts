/**
 * useAppInit
 *
 * Runs once on first mount in App.tsx (or AppProviders).
 * Sequence:
 *   1. Open SQLite database
 *   2. Run pending migrations
 *   3. Seed dev data if DB is empty
 *   4. Warm issuerDirectoryService in-memory cache
 *   5. Prune stale handshake sessions
 *
 * Returns { ready, error } so the root can show a splash until done.
 */

import { useEffect, useState } from 'react';
import { getDb }                    from '../database/sqlite/db';
import { runMigrations }            from '../database/sqlite/migrations';
import { seedDatabase }             from '../database/sqlite/seed';
import { issuerDirectoryService }   from '../services/identity/issuerDirectoryService';
import { handshakeRepository }      from '../database/repositories/handshakeRepository';

interface AppInitState {
  ready: boolean;
  error: string | null;
}

export const useAppInit = (): AppInitState => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1. Open DB — creates the file if it doesn't exist
        const db = await getDb();

        // 2. Migrate
        await runMigrations(db);

        // 3. Seed dev data (idempotent — skips if data exists)
        await seedDatabase();

        // 4. Warm issuer cache (fast in-memory load)
        await issuerDirectoryService.getAll();

        // 5. Prune stale handshake sessions older than 24 h
        await handshakeRepository.pruneExpired();

        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          console.error('[useAppInit]', e);
          setError((e as Error).message ?? 'Initialisation failed');
          // Still mark ready so the app doesn't hang on a DB error
          setReady(true);
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);   // run once on mount

  return { ready, error };
};