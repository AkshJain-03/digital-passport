/**
 * Credential Validator
 *
 * Pure functions — no side effects, no I/O.
 * Each function takes a credential (or parts of it) and returns
 * a validation result that can be composed into a full VerificationResult.
 */

import type { Credential }        from '../../models/credential';
import type { VerificationCheck, CheckOutcome } from '../verification/verificationTypes';

// ─── Individual checks ────────────────────────────────────────────────────────

export const checkNotRevoked = (c: Credential): VerificationCheck => ({
  id:      'not_revoked',
  label:   'Not revoked',
  outcome: c.status === 'revoked' ? 'fail' : 'pass',
  detail:  c.status === 'revoked' ? 'Credential has been revoked by the issuer.' : undefined,
});

export const checkNotExpired = (c: Credential): VerificationCheck => {
  if (!c.expiresAt) {
    return { id: 'not_expired', label: 'No expiry', outcome: 'pass' };
  }
  const expired = new Date(c.expiresAt) < new Date();
  return {
    id:      'not_expired',
    label:   'Not expired',
    outcome: expired ? 'fail' : 'pass',
    detail:  expired ? `Expired on ${c.expiresAt.slice(0, 10)}` : undefined,
  };
};

export const checkSignaturePresent = (c: Credential): VerificationCheck => ({
  id:      'signature_present',
  label:   'Signature present',
  outcome: c.proofHash && c.proofHash.length > 8 ? 'pass' : 'fail',
  detail:  c.proofHash?.slice(0, 16) + '…',
});

export const checkIssuerKnown = (
  c: Credential,
  knownDids: Set<string>,
): VerificationCheck => ({
  id:      'issuer_known',
  label:   'Issuer known',
  outcome: knownDids.has(c.issuerDid) ? 'pass' : 'warn',
  detail:  knownDids.has(c.issuerDid)
    ? undefined
    : 'Issuer not found in local directory. May still be valid.',
});

// ─── Composite validator ──────────────────────────────────────────────────────

export const validateCredential = (
  credential: Credential,
  knownIssuerDids: Set<string>,
): VerificationCheck[] => [
  checkNotRevoked(credential),
  checkNotExpired(credential),
  checkSignaturePresent(credential),
  checkIssuerKnown(credential, knownIssuerDids),
];

// ─── Trust state derivation ───────────────────────────────────────────────────

import type { TrustState } from '../../theme/colors';

export const deriveCredentialTrustState = (
  checks: { outcome: CheckOutcome }[],
): TrustState => {
  if (checks.some(c => c.outcome === 'fail'))  return 'revoked';
  if (checks.some(c => c.outcome === 'warn'))  return 'suspicious';
  return 'verified';
};
