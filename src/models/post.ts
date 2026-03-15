/**
 * Post model
 *
 * A social post or claim that can be verified through the TruthFeed.
 * Verification checks the author's DID, institution credentials,
 * and content signature where available.
 */

import type { TrustState } from '../theme/colors';

export type PostVerificationStatus =
  | 'verified_author'
  | 'unverified_author'
  | 'disputed'
  | 'synthetic'       // AI-generated / manipulated content detected
  | 'unknown';

export interface PostAuthor {
  did:         string;
  displayName: string;
  handle:      string;
  avatarEmoji: string;
  institution: string | null;
  trustState:  TrustState;
  isVerified:  boolean;
}

export interface Post {
  id:                 string;
  content:            string;
  summary?:           string;
  author:             PostAuthor;
  sourceUrl?:         string;
  sourceName?:        string;
  publishedAt:        string;
  verificationStatus: PostVerificationStatus;
  trustState:         TrustState;
  claimCount:         number;
  verifiedClaimCount: number;
  tags:               string[];
  createdAt:          string;
}