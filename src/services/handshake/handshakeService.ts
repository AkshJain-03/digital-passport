/**
 * Handshake Service
 *
 * Service-layer orchestration for passwordless login sessions.
 * The useHandshakeFlow hook calls this for persistence operations.
 * The hook owns all UI state; this service owns all data operations.
 */

import 'react-native-get-random-values';
import { v4 as uuid }           from 'uuid';
import { handshakeRepository }  from '../../database/repositories/handshakeRepository';
import { verifySignature }       from '../../crypto/signatures';
import { inMinutes }             from '../../utils/dateHelpers';
import type {
  Handshake,
  HandshakeChallenge,
  HandshakeResponse,
  HandshakeStatus,
}                                from '../../models/handshake';

// ─── TTL ──────────────────────────────────────────────────────────────────────

const DEFAULT_TTL_MINUTES = 2;

export const handshakeService = {

  // ── Create a new challenge (verifier side) ──────────────────────────────
  createChallenge(params: {
    verifierDid:   string;
    verifierName?: string;
    scope?:        string[];
  }): HandshakeChallenge {
    return {
      nonce:       generateNonce(),
      issuedAt:    new Date().toISOString(),
      expiresAt:   inMinutes(DEFAULT_TTL_MINUTES),
      verifierDid: params.verifierDid,
      verifierName: params.verifierName,
      scope:       params.scope ?? [],
    };
  },

  // ── Persist a new handshake session ────────────────────────────────────
  async startSession(challenge: HandshakeChallenge): Promise<Handshake> {
    const now = new Date().toISOString();
    const handshake: Handshake = {
      id:        uuid(),
      challenge,
      status:    'pending',
      createdAt: now,
      updatedAt: now,
    };
    await handshakeRepository.insert(handshake);
    return handshake;
  },

  // ── Persist a signed response ───────────────────────────────────────────
  async completeSession(
    handshakeId: string,
    response:    HandshakeResponse,
  ): Promise<void> {
    await handshakeRepository.updateStatus(
      handshakeId,
      'completed',
      JSON.stringify(response),
    );
  },

  // ── Verify a completed session (verifier side) ──────────────────────────
  async verifySession(handshakeId: string): Promise<boolean> {
    const session = await handshakeRepository.findById(handshakeId);
    if (!session?.response) return false;

    // Check not expired
    if (new Date(session.challenge.expiresAt) < new Date()) {
      await handshakeRepository.updateStatus(handshakeId, 'expired');
      return false;
    }

    const valid = await verifySignature({
      payload:   session.challenge.nonce,
      signature: session.response.signature,
      publicKey: session.response.publicKey,
    });

    const newStatus: HandshakeStatus = valid ? 'verified' : 'rejected';
    await handshakeRepository.updateStatus(handshakeId, newStatus);
    return valid;
  },

  // ── History ────────────────────────────────────────────────────────────
  async getHistory(): Promise<Handshake[]> {
    return handshakeRepository.findAll();
  },

  async pruneExpired(): Promise<void> {
    return handshakeRepository.pruneExpired();
  },
};

// ─── Nonce generator ──────────────────────────────────────────────────────────

const generateNonce = (): string => {
  // 16 random bytes → 32-char hex string
  const arr = new Uint8Array(16);
  (globalThis as any).crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};