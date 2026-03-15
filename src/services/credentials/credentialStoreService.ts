/**
 * Credential Store Service
 *
 * Facade over the credential repository.
 * Business rules live here; the repository is pure data access.
 */

import { credentialRepository }        from '../../database/repositories/credentialRepository';
import { issuerRepository }            from '../../database/repositories/issuerRepository';
import { MOCK_CREDENTIALS }            from '../../constants/mockData';
import { ISSUER_DIRECTORY }            from '../../constants/issuerDirectory';
import type { Credential, CredentialWithIssuer } from '../../models/credential';

export const credentialStoreService = {

  /**
   * Returns all credentials joined with their issuer.
   * Falls back to mock data if the DB is empty (dev/preview mode).
   */
  async getAll(): Promise<CredentialWithIssuer[]> {
    const creds = await credentialRepository.findAll();

    if (creds.length === 0) {
      // Dev mode: return mock data without writing to DB
      return MOCK_CREDENTIALS;
    }

    // Join with issuers
    const issuers = await issuerRepository.findAll();
    const issuerMap = new Map(issuers.map(i => [i.id, i]));

    return creds.map(c => ({
      ...c,
      issuer: issuerMap.get(c.issuerId) ?? ISSUER_DIRECTORY.find(i => i.id === c.issuerId)!,
    }));
  },

  async getById(id: string): Promise<CredentialWithIssuer | null> {
    const all = await this.getAll();
    return all.find(c => c.id === id) ?? null;
  },

  async save(credential: Credential): Promise<void> {
    await credentialRepository.insert(credential);
    // Upsert issuer if not already in DB
    const issuer = ISSUER_DIRECTORY.find(i => i.id === credential.issuerId);
    if (issuer) await issuerRepository.upsert(issuer);
  },

  async delete(id: string): Promise<void> {
    await credentialRepository.delete(id);
  },

  async count(): Promise<number> {
    const n = await credentialRepository.count();
    return n === 0 ? MOCK_CREDENTIALS.length : n;
  },
};