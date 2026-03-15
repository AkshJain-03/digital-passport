/**
 * Post Repository
 */

import { getDb }    from '../sqlite/db';
import type { Post, PostVerificationStatus } from '../../models/post';
import type { TrustState }                   from '../../theme/colors';

const rowToPost = (row: any): Post => ({
  id:                 row.id,
  content:            row.content,
  summary:            row.summary            ?? undefined,
  author:             JSON.parse(row.author_json),
  sourceUrl:          row.source_url         ?? undefined,
  sourceName:         row.source_name        ?? undefined,
  publishedAt:        row.published_at,
  verificationStatus: row.verification_status as PostVerificationStatus,
  trustState:         row.trust_state        as TrustState,
  claimCount:         row.claim_count        ?? 0,
  verifiedClaimCount: row.verified_claim_count ?? 0,
  tags:               JSON.parse(row.tags_json ?? '[]'),
  createdAt:          row.created_at,
});

export const postRepository = {

  async findAll(limit = 50, offset = 0): Promise<Post[]> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM posts ORDER BY published_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
    );
    const posts: Post[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      posts.push(rowToPost(result.rows.item(i)));
    }
    return posts;
  },

  async findById(id: string): Promise<Post | null> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM posts WHERE id = ?', [id],
    );
    if (result.rows.length === 0) return null;
    return rowToPost(result.rows.item(0));
  },

  async insert(p: Post): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `INSERT INTO posts
        (id, content, summary, author_json, source_url, source_name,
         published_at, verification_status, trust_state,
         claim_count, verified_claim_count, tags_json, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.id, p.content, p.summary ?? null,
        JSON.stringify(p.author),
        p.sourceUrl ?? null, p.sourceName ?? null,
        p.publishedAt, p.verificationStatus, p.trustState,
        p.claimCount, p.verifiedClaimCount,
        JSON.stringify(p.tags), p.createdAt,
      ],
    );
  },

  async updateVerification(
    id:          string,
    status:      PostVerificationStatus,
    trustState:  TrustState,
  ): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      'UPDATE posts SET verification_status = ?, trust_state = ? WHERE id = ?',
      [status, trustState, id],
    );
  },
};
