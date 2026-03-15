/**
 * Trust Node
 *
 * A node in the trust graph — any entity that can issue, hold,
 * or verify a credential: university, student, manufacturer, product, etc.
 */

import type { TrustState } from '../../theme/colors';

// ─── Node types ───────────────────────────────────────────────────────────────

export type TrustNodeType =
  | 'issuer'        // University, government body, manufacturer
  | 'holder'        // Student, employee, product owner
  | 'verifier'      // Employer, retailer, checkpoint
  | 'credential'    // The credential itself (mid-node)
  | 'product'       // Physical product
  | 'institution'   // Regulatory or trust authority
  | 'wallet';       // Digital identity wallet

// ─── Node interface ───────────────────────────────────────────────────────────

export interface TrustNode {
  id:         string;
  label:      string;
  sublabel?:  string;
  type:       TrustNodeType;
  did?:       string;
  trustState: TrustState;
  emoji:      string;
  verified:   boolean;
}

// ─── Node display metadata ────────────────────────────────────────────────────

export const NODE_TYPE_META: Record<TrustNodeType, {
  color:       string;
  description: string;
}> = {
  issuer:      { color: '#0A84FF', description: 'Issues verifiable credentials' },
  holder:      { color: '#00FF88', description: 'Holds credentials in their wallet' },
  verifier:    { color: '#7B61FF', description: 'Verifies credentials in real-time' },
  credential:  { color: '#00D4FF', description: 'A cryptographically signed claim' },
  product:     { color: '#FFD60A', description: 'A physical product with a DID anchor' },
  institution: { color: '#FF8C00', description: 'A regulatory or trust authority' },
  wallet:      { color: '#00FF88', description: 'Hardware-secured identity wallet' },
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export const makeNode = (
  id:         string,
  label:      string,
  type:       TrustNodeType,
  emoji:      string,
  trustState: TrustState = 'trusted',
  sublabel?:  string,
): TrustNode => ({
  id, label, sublabel, type, trustState, emoji,
  verified: trustState === 'verified' || trustState === 'trusted',
});
