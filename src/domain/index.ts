// ─── Credentials domain ───────────────────────────────────────────────────────
export { validateCredential, deriveCredentialTrustState } from './credentials/credentialValidator';
export { calculateTrustScore }                            from './credentials/trustScoreCalculator';

// ─── Verification domain ──────────────────────────────────────────────────────
export { verificationEngine }  from './verification/verificationEngine';
export { verificationRouter }  from './verification/verificationRouter';
export {
  buildVerificationResult,
  deriveTrustState,
  passCheck, failCheck, warnCheck, unknownCheck,
}                              from './verification/verificationResult';

export type {
  VerificationResult,
  VerificationRequest,
  VerificationCheck,
  VerificationSubjectType,
  VerificationStepStatus,
  VerificationStep,
  CheckOutcome,
}                              from './verification/verificationTypes';