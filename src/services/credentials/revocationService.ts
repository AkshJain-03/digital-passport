/**
 * Revocation Service
 *
 * Checks whether a credential has been revoked.
 * In production this would call an issuer revocation endpoint or
 * check an on-chain revocation registry. Here we provide a local
 * implementation that checks the stored status.
 */

import { credentialRepository } from '../../database/repositories/credentialRepository';
import type { Credential }      from '../../models/credential';

export const revocationService = {

  /**
   * Returns true if the credential is currently revoked.
   * Checks local DB status first; production would add a network check.
   */
  async isRevoked(credential: Credential): Promise<boolean> {
    if (credential.status === 'revoked') return true;

    // Production: check issuer revocation endpoint here
    // const registryResult = await issuerRegistryService.checkRevocation(credential.issuerDid, credential.id);
    // if (registryResult.revoked) { ... }

    return false;
  },

  /**
   * Marks a credential as revoked in the local store.
   * Called when the verification engine detects revocation.
   */
  async markRevoked(credentialId: string): Promise<void> {
    await credentialRepository.updateStatus(credentialId, 'revoked');
    await credentialRepository.updateTrustState(credentialId, 'revoked', false);
  },

  /**
   * Checks expiry and updates status to 'expired' if past date.
   */
  async checkExpiry(credential: Credential): Promise<boolean> {
    if (!credential.expiresAt) return false;
    const isExpired = new Date(credential.expiresAt) < new Date();
    if (isExpired && credential.status === 'active') {
      await credentialRepository.updateStatus(credential.id, 'expired');
    }
    return isExpired;
  },
};