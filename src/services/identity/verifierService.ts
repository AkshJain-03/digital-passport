/**
 * Verifier Service
 *
 * Verifies that a DID presentation is authentic.
 *
 * In production this performs:
 *   1. DID document resolution
 *   2. Public key extraction
 *   3. Signature verification against src/crypto/signatures.ts
 *
 * Here we provide the structural contract — implementations
 * call into the existing crypto layer without modifying it.
 */

import type { TrustState }  from '../../theme/colors';
import { issuerDirectoryService } from './issuerDirectoryService';

export interface DIDPresentation {
  holderDid:   string;
  issuerDid:   string;
  credentialId: string;
  proofHash:   string;
  timestamp:   string;
}

export interface VerifierResult {
  isValid:     boolean;
  trustState:  TrustState;
  reason?:     string;
}

export const verifierService = {

  /**
   * Verifies a DID presentation.
   * Returns a trust state based on the issuer's trust level.
   */
  async verify(presentation: DIDPresentation): Promise<VerifierResult> {
    if (!presentation.holderDid || !presentation.issuerDid) {
      return { isValid: false, trustState: 'unknown', reason: 'Missing DID fields' };
    }

    if (!presentation.proofHash || presentation.proofHash.length < 8) {
      return { isValid: false, trustState: 'unknown', reason: 'Invalid proof hash' };
    }

    // Check issuer trust
    const issuerTrust = await issuerDirectoryService.resolveTrustState(
      presentation.issuerDid,
    );

    if (issuerTrust === 'revoked') {
      return {
        isValid:    false,
        trustState: 'revoked',
        reason:     'Issuer has been revoked',
      };
    }

    // Production: call signatures.verifyPresentation(presentation) here
    // const cryptoResult = await signatures.verifyPresentation(presentation);

    return {
      isValid:    true,
      trustState: issuerTrust === 'unknown' ? 'pending' : issuerTrust,
    };
  },
};