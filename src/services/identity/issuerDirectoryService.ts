/**
 * Issuer Directory Service
 *
 * Provides issuer lookup and trust resolution against the local
 * bundled directory and the SQLite-cached network directory.
 *
 * Production extension: sync with a decentralised issuer registry
 * via a background task — never block the UI on network calls.
 */

import { issuerRepository }  from '../../database/repositories/issuerRepository';
import { ISSUER_DIRECTORY }  from '../../constants/issuerDirectory';
import type { Issuer }       from '../../models/credential';
import type { TrustState }   from '../../theme/colors';

// ─── In-memory cache (populated on first call) ────────────────────────────────

let _cache: Map<string, Issuer> | null = null;

const getCache = async (): Promise<Map<string, Issuer>> => {
  if (_cache) return _cache;

  // Build from bundled static list + DB-stored issuers
  _cache = new Map<string, Issuer>();

  for (const issuer of ISSUER_DIRECTORY) {
    _cache.set(issuer.did, issuer);
  }

  try {
    const dbIssuers = await issuerRepository.findAll();
    for (const issuer of dbIssuers) {
      _cache.set(issuer.did, issuer);  // DB wins over bundled
    }
  } catch {
    // DB not yet initialised — use bundled only
  }

  return _cache;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const issuerDirectoryService = {

  /** Invalidate the in-memory cache (call after DB writes) */
  invalidateCache(): void {
    _cache = null;
  },

  async findByDid(did: string): Promise<Issuer | null> {
    const cache = await getCache();
    return cache.get(did) ?? null;
  },

  async findById(id: string): Promise<Issuer | null> {
    const cache = await getCache();
    for (const issuer of cache.values()) {
      if (issuer.id === id) return issuer;
    }
    return null;
  },

  async getAll(): Promise<Issuer[]> {
    const cache = await getCache();
    return Array.from(cache.values());
  },

  /** Returns the set of all known issuer DIDs (for fast membership checks) */
  async getKnownDidSet(): Promise<Set<string>> {
    const cache = await getCache();
    return new Set(cache.keys());
  },

  /** Resolves the trust state for a given issuer DID */
  async resolveTrustState(issuerDid: string): Promise<TrustState> {
    const issuer = await this.findByDid(issuerDid);
    if (!issuer)            return 'unknown';
    if (!issuer.isVerified) return 'pending';
    return issuer.trustState;
  },

  /** Add or update an issuer in DB and invalidate the cache */
  async upsert(issuer: Issuer): Promise<void> {
    await issuerRepository.upsert(issuer);
    this.invalidateCache();
  },
};