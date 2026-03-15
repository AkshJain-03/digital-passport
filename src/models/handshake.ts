/**
 * Handshake model
 *
 * Represents a passwordless login challenge-response session.
 * Flow:
 *   1. Verifier displays a QR with a challenge nonce
 *   2. User scans and signs the challenge with their hardware key
 *   3. Verifier validates the signature against the user's DID document
 */

export type HandshakeStatus =
  | 'pending'      // challenge scanned, not yet signed
  | 'signing'      // biometric prompt shown
  | 'completed'    // signed and sent
  | 'verified'     // verifier confirmed the signature
  | 'expired'      // challenge TTL exceeded
  | 'rejected';    // verifier rejected signature

export interface HandshakeChallenge {
  nonce:       string;       // random 32-byte hex
  issuedAt:    string;
  expiresAt:   string;
  verifierDid: string;
  verifierName?: string;
  scope:       string[];     // requested claims, e.g. ["name", "email"]
}

export interface HandshakeResponse {
  signature:   string;       // hex-encoded Ed25519 signature of nonce
  publicKey:   string;       // user's public key (hex)
  holderDid:   string;
  signedAt:    string;
}

export interface Handshake {
  id:          string;
  challenge:   HandshakeChallenge;
  response?:   HandshakeResponse;
  status:      HandshakeStatus;
  createdAt:   string;
  updatedAt:   string;
}