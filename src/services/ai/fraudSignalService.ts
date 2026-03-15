/**
 * Fraud Signal Service
 *
 * AI-assisted heuristic signals for detecting suspicious content.
 *
 * Operates entirely on-device — no user data is sent externally.
 * Analyses metadata patterns (not content) to surface risk signals.
 *
 * Future: integrate with a local on-device model via react-native-llm.
 */

import type { Post }    from '../../models/post';
import type { Product } from '../../models/product';
import type { TrustState } from '../../theme/colors';

// ─── Signal types ─────────────────────────────────────────────────────────────

export interface FraudSignal {
  id:          string;
  label:       string;
  severity:    'low' | 'medium' | 'high';
  detail?:     string;
}

export interface FraudAnalysis {
  trustState:  TrustState;
  signals:     FraudSignal[];
  riskScore:   number;    // 0–100: higher = more suspicious
  analysedAt:  string;
}

// ─── Post analysis ────────────────────────────────────────────────────────────

export const fraudSignalService = {

  /**
   * Analyses a post for fraud/misinformation signals.
   * Returns risk signals based on author verification, claim density, etc.
   */
  analysePost(post: Post): FraudAnalysis {
    const signals: FraudSignal[] = [];
    let riskScore = 0;

    // Unverified author
    if (!post.author.isVerified) {
      signals.push({
        id: 'unverified_author', label: 'Author not verified', severity: 'medium',
        detail: 'The post author has no verified credentials.',
      });
      riskScore += 30;
    }

    // No institution affiliation
    if (!post.author.institution) {
      signals.push({
        id: 'no_institution', label: 'No institutional affiliation', severity: 'low',
      });
      riskScore += 10;
    }

    // High claim count with low verification
    if (post.claimCount > 2 && post.verifiedClaimCount < post.claimCount * 0.5) {
      signals.push({
        id: 'unverified_claims', label: 'Many unverified claims', severity: 'high',
        detail: `${post.verifiedClaimCount}/${post.claimCount} claims verified.`,
      });
      riskScore += 25;
    }

    // No source URL
    if (!post.sourceUrl) {
      signals.push({
        id: 'no_source', label: 'No source link', severity: 'low',
      });
      riskScore += 5;
    }

    const trustState: TrustState =
      riskScore >= 50 ? 'suspicious' :
      riskScore >= 25 ? 'pending'    :
      signals.length === 0 ? 'verified' : 'trusted';

    return { trustState, signals, riskScore, analysedAt: new Date().toISOString() };
  },

  /**
   * Analyses a product scan for counterfeit signals.
   */
  analyseProduct(product: Product): FraudAnalysis {
    const signals: FraudSignal[] = [];
    let riskScore = 0;

    if (product.status === 'counterfeit') {
      signals.push({
        id: 'flagged_counterfeit', label: 'Flagged as counterfeit', severity: 'high',
      });
      riskScore += 90;
    }

    if (product.status === 'recalled') {
      signals.push({
        id: 'recalled', label: 'Product recalled', severity: 'high',
        detail: 'This product has an active recall. Do not use.',
      });
      riskScore += 80;
    }

    if (product.custodyChain.length === 0) {
      signals.push({
        id: 'no_custody', label: 'No custody chain', severity: 'medium',
        detail: 'Unable to trace product origin.',
      });
      riskScore += 20;
    }

    const trustState: TrustState =
      riskScore >= 70 ? 'revoked'    :
      riskScore >= 40 ? 'suspicious' :
      riskScore >= 15 ? 'pending'    :
      'verified';

    return { trustState, signals, riskScore, analysedAt: new Date().toISOString() };
  },
};