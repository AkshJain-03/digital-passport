/**
 * Formatters
 *
 * Pure utility functions for display formatting.
 * No side effects, no imports from app logic.
 */

// ─── Date ─────────────────────────────────────────────────────────────────────

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const formatRelative = (iso: string): string => {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs  / 60_000);
  const diffH   = Math.floor(diffMs  / 3_600_000);
  const diffD   = Math.floor(diffMs  / 86_400_000);

  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH   < 24) return `${diffH}h ago`;
  if (diffD   < 7)  return `${diffD}d ago`;
  return formatDate(iso);
};

// ─── DID ─────────────────────────────────────────────────────────────────────

export const abbreviateDid = (did: string, prefixLen = 12, suffixLen = 6): string => {
  const parts = did.split(':');
  if (parts.length < 3) return did;
  const method = `did:${parts[1]}:`;
  const id     = parts.slice(2).join(':');
  if (id.length <= prefixLen + suffixLen + 3) return did;
  return `${method}${id.slice(0, prefixLen)}…${id.slice(-suffixLen)}`;
};

// ─── Hash / proof ─────────────────────────────────────────────────────────────

export const abbreviateHash = (hash: string, len = 16): string =>
  hash.length > len ? hash.slice(0, len) + '…' : hash;

// ─── Numbers ─────────────────────────────────────────────────────────────────

export const formatScore = (score: number): string =>
  Math.round(score).toString();

export const formatPercent = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// ─── Strings ─────────────────────────────────────────────────────────────────

export const capitalise = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const truncate = (s: string, max: number): string =>
  s.length > max ? s.slice(0, max - 1) + '…' : s;