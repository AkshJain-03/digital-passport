/**
 * Author Trust Resolver
 *
 * Resolves the trust tier and profile for a post author.
 * Checks DID registry, credential validity, institution status.
 */

import { issuerDirectoryService } from '../../services/identity/issuerDirectoryService';
import type { PostAuthor }        from '../../models/post';
import type { AuthorTrustProfile, AuthorTrustTier } from './truthTypes';
import type { TrustState }        from '../../theme/colors';

export const authorTrustResolver = {

  async resolve(author: PostAuthor): Promise<AuthorTrustProfile> {
    const knownDids = await issuerDirectoryService.getKnownDidSet();
    const didKnown  = knownDids.has(author.did);

    const tier = resolveTier(author, didKnown);
    const trustState = resolveTrustState(author, didKnown);

    return {
      tier,
      trustState,
      credentialCount: 0,       // Would query credentialRepository in production
      isVerified:      author.isVerified,
      institution:     author.institution,
    };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTier(author: PostAuthor, didKnown: boolean): AuthorTrustTier {
  if (!author.isVerified && !author.institution) return 'anonymous';
  if (!author.isVerified)                         return 'unverified';
  if (didKnown && author.institution)             return 'institutional';
  return 'individual';
}

function resolveTrustState(author: PostAuthor, didKnown: boolean): TrustState {
  if (!author.isVerified)              return 'unknown';
  if (!didKnown)                       return 'suspicious';
  if (author.trustState === 'revoked') return 'revoked';
  return author.trustState;
}
