/**
 * useTruthFeed
 *
 * Provides paginated post data and per-post verification to the
 * TruthFeed screen. Falls back to mock data when the DB is empty.
 */

import { useCallback, useEffect, useState } from 'react';
import { postRepository }  from '../database/repositories/postRepository';
import type { Post, PostVerificationStatus } from '../models/post';
import type { TrustState } from '../theme/colors';

// ─── Mock posts ───────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id:      'post-001',
    content: 'ISRO successfully launches the next-generation INSAT-4B satellite from Sriharikota using the LVM3 rocket.',
    summary: 'INSAT-4B launched successfully.',
    author: {
      did:         'did:sov:ISRO-Official-0xI1',
      displayName: 'ISRO',
      handle:      '@isro_official',
      avatarEmoji: '🚀',
      institution: 'Indian Space Research Organisation',
      trustState:  'verified',
      isVerified:  true,
    },
    sourceUrl:          'https://isro.gov.in/press-release/insat4b',
    sourceName:         'ISRO Official',
    publishedAt:        '2025-03-10T08:30:00Z',
    verificationStatus: 'verified_author',
    trustState:         'verified',
    claimCount:         3,
    verifiedClaimCount: 3,
    tags:               ['space', 'india', 'satellite'],
    createdAt:          '2025-03-10T08:30:00Z',
  },
  {
    id:      'post-002',
    content: 'The Reserve Bank of India has cut the repo rate by 25 basis points to 6.25%, citing easing inflation and the need to support growth.',
    author: {
      did:         'did:sov:RBI-Official-0xR1',
      displayName: 'Reserve Bank of India',
      handle:      '@RBI',
      avatarEmoji: '🏦',
      institution: 'Reserve Bank of India',
      trustState:  'trusted',
      isVerified:  true,
    },
    sourceName:         'RBI Press Release',
    publishedAt:        '2025-03-08T10:00:00Z',
    verificationStatus: 'verified_author',
    trustState:         'trusted',
    claimCount:         2,
    verifiedClaimCount: 2,
    tags:               ['economy', 'rbi', 'india'],
    createdAt:          '2025-03-08T10:00:00Z',
  },
  {
    id:      'post-003',
    content: 'Sources claim a major Indian tech company is acquiring a US-based AI startup for $500M. Unconfirmed.',
    author: {
      did:         'did:sov:Unknown-0xU1',
      displayName: 'TechLeaks',
      handle:      '@techleaks_in',
      avatarEmoji: '📱',
      institution: null,
      trustState:  'suspicious',
      isVerified:  false,
    },
    publishedAt:        '2025-03-09T16:45:00Z',
    verificationStatus: 'unverified_author',
    trustState:         'suspicious',
    claimCount:         1,
    verifiedClaimCount: 0,
    tags:               ['tech', 'rumour'],
    createdAt:          '2025-03-09T16:45:00Z',
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type FeedFilter = 'all' | 'verified' | 'suspicious' | 'unverified';

interface TruthFeedState {
  posts:       Post[];
  isLoading:   boolean;
  error:       string | null;
  filter:      FeedFilter;
  setFilter:   (f: FeedFilter) => void;
  refresh:     () => Promise<void>;
  verifyPost:  (postId: string) => Promise<void>;
}

export const useTruthFeed = (): TruthFeedState => {
  const [allPosts,  setAllPosts]  = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState<FeedFilter>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dbPosts = await postRepository.findAll();
      setAllPosts(dbPosts.length > 0 ? dbPosts : MOCK_POSTS);
    } catch {
      setAllPosts(MOCK_POSTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filter ──────────────────────────────────────────────────────────────
  const posts = filter === 'all'
    ? allPosts
    : allPosts.filter(p => {
        if (filter === 'verified')   return p.trustState === 'verified' || p.trustState === 'trusted';
        if (filter === 'suspicious') return p.trustState === 'suspicious';
        if (filter === 'unverified') return p.verificationStatus === 'unverified_author';
        return true;
      });

  // ── Per-post verification ───────────────────────────────────────────────
  const verifyPost = useCallback(async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Simple heuristic: verified author → pass, else suspicious
    const newStatus: PostVerificationStatus = post.author.isVerified
      ? 'verified_author'
      : 'unverified_author';
    const newTrust: TrustState = post.author.isVerified ? 'verified' : 'suspicious';

    await postRepository.updateVerification(postId, newStatus, newTrust);

    setAllPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, verificationStatus: newStatus, trustState: newTrust }
        : p,
    ));
  }, [allPosts]);

  return { posts, isLoading, error, filter, setFilter, refresh: load, verifyPost };
};