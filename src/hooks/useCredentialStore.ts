/**
 * useCredentialStore
 *
 * React hook that provides the full credential wallet state
 * to UI components. Handles loading, refresh, and error states.
 */

import { useCallback, useEffect, useState } from 'react';
import { credentialStoreService }           from '../services/credentials/credentialStoreService';
import { credentialVerificationService }    from '../services/credentials/credentialVerificationService';
import { calculateTrustScore }             from '../domain/credentials/trustScoreCalculator';
import type { CredentialWithIssuer }        from '../models/credential';
import type { VerificationResult }          from '../models/verification';

interface CredentialStoreState {
  credentials:   CredentialWithIssuer[];
  isLoading:     boolean;
  error:         string | null;
  trustScore:    number;
  verifiedCount: number;
  refresh:       () => Promise<void>;
  verify:        (id: string) => Promise<VerificationResult | null>;
  remove:        (id: string) => Promise<void>;
}

export const useCredentialStore = (): CredentialStoreState => {
  const [credentials,   setCredentials]   = useState<CredentialWithIssuer[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [trustScore,    setTrustScore]    = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await credentialStoreService.getAll();
      setCredentials(all);

      const { score, verified } = calculateTrustScore(all);
      setTrustScore(score);
      setVerifiedCount(verified);
    } catch (e) {
      setError((e as Error).message ?? 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  const verify = useCallback(
    async (id: string): Promise<VerificationResult | null> => {
      const cred = credentials.find(c => c.id === id);
      if (!cred) return null;
      try {
        const result = await credentialVerificationService.verify(cred);
        // Refresh to pick up updated trust state
        await load();
        return result;
      } catch {
        return null;
      }
    },
    [credentials, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await credentialStoreService.delete(id);
      await load();
    },
    [load],
  );

  return {
    credentials,
    isLoading,
    error,
    trustScore,
    verifiedCount,
    refresh: load,
    verify,
    remove,
  };
};