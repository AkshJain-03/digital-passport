/**
 * Truth Feed Service
 *
 * Provides post data for the TruthFeed screen.
 * Falls back to mock data when DB is empty.
 */

import { postRepository }     from '../../database/repositories/postRepository';
import type { Post }          from '../../models/post';
import type { TrustState }    from '../../theme/colors';

export const truthFeedService = {

  async getFeed(limit = 50, offset = 0): Promise<Post[]> {
    const posts = await postRepository.findAll(limit, offset);
    return posts;
  },

  async getById(id: string): Promise<Post | null> {
    return postRepository.findById(id);
  },

  async updateVerification(
    id:          string,
    trustState:  TrustState,
  ): Promise<void> {
    const status = trustState === 'verified' || trustState === 'trusted'
      ? 'verified_author' as const
      : 'unverified_author' as const;
    await postRepository.updateVerification(id, status, trustState);
  },
};