/**
 * Verification Types
 *
 * Single canonical source for all verification domain types.
 * Import from here everywhere — no circular dependencies.
 */

import type { TrustState } from '../../theme/colors';

// ─── Subject types ────────────────────────────────────────────────────────────

export type VerificationSubjectType =
  | 'credential'   // Verifiable Credential (VC / JWT)
  | 'product'      // Physical product authenticity
  | 'document'     // Signed document / PDF hash
  | 'login'        // DID login challenge
  | 'post'         // Truth-feed post authorship
  | 'did';         // Raw DID resolution

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

// ─── Request ─────────────────────────────────────────────────────────────────

export interface VerificationRequest {
  subjectType: VerificationSubjectType;
  subjectId:   string;
  rawPayload?: string;
}

// ─── Step status ─────────────────────────────────────────────────────────────

export type VerificationStepStatus = 'idle' | 'active' | 'done' | 'error';

// ─── Scan type metadata ───────────────────────────────────────────────────────

export interface ScanTypeMeta {
  type:        VerificationSubjectType;
  label:       string;
  emoji:       string;
  description: string;
  accentColor: string;
  steps:       readonly string[];
}

export const SCAN_TYPE_META: Record<VerificationSubjectType, ScanTypeMeta> = {
  credential: {
    type:        'credential',
    label:       'Credential',
    emoji:       '🪪',
    description: 'Verify a digital credential or certificate',
    accentColor: '#00D4FF',
    steps: [
      'Scanning QR code',
      'Parsing credential data',
      'Verifying cryptographic signature',
      'Checking issuer registry',
      'Evaluating trust graph',
    ],
  },
  product: {
    type:        'product',
    label:       'Product',
    emoji:       '📦',
    description: 'Check product authenticity and custody chain',
    accentColor: '#FFD60A',
    steps: [
      'Scanning QR code',
      'Looking up product registry',
      'Verifying serial number',
      'Checking manufacturer DID',
      'Evaluating custody chain',
    ],
  },
  document: {
    type:        'document',
    label:       'Document',
    emoji:       '📄',
    description: 'Verify a signed document or certificate hash',
    accentColor: '#7B61FF',
    steps: [
      'Scanning QR code',
      'Extracting document hash',
      'Verifying digital signature',
      'Checking issuing authority',
      'Confirming document integrity',
    ],
  },
  login: {
    type:        'login',
    label:       'Login',
    emoji:       '🔐',
    description: 'Sign a DID login challenge with your identity',
    accentColor: '#0A84FF',
    steps: [
      'Scanning challenge QR',
      'Parsing nonce token',
      'Resolving verifier DID',
      'Preparing biometric signature',
      'Completing DID handshake',
    ],
  },
  post: {
    type:        'post',
    label:       'Post',
    emoji:       '📰',
    description: 'Check if a social post is cryptographically verified',
    accentColor: '#00FF88',
    steps: [
      'Scanning QR code',
      'Loading post data',
      'Verifying author DID',
      'Checking claim evidence',
      'Evaluating trust score',
    ],
  },
  did: {
    type:        'did',
    label:       'Identity',
    emoji:       '🔑',
    description: 'Resolve and verify a Decentralised Identifier',
    accentColor: '#FF8C00',
    steps: [
      'Scanning QR code',
      'Parsing DID string',
      'Validating DID format',
      'Resolving DID document',
      'Checking trust registry',
    ],
  },
};
