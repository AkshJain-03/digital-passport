/**
 * Trust Score
 *
 * Derives a numeric trust score (0–100) for a trust graph
 * based on node verification and edge strength.
 */

import type { TrustNode } from './trustNode';
import type { TrustEdge } from './trustEdge';
import type { TrustState } from '../../theme/colors';

// ─── Weights ──────────────────────────────────────────────────────────────────

const NODE_STATE_SCORE: Record<TrustState, number> = {
  verified:   100,
  trusted:    80,
  pending:    50,
  suspicious: 20,
  unknown:    10,
  revoked:    0,
};

const EDGE_STRENGTH_SCORE: Record<string, number> = {
  strong:   1.0,
  moderate: 0.7,
  weak:     0.4,
};

// ─── Score result ─────────────────────────────────────────────────────────────

export interface TrustScoreResult {
  score:      number;       // 0–100
  label:      string;       // 'Strong' | 'Moderate' | 'Weak' | 'Untrusted'
  trustState: TrustState;
  breakdown: {
    nodeScore: number;
    edgeScore: number;
    nodeCount: number;
    edgeCount: number;
  };
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export const trustScore = {

  calculate(nodes: TrustNode[], edges: TrustEdge[]): TrustScoreResult {
    if (nodes.length === 0) {
      return {
        score: 0, label: 'Untrusted', trustState: 'unknown',
        breakdown: { nodeScore: 0, edgeScore: 0, nodeCount: 0, edgeCount: 0 },
      };
    }

    // Average node score
    const nodeScore = nodes.reduce((sum, n) =>
      sum + (NODE_STATE_SCORE[n.trustState] ?? 0), 0) / nodes.length;

    // Average edge score (default 100 if no edges)
    const edgeScore = edges.length === 0 ? 100 :
      edges.reduce((sum, e) =>
        sum + (EDGE_STRENGTH_SCORE[e.strength] ?? 0.5) * 100, 0) / edges.length;

    const score = Math.round(nodeScore * 0.6 + edgeScore * 0.4);

    return {
      score,
      label:      scoreLabel(score),
      trustState: scoreTrustState(score),
      breakdown: {
        nodeScore: Math.round(nodeScore),
        edgeScore: Math.round(edgeScore),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
    };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Moderate';
  if (score >= 30) return 'Weak';
  return 'Untrusted';
}

function scoreTrustState(score: number): TrustState {
  if (score >= 80) return 'verified';
  if (score >= 60) return 'trusted';
  if (score >= 30) return 'suspicious';
  return 'revoked';
}
