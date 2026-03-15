/**
 * Issuer Repository
 */

import { getDb }      from '../sqlite/db';
import type { Issuer } from '../../models/credential';
import type { TrustState } from '../../theme/colors';

const rowToIssuer = (row: any): Issuer => ({
  id:         row.id,
  did:        row.did,
  name:       row.name,
  shortName:  row.short_name,
  logoEmoji:  row.logo_emoji,
  category:   row.category,
  country:    row.country,
  isVerified: row.is_verified === 1,
  trustState: row.trust_state as TrustState,
  addedAt:    row.added_at,
});

export const issuerRepository = {

  async findAll(): Promise<Issuer[]> {
    const db = await getDb();
    const [result] = await db.executeSql('SELECT * FROM issuers ORDER BY name ASC');
    const issuers: Issuer[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      issuers.push(rowToIssuer(result.rows.item(i)));
    }
    return issuers;
  },

  async findByDid(did: string): Promise<Issuer | null> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM issuers WHERE did = ?', [did],
    );
    if (result.rows.length === 0) return null;
    return rowToIssuer(result.rows.item(0));
  },

  async upsert(issuer: Issuer): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `INSERT OR REPLACE INTO issuers
        (id, did, name, short_name, logo_emoji, category, country, is_verified, trust_state, added_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        issuer.id, issuer.did, issuer.name, issuer.shortName,
        issuer.logoEmoji, issuer.category, issuer.country,
        issuer.isVerified ? 1 : 0, issuer.trustState, issuer.addedAt,
      ],
    );
  },
};