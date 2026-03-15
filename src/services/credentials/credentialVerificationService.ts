/**
 * Credential Verification Service
 *
 * Runs the local verification pipeline on a credential and
 * returns a VerificationResult. Does NOT perform network calls —
 * all verification is local for privacy and speed.
 */

import 'react-native-get-random-values';
import { v4 as uuid }                     from 'uuid';
import { credentialRepository }           from '../../database/repositories/credentialRepository';
import { issuerRepository }               from '../../database/repositories/issuerRepository';
import { ISSUER_DIRECTORY }               from '../../constants/issuerDirectory';
import {
  validateCredential,
  deriveCredentialTrustState,
}                                         from '../../domain/credentials/credentialValidator';
import type { Credential }                from '../../models/credential';
import type { VerificationResult }        from '../../models/verification';

export const credentialVerificationService = {

  async verify(credential: Credential): Promise<VerificationResult> {
    const startMs = Date.now();

    // Build set of known issuer DIDs
    const storedIssuers = await issuerRepository.findAll();
    const knownDids = new Set([
      ...storedIssuers.map(i => i.did),
      ...ISSUER_DIRECTORY.map(i => i.did),
    ]);

    const checks     = validateCredential(credential, knownDids);
    const trustState = deriveCredentialTrustState(checks);
    const allPass    = checks.every(c => c.outcome === 'pass');

    // Persist updated trust state
    await credentialRepository.updateTrustState(
      credential.id,
      trustState,
      allPass,
    );

    const result: VerificationResult = {
      id:          uuid(),
      subjectId:   credential.id,
      subjectType: 'credential',
      trustState,
      checks,
      summary:     allPass
        ? `${credential.title} is valid and trusted.`
        : `Verification found issues with ${credential.title}.`,
      verifiedAt:  new Date().toISOString(),
      durationMs:  Date.now() - startMs,
    };

    return result;
  },
};