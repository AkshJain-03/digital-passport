/**
 * Trust Edge
 *
 * A directed relationship between two trust nodes.
 * Edges carry the type of trust relationship and its strength.
 */

// ─── Edge types ───────────────────────────────────────────────────────────────

export type TrustEdgeType =
  | 'issues'      // Issuer → Credential
  | 'holds'       // Holder ← Credential
  | 'verifies'    // Verifier checks Credential
  | 'delegates'   // Institution delegates authority to Issuer
  | 'anchors'     // Product ↔ DID anchor
  | 'trusts';     // Institutional trust relationship

export type TrustEdgeStrength = 'strong' | 'moderate' | 'weak';

// ─── Edge interface ───────────────────────────────────────────────────────────

export interface TrustEdge {
  id:       string;
  fromId:   string;
  toId:     string;
  edgeType: TrustEdgeType;
  strength: TrustEdgeStrength;
  label?:   string;
}

// ─── Edge metadata ────────────────────────────────────────────────────────────

export const EDGE_TYPE_META: Record<TrustEdgeType, { verb: string; color: string }> = {
  issues:    { verb: 'Issues',    color: '#0A84FF' },
  holds:     { verb: 'Holds',     color: '#00FF88' },
  verifies:  { verb: 'Verifies',  color: '#7B61FF' },
  delegates: { verb: 'Delegates', color: '#FF8C00' },
  anchors:   { verb: 'Anchors',   color: '#FFD60A' },
  trusts:    { verb: 'Trusts',    color: '#00D4FF' },
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export const makeEdge = (
  id:       string,
  fromId:   string,
  toId:     string,
  edgeType: TrustEdgeType,
  strength: TrustEdgeStrength = 'strong',
  label?:   string,
): TrustEdge => ({ id, fromId, toId, edgeType, strength, label });
