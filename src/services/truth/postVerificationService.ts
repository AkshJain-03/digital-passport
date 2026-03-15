/**
 * Post Verification Service
 *
 * Verifies a post's authenticity by checking:
 *   1. Author DID resolution
 *   2. Fraud signal analysis
 *   3. Claim verification ratio
 */

import { fraudSignalService }         from '../ai/fraudSignalService';
import { issuerDirectoryService }     from '../identity/issuerDirectoryService';
import type { Post }                  from '../../models/post';
import type { VerificationResult }    from '../../domain/verification/verificationTypes';
import {
  buildVerificationResult,
  passCheck,
  failCheck,
  warnCheck,
}                                     from '../../domain/verification/verificationResult';
import 'react-native-get-random-values';

export const postVerificationService = {

  async verify(post: Post): Promise<VerificationResult> {
    const startMs = Date.now();

    // Author DID check
    const knownDids  = await issuerDirectoryService.getKnownDidSet();
    const authorKnown = knownDids.has(post.author.did);

    // Fraud analysis
    const fraud = fraudSignalService.analysePost(post);

    const checks = [
      post.author.isVerified
        ? passCheck('author_verified', 'Author is verified', post.author.displayName)
        : warnCheck('author_verified', 'Author not verified'),

      authorKnown
        ? passCheck('author_did', 'Author DID in trusted directory')
        : warnCheck('author_did', 'Author DID not in local directory'),

      post.verifiedClaimCount >= post.claimCount && post.claimCount > 0
        ? passCheck('claims', `All ${post.claimCount} claims verified`)
        : post.verifiedClaimCount > 0
          ? warnCheck('claims', `${post.verifiedClaimCount}/${post.claimCount} claims verified`)
          : warnCheck('claims', 'No claims verified'),

      fraud.signals.some(s => s.severity === 'high')
        ? failCheck('fraud_signals', 'High-risk fraud signals detected',
            fraud.signals.find(s => s.severity === 'high')?.label)
        : fraud.signals.length > 0
          ? warnCheck('fraud_signals', `${fraud.signals.length} minor risk signal(s)`)
          : passCheck('fraud_signals', 'No fraud signals detected'),
    ];

    return buildVerificationResult({
      subjectId:   post.id,
      subjectType: 'post',
      checks,
      startMs,
    });
  },
};