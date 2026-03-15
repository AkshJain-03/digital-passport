export type { Credential, Issuer, CredentialWithIssuer, CredentialType, CredentialStatus } from './credential';
export type { Identity, HardwareKeyInfo, IdentityStatus }                from './identity';
export type { Product, ProductStatus, CustodyCheckpoint }                from './product';
export type { Post, PostAuthor, PostVerificationStatus }                  from './post';
export type { Handshake, HandshakeChallenge, HandshakeResponse, HandshakeStatus } from './handshake';

// Verification — re-exported from the canonical domain layer via facade
export type {
  VerificationResult,
  VerificationCheck,
  VerificationOutcome,
  VerificationRequest,
  VerificationSubjectType,
  VerificationStepStatus,
}                        from './verification';
