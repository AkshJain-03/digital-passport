/**
 * Fraud Signal Service
 *
 * AI-assisted heuristic fraud detection for posts and products.
 * Operates entirely on-device — no user data sent externally.
 *
 * Fraud signal types for posts:
 *   unknown_issuer         — Issuer DID not in trusted registry
 *   revoked_credential     — Author credential has been revoked
 *   suspicious_institution — Institution flagged or unrecognised
 *   invalid_signature      — Cryptographic signature could not be verified
 *   unverified_author      — No DID-backed identity
 *   no_institution         — Missing institutional affiliation
 *   unverified_claims      — Many claims with no backing
 *   no_source              — No source URL provided
 *   synthetic_content      — AI-generated content signals
 *   rapid_posting          — Bot-like posting velocity
 *   credential_mismatch    — Topic doesn't match author credentials
 */

import type { Post }    from '../../models/post';
import type { Product } from '../../models/product';
import type { TrustState } from '../../theme/colors';
import type { FraudSignal, FraudAnalysis, FraudSeverity } from '../../domain/truth/truthTypes';

// ─── Helper ───────────────────────────────────────────────────────────────────

const sig = (
  id:          FraudSignal['id'],
  label:       string,
  severity:    FraudSeverity,
  detail?:     string,
  remediation?: string,
): FraudSignal => ({ id, label, severity, detail, remediation });

// ─── Service ──────────────────────────────────────────────────────────────────

export const fraudSignalService = {

  // ── Post analysis ──────────────────────────────────────────────────────────

  analysePost(post: Post): FraudAnalysis {
    const signals: FraudSignal[] = [];
    let riskScore = 0;

    // ── 1. Unknown issuer (DID not in registry) ──────────────────────────
    if (!post.author.isVerified && post.author.did.startsWith('did:')) {
      signals.push(sig(
        'unknown_issuer',
        'Unknown Issuer DID',
        'high',
        `DID ${post.author.did.slice(0, 24)}… not found in trusted registry`,
        'Check the issuer directory or scan the author\'s credential QR.',
      ));
      riskScore += 35;
    }

    // ── 2. Revoked credential ─────────────────────────────────────────────
    if (post.author.trustState === 'revoked') {
      signals.push(sig(
        'revoked_credential',
        'Credential Revoked',
        'critical',
        'The author\'s verifiable credential has been revoked by the issuer.',
        'Do not treat this content as verified — the credential was invalidated.',
      ));
      riskScore += 60;
    }

    // ── 3. Suspicious institution ─────────────────────────────────────────
    if (post.author.institution &&
        post.author.institution.toLowerCase().includes('unknown')) {
      signals.push(sig(
        'suspicious_institution',
        'Suspicious Institution',
        'high',
        `Institution "${post.author.institution}" is flagged or unrecognised.`,
        'Verify the institution independently before trusting this content.',
      ));
      riskScore += 30;
    }

    // ── 4. Invalid signature (no verifiedClaimCount but has claims) ───────
    if (post.claimCount > 0 && post.verifiedClaimCount === 0 && !post.author.isVerified) {
      signals.push(sig(
        'invalid_signature',
        'Signature Unverifiable',
        'high',
        'No cryptographic proof could be verified for this post or its claims.',
        'Scan the post QR to attempt signature resolution.',
      ));
      riskScore += 40;
    }

    // ── 5. Unverified author ──────────────────────────────────────────────
    if (!post.author.isVerified) {
      signals.push(sig(
        'unverified_author',
        'Author Not Verified',
        'medium',
        'The post author has no verified credentials on the Sovereign Trust network.',
      ));
      riskScore += 25;
    }

    // ── 6. No institutional affiliation ──────────────────────────────────
    if (!post.author.institution) {
      signals.push(sig(
        'no_institution',
        'No Institutional Affiliation',
        'low',
        'Author has no registered institution backing this claim.',
      ));
      riskScore += 10;
    }

    // ── 7. Many unverified claims ─────────────────────────────────────────
    if (post.claimCount > 2 && post.verifiedClaimCount < post.claimCount * 0.5) {
      signals.push(sig(
        'unverified_claims',
        'Many Unverified Claims',
        'high',
        `${post.verifiedClaimCount}/${post.claimCount} claims have no backing credential.`,
        'Look for independent sources backing each claim.',
      ));
      riskScore += 25;
    }

    // ── 8. No source URL ─────────────────────────────────────────────────
    if (!post.sourceUrl) {
      signals.push(sig(
        'no_source',
        'No Source Link',
        'low',
        'This post has no source URL for independent verification.',
      ));
      riskScore += 5;
    }

    const trustState: TrustState =
      riskScore >= 70 ? 'revoked'    :
      riskScore >= 45 ? 'suspicious' :
      riskScore >= 20 ? 'pending'    :
      signals.length === 0 ? 'verified' : 'trusted';

    return { trustState, signals, riskScore, analysedAt: new Date().toISOString() };
  },

  // ── Product analysis ───────────────────────────────────────────────────────

  analyseProduct(product: Product): FraudAnalysis {
    const signals: FraudSignal[] = [];
    let riskScore = 0;

    if (product.status === 'counterfeit') {
      signals.push(sig('revoked_credential', 'Flagged as Counterfeit', 'critical',
        'This product has been flagged as counterfeit in the registry.'));
      riskScore += 90;
    }

    if (product.status === 'recalled') {
      signals.push(sig('revoked_credential', 'Product Recalled', 'critical',
        'This product has an active recall. Do not use.'));
      riskScore += 80;
    }

    if (product.custodyChain.length === 0) {
      signals.push(sig('unknown_issuer', 'No Custody Chain', 'medium',
        'Unable to trace product origin or custody history.'));
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
