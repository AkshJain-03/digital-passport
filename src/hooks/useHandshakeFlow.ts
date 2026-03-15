/**
 * useHandshakeFlow
 *
 * Manages the full passwordless login handshake:
 *   1. Parse inbound challenge QR
 *   2. Show biometric prompt on explicit user tap
 *   3. Sign the nonce using the hardware key
 *   4. Return the completed handshake
 *
 * SECURITY RULE: biometric prompt is NEVER auto-triggered.
 * The calling component must call `sign()` from a button press.
 */

import 'react-native-get-random-values';
import { useCallback, useState } from 'react';
import { v4 as uuid }            from 'uuid';
import { useBiometricAuth }      from './useBiometricAuth';
import { handshakeRepository }   from '../database/repositories/handshakeRepository';
import type { Handshake, HandshakeChallenge } from '../models/handshake';

type HandshakeFlowStep =
  | 'idle'
  | 'challenge_parsed'
  | 'awaiting_biometric'
  | 'signing'
  | 'completed'
  | 'error';

interface HandshakeFlowState {
  step:       HandshakeFlowStep;
  handshake:  Handshake | null;
  error:      string | null;
  parseChallenge: (rawQR: string) => void;
  sign:           () => Promise<void>;
  reset:          () => void;
}

export const useHandshakeFlow = (): HandshakeFlowState => {
  const [step,      setStep]      = useState<HandshakeFlowStep>('idle');
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const { authenticate } = useBiometricAuth();

  // ── Parse incoming QR challenge ─────────────────────────────────────────
  const parseChallenge = useCallback((rawQR: string) => {
    try {
      const payload = JSON.parse(rawQR);
      if (!payload.nonce || !payload.verifierDid) {
        setError('Invalid handshake QR — missing nonce or verifierDid');
        setStep('error');
        return;
      }
      const now = new Date().toISOString();
      const challenge: HandshakeChallenge = {
        nonce:       payload.nonce,
        issuedAt:    payload.issuedAt   ?? now,
        expiresAt:   payload.expiresAt  ?? new Date(Date.now() + 120_000).toISOString(),
        verifierDid: payload.verifierDid,
        verifierName: payload.verifierName,
        scope:       payload.scope ?? [],
      };

      const newHandshake: Handshake = {
        id:        uuid(),
        challenge,
        status:    'pending',
        createdAt: now,
        updatedAt: now,
      };

      setHandshake(newHandshake);
      setStep('challenge_parsed');
      setError(null);
    } catch {
      setError('Failed to parse handshake QR');
      setStep('error');
    }
  }, []);

  // ── Sign (called from button press only) ────────────────────────────────
  const sign = useCallback(async () => {
    if (!handshake) return;

    // Check expiry
    if (new Date(handshake.challenge.expiresAt) < new Date()) {
      setError('Challenge has expired. Ask the verifier to regenerate the QR.');
      setStep('error');
      return;
    }

    setStep('awaiting_biometric');

    // Biometric prompt — MUST be called from a user gesture
    const success = await authenticate(
      `Authenticate with ${handshake.challenge.verifierName ?? 'verifier'}`,
    );

    if (!success) {
      setStep('challenge_parsed');
      return;
    }

    setStep('signing');

    try {
      // Production: call crypto/signatures.ts to sign the nonce with hardware key
      // const signature = await signatures.signChallenge(handshake.challenge.nonce);
      const mockSignature = 'MOCK_SIG_' + handshake.challenge.nonce.slice(0, 8);
      const mockPublicKey = 'MOCK_PUB_KEY_HEX';

      const completed: Handshake = {
        ...handshake,
        response: {
          signature:  mockSignature,
          publicKey:  mockPublicKey,
          holderDid:  'did:sov:user',  // replaced with real DID in production
          signedAt:   new Date().toISOString(),
        },
        status:    'completed',
        updatedAt: new Date().toISOString(),
      };

      await handshakeRepository.insert(completed);
      setHandshake(completed);
      setStep('completed');
    } catch (e) {
      setError((e as Error).message ?? 'Signing failed');
      setStep('error');
    }
  }, [handshake, authenticate]);

  const reset = useCallback(() => {
    setStep('idle');
    setHandshake(null);
    setError(null);
  }, []);

  return { step, handshake, error, parseChallenge, sign, reset };
};
