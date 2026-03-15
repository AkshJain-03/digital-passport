/**
 * Handshake Repository
 */

import { getDb }     from '../sqlite/db';
import type { Handshake, HandshakeStatus } from '../../models/handshake';

const rowToHandshake = (row: any): Handshake => ({
  id:        row.id,
  challenge: JSON.parse(row.challenge_json),
  response:  row.response_json ? JSON.parse(row.response_json) : undefined,
  status:    row.status as HandshakeStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const handshakeRepository = {

  async findAll(): Promise<Handshake[]> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM handshakes ORDER BY created_at DESC LIMIT 100',
    );
    const items: Handshake[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(rowToHandshake(result.rows.item(i)));
    }
    return items;
  },

  async findById(id: string): Promise<Handshake | null> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM handshakes WHERE id = ?', [id],
    );
    if (result.rows.length === 0) return null;
    return rowToHandshake(result.rows.item(0));
  },

  async insert(h: Handshake): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `INSERT INTO handshakes
        (id, challenge_json, response_json, status, created_at, updated_at)
       VALUES (?,?,?,?,?,?)`,
      [
        h.id,
        JSON.stringify(h.challenge),
        h.response ? JSON.stringify(h.response) : null,
        h.status,
        h.createdAt,
        h.updatedAt,
      ],
    );
  },

  async updateStatus(id: string, status: HandshakeStatus, responseJson?: string): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `UPDATE handshakes SET status = ?, response_json = ?, updated_at = ?
       WHERE id = ?`,
      [status, responseJson ?? null, new Date().toISOString(), id],
    );
  },

  /**
   * Deletes handshakes older than 24 hours to keep the table small.
   */
  async pruneExpired(): Promise<void> {
    const db = await getDb();
    const cutoff = new Date(Date.now() - 86_400_000).toISOString();
    await db.executeSql(
      "DELETE FROM handshakes WHERE created_at < ? AND status != 'verified'",
      [cutoff],
    );
  },
};
