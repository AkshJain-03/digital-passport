/**
 * Identity model
 *
 * Represents the user's sovereign digital identity anchored
 * to a hardware-backed key pair (Secure Enclave / StrongBox).
 */

export type IdentityStatus =
  | 'active'
  | 'pending_setup'
  | 'locked'
  | 'compromised';

export interface HardwareKeyInfo {
  /** Short fingerprint shown in the UI, e.g. "A3:4F:…:9C" */
  fingerprint:    string;
  /** Full key ID stored on device */
  keyId:          string;
  algorithm:      string;   // e.g. "EC P-256"
  attestationType:string;   // "SecureEnclave" | "StrongBox" | "Software"
  createdAt:      string;
  lastUsedAt:     string;
  isHardwareBacked: boolean;
}

export interface Identity {
  /** Decentralised Identifier */
  did:             string;

  /** Display alias chosen by the user */
  alias:           string;

  /** Hardware key bound to this DID */
  hardwareKey:     HardwareKeyInfo;

  status:          IdentityStatus;

  /** 0–100 composite trust score */
  trustScore:      number;

  /** Count of active credentials in the wallet */
  credentialCount: number;

  /** Count of trusted issuers */
  issuerCount:     number;

  createdAt:       string;
  updatedAt:       string;
}

// ─── Status display metadata ──────────────────────────────────────────────────

export const IDENTITY_STATUS_META: Record<
  IdentityStatus,
  { label: string; emoji: string; color: string }
> = {
  active:         { label: 'Active',         emoji: '✓', color: '#00FF88' },
  pending_setup:  { label: 'Setup Pending',  emoji: '◌', color: '#FFD60A' },
  locked:         { label: 'Locked',         emoji: '⊘', color: '#FF8C00' },
  compromised:    { label: 'Compromised',    emoji: '✕', color: '#FF3355' },
};
