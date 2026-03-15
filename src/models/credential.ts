/**
 * Credential model
 *
 * Represents a W3C Verifiable Credential stored in the wallet.
 * Fields are intentionally flat for SQLite storage compatibility.
 */

import type { TrustState } from '../theme/colors';

// ─── Credential types ─────────────────────────────────────────────────────────

export type CredentialType =
  | 'EducationCredential'
  | 'IdentityCredential'
  | 'ProfessionalCredential'
  | 'MembershipCredential'
  | 'ProductCredential'
  | 'DocumentCredential'
  | 'CustomCredential';

export type CredentialStatus =
  | 'active'
  | 'revoked'
  | 'expired'
  | 'suspended'
  | 'pending';

// ─── Credential ───────────────────────────────────────────────────────────────

export interface Credential {
  id:          string;       // UUID
  type:        CredentialType;
  title:       string;       // Human-readable name, e.g. "B.Tech Degree"
  description: string;

  // Identity
  subjectDid:  string;       // Holder DID
  issuerDid:   string;       // Issuer DID
  issuerId:    string;       // FK → Issuer.id

  // Validity window
  issuedAt:    string;       // ISO 8601
  expiresAt:   string | null;

  // Trust
  status:      CredentialStatus;
  trustState:  TrustState;

  // Cryptography
  signatureAlgorithm: string;  // e.g. "Ed25519Signature2020"
  proofHash:   string;         // hex-encoded proof hash (display truncated)
  isVerified:  boolean;

  // Storage
  rawJwt:      string | null;  // original JWT / JSON-LD (may be null for manual)
  createdAt:   string;         // when wallet received it
  updatedAt:   string;
}

// ─── Issuer ───────────────────────────────────────────────────────────────────

export interface Issuer {
  id:          string;
  did:         string;
  name:        string;
  shortName:   string;
  logoEmoji:   string;       // emoji fallback when no image asset
  category:    string;       // "University" | "Government" | "Corporate" | etc.
  country:     string;
  isVerified:  boolean;
  trustState:  TrustState;
  addedAt:     string;
}

// ─── Credential + Issuer joined view ─────────────────────────────────────────

export interface CredentialWithIssuer extends Credential {
  issuer: Issuer;
}

// ─── Type display metadata ────────────────────────────────────────────────────

export interface CredentialTypeMeta {
  label:       string;
  emoji:       string;
  accentColor: string;     // hex
}

export const CREDENTIAL_TYPE_META: Record<CredentialType, CredentialTypeMeta> = {
  EducationCredential:    { label: 'Education',    emoji: '◈', accentColor: '#0A84FF' },
  IdentityCredential:     { label: 'Identity',     emoji: '◎', accentColor: '#00FF88' },
  ProfessionalCredential: { label: 'Professional', emoji: '✦', accentColor: '#7B61FF' },
  MembershipCredential:   { label: 'Membership',   emoji: '◉', accentColor: '#FFD60A' },
  ProductCredential:      { label: 'Product',      emoji: '⬡', accentColor: '#00D4FF' },
  DocumentCredential:     { label: 'Document',     emoji: '▭', accentColor: '#FF8C00' },
  CustomCredential:       { label: 'Custom',       emoji: '◌', accentColor: '#8E8E93' },
};