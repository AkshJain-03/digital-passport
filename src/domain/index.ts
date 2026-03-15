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
  CheckOutcome,
  ScanTypeMeta,
}                              from './verification/verificationTypes';

// ─── Truth domain ─────────────────────────────────────────────────────────────
export { authorTrustResolver }  from './truth/authorTrustResolver';
export type {
  AuthorTrustTier,
  AuthorTrustProfile,
  FraudSignal,
  FraudAnalysis,
  FraudSeverity,
  FraudSignalId,
  ClaimStatus,
  Claim,
}                               from './truth/truthTypes';
export { FRAUD_SIGNAL_META, SEVERITY_COLOR } from './truth/truthTypes';

// ─── Trust Graph domain ───────────────────────────────────────────────────────
export { trustGraphEngine }     from './trustGraph/trustGraphEngine';
export { trustScore }           from './trustGraph/trustScore';
export { makeNode, NODE_TYPE_META } from './trustGraph/trustNode';
export { makeEdge, EDGE_TYPE_META } from './trustGraph/trustEdge';
export type { TrustGraph }      from './trustGraph/trustGraphEngine';
export type { TrustNode, TrustNodeType } from './trustGraph/trustNode';
export type { TrustEdge, TrustEdgeType } from './trustGraph/trustEdge';
export type { TrustScoreResult } from './trustGraph/trustScore';
