/**
 * Signatures
 *
 * Thin wrapper around hardwareKey.ts that provides signing
 * and verification helpers used by the domain layer.
 *
 * SECURITY RULE:
 *   - Do NOT modify hardwareKey.ts
 *   - All signing operations must be initiated from user gestures
 *   - This file is the only place that imports hardwareKey.ts
 *
 * In production, import from the existing hardwareKey module:
 *   import { signWithHardwareKey, getPublicKey } from './hardwareKey';
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignatureResult {
  signature:  string;   // hex-encoded signature bytes
  publicKey:  string;   // hex-encoded public key
  algorithm:  string;   // e.g. "Ed25519Signature2020"
  signedAt:   string;
}

export interface VerifySignatureParams {
  payload:    string;   // the data that was signed (nonce, credential hash, etc.)
  signature:  string;
  publicKey:  string;
}

// ─── Signing ──────────────────────────────────────────────────────────────────

/**
 * Signs an arbitrary payload with the hardware-backed key.
 * Must only be called from an explicit user interaction.
 *
 * In production:
 *   const { signature } = await signWithHardwareKey(payload);
 */
export const signPayload = async (payload: string): Promise<SignatureResult> => {
  // Production: replace with signWithHardwareKey(payload) from ./hardwareKey
  return {
    signature: 'PLACEHOLDER_SIG_' + payload.slice(0, 8),
    publicKey: 'PLACEHOLDER_PUBKEY',
    algorithm: 'Ed25519Signature2020',
    signedAt:  new Date().toISOString(),
  };
};

/**
 * Signs a challenge nonce for a handshake session.
 * Called only from useHandshakeFlow after explicit user biometric approval.
 */
export const signChallenge = async (nonce: string): Promise<SignatureResult> => {
  return signPayload(nonce);
};

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Verifies a signature against a public key and payload.
 * Used by the verifier service — does not require hardware access.
 */
export const verifySignature = async (
  params: VerifySignatureParams,
): Promise<boolean> => {
  // Production: use Web Crypto or a native crypto module
  // const isValid = await crypto.subtle.verify(...)
  if (!params.signature || !params.publicKey || !params.payload) return false;
  // Placeholder: accept any non-empty signature in dev mode
  return params.signature.length > 8;
};

/**
 * Returns the current public key from the hardware enclave.
 * Safe to call without biometrics — reads the public key only.
 */
export const getPublicKey = async (): Promise<string> => {
  // Production: return getPublicKey() from ./hardwareKey
  return 'PLACEHOLDER_PUBKEY';
};