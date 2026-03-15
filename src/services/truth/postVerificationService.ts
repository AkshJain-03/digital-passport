/**
 * Post Verification Service
 *
 * Full post verification pipeline:
 *   1. Author DID resolution against trusted directory
 *   2. AI fraud signal analysis (all 8 signal types)
 *   3. Claim verification ratio check
 *   4. Signature/credential validity check
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

    const knownDids   = await issuerDirectoryService.getKnownDidSet();
    const authorKnown = knownDids.has(post.author.did);
    const fraud       = fraudSignalService.analysePost(post);

    const checks = [
      // Author identity check
      post.author.isVerified
        ? passCheck('author_verified', 'Author identity verified', post.author.displayName)
        : fraud.signals.some(s => s.id === 'revoked_credential')
          ? failCheck('author_verified', 'Author credential revoked')
          : warnCheck('author_verified', 'Author has no verified identity'),

      // DID registry check
      authorKnown
        ? passCheck('author_did', 'Author DID in trusted registry', post.author.did.slice(0, 24) + '…')
        : fraud.signals.some(s => s.id === 'unknown_issuer')
          ? failCheck('author_did', 'Issuer DID not in trusted registry',
              `${post.author.did.slice(0, 24)}… is unrecognised`)
          : warnCheck('author_did', 'Author DID not verified locally'),

      // Institution check
      post.author.institution
        ? fraud.signals.some(s => s.id === 'suspicious_institution')
          ? warnCheck('institution', 'Institution is flagged', post.author.institution)
          : passCheck('institution', 'Institutional affiliation present', post.author.institution)
        : warnCheck('institution', 'No institutional affiliation'),

      // Signature / claim check
      fraud.signals.some(s => s.id === 'invalid_signature')
        ? failCheck('signature', 'Signature could not be verified',
            'No cryptographic proof found for post or its claims')
        : post.verifiedClaimCount >= post.claimCount && post.claimCount > 0
          ? passCheck('signature', `All ${post.claimCount} claims cryptographically verified`)
          : post.verifiedClaimCount > 0
            ? warnCheck('signature', `${post.verifiedClaimCount}/${post.claimCount} claims verified`)
            : warnCheck('signature', 'No claims have been verified'),

      // Fraud signal summary
      fraud.signals.some(s => s.severity === 'critical' || s.severity === 'high')
        ? failCheck('fraud', 'High-risk fraud signals detected',
            fraud.signals.find(s => s.severity === 'high' || s.severity === 'critical')?.label)
        : fraud.signals.some(s => s.severity === 'medium')
          ? warnCheck('fraud', `${fraud.signals.length} risk signal(s) detected`)
          : passCheck('fraud', 'No significant fraud signals'),
    ];

    return buildVerificationResult({
      subjectId:   post.id,
      subjectType: 'post',
      checks,
      startMs,
    });
  },
};
