/**
 * useTruthFeed
 *
 * Provides paginated posts + per-post verification.
 * Falls back to rich mock data covering all trust states and fraud signal types.
 */

import { useCallback, useEffect, useState } from 'react';
import { postRepository }            from '../database/repositories/postRepository';
import { postVerificationService }   from '../services/truth/postVerificationService';
import { fraudSignalService }        from '../services/ai/fraudSignalService';
import type { Post, PostVerificationStatus } from '../models/post';
import type { FraudAnalysis }        from '../domain/truth/truthTypes';
import type { TrustState }           from '../theme/colors';

// ─── Mock posts — covers all fraud signal types ───────────────────────────────

const MOCK_POSTS: Post[] = [
  // 1. Fully verified institutional post
  {
    id:      'post-001',
    content: 'ISRO successfully launches the INSAT-4B satellite from Sriharikota using the LVM3 rocket. All systems nominal.',
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
  // 2. Trusted institutional post
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
  // 3. Suspicious post — unknown issuer + unverified claims
  {
    id:      'post-003',
    content: 'BREAKING: A major Indian tech conglomerate is secretly acquiring a US-based AI startup for $500M. Our exclusive source confirmed this deal is already signed.',
    author: {
      did:         'did:sov:Unknown-0xU1',
      displayName: 'TechLeaks India',
      handle:      '@techleaks_in',
      avatarEmoji: '📱',
      institution: null,
      trustState:  'suspicious',
      isVerified:  false,
    },
    publishedAt:        '2025-03-09T16:45:00Z',
    verificationStatus: 'unverified_author',
    trustState:         'suspicious',
    claimCount:         4,
    verifiedClaimCount: 0,
    tags:               ['tech', 'rumour', 'unverified'],
    createdAt:          '2025-03-09T16:45:00Z',
  },
  // 4. Revoked credential
  {
    id:      'post-004',
    content: 'Our research shows that a new treatment protocol has achieved 94% efficacy in clinical trials. Full paper available at our institute website.',
    author: {
      did:         'did:sov:FakeInstitute-0xF1',
      displayName: 'Global Health Research',
      handle:      '@ghr_institute',
      avatarEmoji: '🧬',
      institution: 'Unknown Research Institute',
      trustState:  'revoked',
      isVerified:  false,
    },
    sourceName:         'GHR Institute',
    publishedAt:        '2025-03-07T14:20:00Z',
    verificationStatus: 'unverified_author',
    trustState:         'revoked',
    claimCount:         3,
    verifiedClaimCount: 0,
    tags:               ['health', 'research', 'suspicious'],
    createdAt:          '2025-03-07T14:20:00Z',
  },
  // 5. Partially verified — some claims backed
  {
    id:      'post-005',
    content: 'IIT Bombay announces a new AI research lab in collaboration with three Fortune 500 companies. The lab will focus on trustworthy AI systems.',
    author: {
      did:         'did:sov:IITB_ISSUER_DID_abc123456',
      displayName: 'IIT Bombay',
      handle:      '@iitbombay',
      avatarEmoji: '🎓',
      institution: 'Indian Institute of Technology Bombay',
      trustState:  'trusted',
      isVerified:  true,
    },
    sourceName:  'IIT Bombay Communications',
    sourceUrl:   'https://iitb.ac.in/news/ai-research-lab',
    publishedAt: '2025-03-06T09:00:00Z',
    verificationStatus: 'verified_author',
    trustState:         'trusted',
    claimCount:         3,
    verifiedClaimCount: 2,
    tags:               ['education', 'ai', 'iitb'],
    createdAt:   '2025-03-06T09:00:00Z',
  },
  // 6. Invalid signature — no claims verified
  {
    id:      'post-006',
    content: 'The government has officially announced a 40% cut in import duties on semiconductor manufacturing equipment, effective immediately.',
    author: {
      did:         'did:sov:GovtSource-0xG1',
      displayName: 'IndiaGovtNews',
      handle:      '@indiagovtnews',
      avatarEmoji: '🏛️',
      institution: null,
      trustState:  'pending',
      isVerified:  false,
    },
    publishedAt:        '2025-03-05T11:30:00Z',
    verificationStatus: 'unverified_author',
    trustState:         'pending',
    claimCount:         2,
    verifiedClaimCount: 0,
    tags:               ['policy', 'semiconductors', 'india'],
    createdAt:          '2025-03-05T11:30:00Z',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedFilter = 'all' | 'verified' | 'suspicious' | 'unverified';

export interface PostWithFraud extends Post {
  fraudAnalysis?: FraudAnalysis;
}

interface TruthFeedState {
  posts:      PostWithFraud[];
  isLoading:  boolean;
  error:      string | null;
  filter:     FeedFilter;
  setFilter:  (f: FeedFilter) => void;
  refresh:    () => Promise<void>;
  verifyPost: (postId: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTruthFeed = (): TruthFeedState => {
  const [allPosts,  setAllPosts]  = useState<PostWithFraud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState<FeedFilter>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dbPosts = await postRepository.findAll();
      const raw: Post[] = dbPosts.length > 0 ? dbPosts : MOCK_POSTS;

      // Attach fraud analysis to each post
      const enriched: PostWithFraud[] = raw.map(p => ({
        ...p,
        fraudAnalysis: fraudSignalService.analysePost(p),
      }));

      setAllPosts(enriched);
    } catch {
      const enriched: PostWithFraud[] = MOCK_POSTS.map(p => ({
        ...p,
        fraudAnalysis: fraudSignalService.analysePost(p),
      }));
      setAllPosts(enriched);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const posts = filter === 'all'
    ? allPosts
    : allPosts.filter(p => {
        if (filter === 'verified')   return p.trustState === 'verified' || p.trustState === 'trusted';
        if (filter === 'suspicious') return p.trustState === 'suspicious' || p.trustState === 'revoked';
        if (filter === 'unverified') return p.verificationStatus === 'unverified_author';
        return true;
      });

  const verifyPost = useCallback(async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    try {
      const result = await postVerificationService.verify(post);
      const newTrust = result.trustState as TrustState;
      const newStatus: PostVerificationStatus = newTrust === 'verified' || newTrust === 'trusted'
        ? 'verified_author'
        : 'unverified_author';

      await postRepository.updateVerification(postId, newStatus, newTrust);

      setAllPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              verificationStatus: newStatus,
              trustState:         newTrust,
              fraudAnalysis:      fraudSignalService.analysePost({ ...p, trustState: newTrust }),
            }
          : p,
      ));
    } catch {
      // Fallback: heuristic only
      const newTrust: TrustState = post.author.isVerified ? 'verified' : 'suspicious';
      setAllPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, trustState: newTrust } : p,
      ));
    }
  }, [allPosts]);

  return { posts, isLoading, error, filter, setFilter, refresh: load, verifyPost };
};
