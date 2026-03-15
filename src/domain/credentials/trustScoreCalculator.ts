/**
 * Trust Score Calculator
 *
 * Computes a 0–100 composite trust score from the user's credential wallet.
 * Higher weight given to identity + government credentials.
 */

import type { Credential } from '../../models/credential';

interface TrustScoreBreakdown {
  score:      number;    // 0–100
  verified:   number;    // count of verified creds
  total:      number;    // total active creds
  factors:    { label: string; contribution: number }[];
}

const TYPE_WEIGHT: Record<string, number> = {
  IdentityCredential:     30,
  EducationCredential:    20,
  ProfessionalCredential: 15,
  MembershipCredential:   10,
  ProductCredential:       8,
  DocumentCredential:      8,
  CustomCredential:        5,
};

const TRUST_STATE_MULTIPLIER: Record<string, number> = {
  verified:   1.0,
  trusted:    0.9,
  pending:    0.4,
  suspicious: 0.1,
  revoked:    0.0,
  unknown:    0.2,
};

export const calculateTrustScore = (
  credentials: Credential[],
): TrustScoreBreakdown => {
  const active = credentials.filter(c => c.status === 'active');
  if (active.length === 0) {
    return { score: 0, verified: 0, total: 0, factors: [] };
  }

  let totalWeight    = 0;
  let weightedScore  = 0;
  const factors: { label: string; contribution: number }[] = [];

  for (const cred of active) {
    const weight     = TYPE_WEIGHT[cred.type] ?? 5;
    const multiplier = TRUST_STATE_MULTIPLIER[cred.trustState] ?? 0;
    const contribution = weight * multiplier;

    totalWeight   += weight;
    weightedScore += contribution;

    if (contribution > 0) {
      factors.push({
        label:        cred.title,
        contribution: Math.round((contribution / weight) * 100),
      });
    }
  }

  const rawScore   = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  const finalScore = Math.min(100, Math.round(rawScore));
  const verified   = active.filter(c => c.isVerified).length;

  return { score: finalScore, verified, total: active.length, factors };
};