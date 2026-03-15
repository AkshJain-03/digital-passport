/**
 * Truth Domain Types
 *
 * Shared types for the Truth Feed system.
 * Covers post trust levels, claim structure, fraud signals, and author trust.
 */

import type { TrustState } from '../../theme/colors';

// ─── Author trust tier ────────────────────────────────────────────────────────

export type AuthorTrustTier =
  | 'institutional'   // Verified institution (government, university, major org)
  | 'individual'      // Verified individual with credentials
  | 'unverified'      // Account exists but no verified DID
  | 'anonymous';      // No identity anchor at all

export interface AuthorTrustProfile {
  tier:            AuthorTrustTier;
  trustState:      TrustState;
  credentialCount: number;
  isVerified:      boolean;
  institution:     string | null;
}

// ─── Claim ────────────────────────────────────────────────────────────────────

export type ClaimStatus =
  | 'verified'     // Backed by a verifiable credential
  | 'unverified'   // No backing credential
  | 'disputed'     // Contradicted by another verified source
  | 'retracted';   // Author has retracted the claim

export interface Claim {
  id:         string;
  text:       string;
  status:     ClaimStatus;
  sourceUrl?: string;
  verifiedAt?: string;
}

// ─── Fraud detection ──────────────────────────────────────────────────────────

export type FraudSignalId =
  | 'unknown_issuer'           // Issuer DID not in trusted registry
  | 'revoked_credential'       // Author's credential has been revoked
  | 'suspicious_institution'   // Institution flagged or not in directory
  | 'invalid_signature'        // Cryptographic signature verification failed
  | 'unverified_author'        // No DID verification at all
  | 'no_institution'           // Missing institutional affiliation
  | 'unverified_claims'        // Many claims with no backing
  | 'no_source'                // No source URL
  | 'synthetic_content'        // AI-generated content signals
  | 'rapid_posting'            // Unusual posting velocity (bot signal)
  | 'credential_mismatch';     // Post topic doesn't match credential scope

export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FraudSignal {
  id:          FraudSignalId;
  label:       string;
  severity:    FraudSeverity;
  detail?:     string;
  remediation?: string;   // What the reader can do to verify independently
}

export interface FraudAnalysis {
  trustState:  TrustState;
  signals:     FraudSignal[];
  riskScore:   number;       // 0–100
  analysedAt:  string;
}

// ─── Feed constants ───────────────────────────────────────────────────────────

export const FRAUD_SIGNAL_META: Record<FraudSignalId, { label: string; emoji: string; description: string }> = {
  unknown_issuer:         { label: 'Unknown Issuer',         emoji: '🔍', description: 'Issuer DID not in trusted registry' },
  revoked_credential:     { label: 'Revoked Credential',     emoji: '🚫', description: "Author's credential has been revoked" },
  suspicious_institution: { label: 'Suspicious Institution', emoji: '⚠️', description: 'Institution is flagged or unrecognised' },
  invalid_signature:      { label: 'Invalid Signature',      emoji: '✕',  description: 'Cryptographic signature could not be verified' },
  unverified_author:      { label: 'Unverified Author',      emoji: '👤', description: 'Author has no verified DID' },
  no_institution:         { label: 'No Affiliation',         emoji: '🏷', description: 'No institutional affiliation found' },
  unverified_claims:      { label: 'Unverified Claims',      emoji: '📋', description: 'Claims lack verifiable backing' },
  no_source:              { label: 'No Source',              emoji: '🔗', description: 'No source URL provided' },
  synthetic_content:      { label: 'Synthetic Content',      emoji: '🤖', description: 'Content may be AI-generated or manipulated' },
  rapid_posting:          { label: 'Unusual Activity',       emoji: '⚡', description: 'Posting velocity suggests automation' },
  credential_mismatch:    { label: 'Credential Mismatch',    emoji: '🔀', description: "Post topic doesn't match author's credentials" },
};

export const SEVERITY_COLOR: Record<FraudSeverity, string> = {
  low:      '#FFD60A',
  medium:   '#FF8C00',
  high:     '#FF3355',
  critical: '#FF0055',
};
