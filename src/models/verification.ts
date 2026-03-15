/**
 * Verification model — re-export facade
 *
 * The canonical types live in domain/verification/verificationTypes.ts.
 * This file re-exports them so consumers that import from 'models/verification'
 * keep working without any import-path changes.
 *
 * `VerificationOutcome` is aliased from `CheckOutcome` for backwards compat.
 *
 * Prefer importing from the domain layer directly in new code:
 *   import type { VerificationResult } from '../domain/verification/verificationTypes';
 */

export type {
  VerificationResult,
  VerificationCheck,
  VerificationRequest,
  VerificationSubjectType,
  VerificationStepStatus,
}                        from '../domain/verification/verificationTypes';

// Alias so legacy imports of VerificationOutcome still resolve
export type { CheckOutcome as VerificationOutcome } from '../domain/verification/verificationTypes';
