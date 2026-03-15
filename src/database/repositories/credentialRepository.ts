/**
 * Credential Repository
 *
 * All SQLite read/write operations for the credentials table.
 * Returns domain model objects; callers never touch raw SQL.
 */

import { getDb }          from '../sqlite/db';
import type { Credential, CredentialStatus } from '../../models/credential';
import type { TrustState }                   from '../../theme/colors';

// ─── Row → model mapper ───────────────────────────────────────────────────────

const rowToCredential = (row: any): Credential => ({
  id:                 row.id,
  type:               row.type,
  title:              row.title,
  description:        row.description,
  subjectDid:         row.subject_did,
  issuerDid:          row.issuer_did,
  issuerId:           row.issuer_id,
  issuedAt:           row.issued_at,
  expiresAt:          row.expires_at ?? null,
  status:             row.status           as CredentialStatus,
  trustState:         row.trust_state      as TrustState,
  signatureAlgorithm: row.signature_algorithm,
  proofHash:          row.proof_hash,
  isVerified:         row.is_verified === 1,
  rawJwt:             row.raw_jwt ?? null,
  createdAt:          row.created_at,
  updatedAt:          row.updated_at,
});

// ─── Repository ───────────────────────────────────────────────────────────────

export const credentialRepository = {

  async findAll(): Promise<Credential[]> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM credentials ORDER BY created_at DESC',
    );
    const creds: Credential[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      creds.push(rowToCredential(result.rows.item(i)));
    }
    return creds;
  },

  async findById(id: string): Promise<Credential | null> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM credentials WHERE id = ?',
      [id],
    );
    if (result.rows.length === 0) return null;
    return rowToCredential(result.rows.item(0));
  },

  async findByStatus(status: CredentialStatus): Promise<Credential[]> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM credentials WHERE status = ? ORDER BY created_at DESC',
      [status],
    );
    const creds: Credential[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      creds.push(rowToCredential(result.rows.item(i)));
    }
    return creds;
  },

  async insert(c: Credential): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `INSERT INTO credentials
        (id, type, title, description, subject_did, issuer_did, issuer_id,
         issued_at, expires_at, status, trust_state, signature_algorithm,
         proof_hash, is_verified, raw_jwt, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        c.id, c.type, c.title, c.description,
        c.subjectDid, c.issuerDid, c.issuerId,
        c.issuedAt, c.expiresAt,
        c.status, c.trustState,
        c.signatureAlgorithm, c.proofHash,
        c.isVerified ? 1 : 0,
        c.rawJwt,
        c.createdAt, c.updatedAt,
      ],
    );
  },

  async updateTrustState(id: string, trustState: TrustState, isVerified: boolean): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `UPDATE credentials SET trust_state = ?, is_verified = ?, updated_at = ?
       WHERE id = ?`,
      [trustState, isVerified ? 1 : 0, new Date().toISOString(), id],
    );
  },

  async updateStatus(id: string, status: CredentialStatus): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      'UPDATE credentials SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.executeSql('DELETE FROM credentials WHERE id = ?', [id]);
  },

  async count(): Promise<number> {
    const db = await getDb();
    const [result] = await db.executeSql(
      "SELECT COUNT(*) as cnt FROM credentials WHERE status = 'active'",
    );
    return result.rows.item(0).cnt as number;
  },
};
