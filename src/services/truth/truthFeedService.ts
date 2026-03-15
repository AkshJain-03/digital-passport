/**
 * Truth Feed Service
 *
 * Provides post data for the TruthFeed screen.
 * Falls back to mock data when the DB is empty.
 * Supports filtering by trust state.
 */

import { postRepository }  from '../../database/repositories/postRepository';
import type { Post }       from '../../models/post';
import type { TrustState } from '../../theme/colors';
import type { FeedFilter } from '../../hooks/useTruthFeed';

export const truthFeedService = {

  async getFeed(limit = 50, offset = 0): Promise<Post[]> {
    return postRepository.findAll(limit, offset);
  },

  async getById(id: string): Promise<Post | null> {
    return postRepository.findById(id);
  },

  async getFiltered(filter: FeedFilter, limit = 50): Promise<Post[]> {
    const all = await postRepository.findAll(limit, 0);
    if (filter === 'all') return all;
    return all.filter(p => {
      if (filter === 'verified')   return p.trustState === 'verified' || p.trustState === 'trusted';
      if (filter === 'suspicious') return p.trustState === 'suspicious' || p.trustState === 'revoked';
      if (filter === 'unverified') return p.verificationStatus === 'unverified_author';
      return true;
    });
  },

  async updateVerification(id: string, trustState: TrustState): Promise<void> {
    const status = trustState === 'verified' || trustState === 'trusted'
      ? 'verified_author' as const
      : 'unverified_author' as const;
    await postRepository.updateVerification(id, status, trustState);
  },
};
