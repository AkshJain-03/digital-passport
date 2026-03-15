/**
 * DID Service
 *
 * Manages the user's Decentralised Identifier.
 *
 * In production this would interact with src/crypto/hardwareKey.ts
 * to derive the DID from the Secure Enclave / StrongBox public key.
 *
 * SECURITY RULE: We never call biometric prompts here. DID operations
 * that require signing are initiated from explicit user interactions
 * in screen components.
 */

import { DID_METHOD, DID_PREFIX, DID_DISPLAY_LEN } from '../../constants/appConstants';
import type { Identity } from '../../models/identity';

// ─── DID utilities ────────────────────────────────────────────────────────────

export const didService = {

  /**
   * Returns a short display-friendly version of a DID.
   * e.g. "did:sov:7Tq3kTmNpL8v…9fP2Yz"
   */
  abbreviate(did: string, maxLen = DID_DISPLAY_LEN): string {
    const body = did.replace(DID_PREFIX, '');
    if (body.length <= maxLen) return did;
    return `${DID_PREFIX}${body.slice(0, 10)}…${body.slice(-6)}`;
  },

  /**
   * Returns true if the string is a structurally valid DID.
   * This is a lightweight format check — not a resolution check.
   */
  isValid(did: string): boolean {
    return /^did:[a-z]+:[A-Za-z0-9._-]{8,}$/.test(did);
  },

  /**
   * Generates a deterministic mock DID from a seed string.
   * Used in dev/preview mode only — production derives from hardware key.
   */
  generateMockDid(seed: string = Date.now().toString()): string {
    // Simple pseudo-random base58-like string from the seed
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let hash    = 5381;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
      hash = hash & hash; // coerce to 32-bit int
    }
    let result = '';
    let n = Math.abs(hash);
    for (let i = 0; i < 22; i++) {
      result += chars[n % chars.length];
      n = Math.floor(n / chars.length) + seed.charCodeAt(i % seed.length);
    }
    return `${DID_PREFIX}${result}`;
  },

  /**
   * Returns the DID method for this app (e.g. "sov").
   */
  get method(): string {
    return DID_METHOD;
  },

  /**
   * Extracts the method-specific identifier from a full DID.
   * "did:sov:ABC123" → "ABC123"
   */
  extractIdentifier(did: string): string {
    const parts = did.split(':');
    return parts.length >= 3 ? parts.slice(2).join(':') : did;
  },

  /**
   * Returns a partial redacted view of the DID for secure display.
   * "did:sov:7Tq3k…P2Yz"
   */
  redact(did: string): string {
    const id = this.extractIdentifier(did);
    if (id.length <= 10) return did;
    return `${DID_PREFIX}${id.slice(0, 5)}…${id.slice(-4)}`;
  },

  /**
   * Computes a fingerprint string from the identity for display.
   * Real implementation would derive from the public key bytes.
   */
  computeDisplayFingerprint(identity: Identity): string {
    return identity.hardwareKey.fingerprint;
  },
};