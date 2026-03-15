/**
 * Verification Types
 *
 * Shared types used across the verification domain layer.
 * Kept in a single file so verificationEngine, verificationRouter,
 * and verificationResult can all import from one place without circulars.
 */

import type { TrustState } from '../../theme/colors';

// ─── Subject types ────────────────────────────────────────────────────────────

export type VerificationSubjectType =
  | 'credential'
  | 'product'
  | 'document'
  | 'post'
  | 'did';

// ─── Check outcomes ───────────────────────────────────────────────────────────

export type CheckOutcome = 'pass' | 'fail' | 'warn' | 'unknown';

export interface VerificationCheck {
  id:       string;
  label:    string;
  outcome:  CheckOutcome;
  detail?:  string;
}

// ─── Result ───────────────────────────────────────────────────────────────────

export interface VerificationResult {
  id:          string;
  subjectId:   string;
  subjectType: VerificationSubjectType;
  trustState:  TrustState;
  checks:      VerificationCheck[];
  summary:     string;
  verifiedAt:  string;
  durationMs:  number;
}

// ─── Request (input to the router) ───────────────────────────────────────────

export interface VerificationRequest {
  subjectType: VerificationSubjectType;
  /** ID for DB lookups, or raw QR payload for on-the-fly verification */
  subjectId:   string;
  rawPayload?: string;
}

// ─── Step (for animated UI) ───────────────────────────────────────────────────

export type VerificationStepStatus = 'idle' | 'active' | 'done' | 'error';

export interface VerificationStep {
  id:     string;
  label:  string;
  status: VerificationStepStatus;
}