/**
 * App Constants
 *
 * Central file for magic-number-free references.
 * Import specific constants as needed — do not barrel-import everything.
 */

// ─── App identity ─────────────────────────────────────────────────────────────

export const APP_NAME        = 'Sovereign Trust Passport';
export const APP_SHORT_NAME  = 'Sovereign';
export const APP_VERSION     = '1.0.0';
export const APP_BUILD       = 1;

// ─── DID ─────────────────────────────────────────────────────────────────────

export const DID_METHOD      = 'sov';       // did:sov:…
export const DID_PREFIX      = `did:${DID_METHOD}:`;
export const DID_DISPLAY_LEN = 20;          // chars shown before truncation

// ─── Trust score ──────────────────────────────────────────────────────────────

export const TRUST_SCORE_MAX     = 100;
export const TRUST_SCORE_HIGH    = 80;      // ≥ 80 → "Strong"
export const TRUST_SCORE_MEDIUM  = 50;      // ≥ 50 → "Moderate"
export const TRUST_SCORE_LOW     = 20;      // ≥ 20 → "Weak"
//                                           // < 20 → "Critical"

export const trustScoreLabel = (score: number): string => {
  if (score >= TRUST_SCORE_HIGH)   return 'Strong';
  if (score >= TRUST_SCORE_MEDIUM) return 'Moderate';
  if (score >= TRUST_SCORE_LOW)    return 'Weak';
  return 'Critical';
};

// ─── Credential ───────────────────────────────────────────────────────────────

export const CREDENTIAL_EXPIRY_WARN_DAYS = 30;  // warn when < 30 days left

export const isNearExpiry = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return ms > 0 && ms < CREDENTIAL_EXPIRY_WARN_DAYS * 86_400_000;
};

// ─── UI ───────────────────────────────────────────────────────────────────────

export const TAB_BAR_HEIGHT        = 80;
export const SAFE_AREA_TOP_IOS     = 60;
export const SAFE_AREA_TOP_ANDROID = 40;
export const QR_SIZE               = 200;
export const CARD_ASPECT_RATIO     = 1.586;    // ISO/IEC 7810 ID-1 card ratio

// ─── Verification ─────────────────────────────────────────────────────────────

/** Minimum ms to show each verification step (even if it completes faster) */
export const VERIFICATION_STEP_MIN_MS = 500;

export const VERIFICATION_STEPS = [
  'Scanning QR code',
  'Parsing credential',
  'Checking signature',
  'Checking issuer',
  'Evaluating trust graph',
] as const;

export type VerificationStep = typeof VERIFICATION_STEPS[number];

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEY_IDENTITY   = '@sovereign/identity';
export const STORAGE_KEY_SETTINGS   = '@sovereign/settings';
export const STORAGE_KEY_ONBOARDED  = '@sovereign/onboarded';
