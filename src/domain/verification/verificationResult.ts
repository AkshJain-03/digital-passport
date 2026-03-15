/**
 * Verification Result Builder
 *
 * Pure factory functions — no side effects, no I/O.
 * Build consistent VerificationResult objects from raw check arrays.
 */

import 'react-native-get-random-values';
import { v4 as uuid }          from 'uuid';
import type {
  VerificationCheck,
  VerificationResult,
  VerificationSubjectType,
  CheckOutcome,
}                              from './verificationTypes';
import type { TrustState }     from '../../theme/colors';

// ─── Trust state derivation ───────────────────────────────────────────────────

export const deriveTrustState = (checks: VerificationCheck[]): TrustState => {
  if (checks.some(c => c.outcome === 'fail'))    return 'revoked';
  if (checks.some(c => c.outcome === 'warn'))    return 'suspicious';
  if (checks.every(c => c.outcome === 'pass'))   return 'verified';
  return 'unknown';
};

// ─── Summary text ─────────────────────────────────────────────────────────────

export const buildSummary = (
  trustState:  TrustState,
  subjectType: VerificationSubjectType,
  subjectId:   string,
): string => {
  const subject = subjectType.charAt(0).toUpperCase() + subjectType.slice(1);
  switch (trustState) {
    case 'verified':   return `${subject} is valid and trusted.`;
    case 'trusted':    return `${subject} passed all checks.`;
    case 'suspicious': return `${subject} raised caution — review details.`;
    case 'revoked':    return `${subject} is revoked or invalid.`;
    case 'pending':    return `${subject} verification is pending.`;
    default:           return `Could not determine trust state for ${subject}.`;
  }
};

// ─── Result factory ───────────────────────────────────────────────────────────

export const buildVerificationResult = (params: {
  subjectId:   string;
  subjectType: VerificationSubjectType;
  checks:      VerificationCheck[];
  startMs:     number;
}): VerificationResult => {
  const trustState = deriveTrustState(params.checks);
  return {
    id:          uuid(),
    subjectId:   params.subjectId,
    subjectType: params.subjectType,
    trustState,
    checks:      params.checks,
    summary:     buildSummary(trustState, params.subjectType, params.subjectId),
    verifiedAt:  new Date().toISOString(),
    durationMs:  Date.now() - params.startMs,
  };
};

// ─── Check factories ──────────────────────────────────────────────────────────

export const makeCheck = (
  id:      string,
  label:   string,
  outcome: CheckOutcome,
  detail?: string,
): VerificationCheck => ({ id, label, outcome, detail });

export const passCheck  = (id: string, label: string, detail?: string) =>
  makeCheck(id, label, 'pass', detail);

export const failCheck  = (id: string, label: string, detail?: string) =>
  makeCheck(id, label, 'fail', detail);

export const warnCheck  = (id: string, label: string, detail?: string) =>
  makeCheck(id, label, 'warn', detail);

export const unknownCheck = (id: string, label: string, detail?: string) =>
  makeCheck(id, label, 'unknown', detail);
