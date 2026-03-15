/**
 * Database Seed
 *
 * Populates the SQLite database with mock data for development and
 * preview purposes. Safe to call repeatedly — checks for existing
 * records before inserting.
 *
 * Call seed() once after migrations complete in dev builds only.
 * Production builds should use real data from the user's wallet.
 */

import { credentialRepository } from '../repositories/credentialRepository';
import { issuerRepository }     from '../repositories/issuerRepository';
import { MOCK_CREDENTIALS }     from '../../constants/mockData';
import { ISSUER_DIRECTORY }     from '../../constants/issuerDirectory';

export const seed = async (): Promise<void> => {
  // ── Issuers ─────────────────────────────────────────────────────────────
  for (const issuer of ISSUER_DIRECTORY) {
    await issuerRepository.upsert(issuer);
  }

  // ── Credentials ─────────────────────────────────────────────────────────
  const existing = await credentialRepository.count();
  if (existing === 0) {
    for (const cred of MOCK_CREDENTIALS) {
      await credentialRepository.insert(cred);
    }
    console.log(`[Seed] Inserted ${MOCK_CREDENTIALS.length} mock credentials`);
  } else {
    console.log(`[Seed] Skipped — ${existing} credentials already exist`);
  }
};

// Backwards-compatible export name used elsewhere in the app
export const seedDatabase = seed;