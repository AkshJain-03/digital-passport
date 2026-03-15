/**
 * Trust Graph Engine
 *
 * Builds predefined trust graphs for the TrustEngineScreen.
 * Each graph is a self-contained set of nodes + edges representing
 * a real-world trust relationship.
 */

import { makeNode } from './trustNode';
import { makeEdge } from './trustEdge';
import { trustScore } from './trustScore';
import type { TrustNode } from './trustNode';
import type { TrustEdge } from './trustEdge';
import type { TrustScoreResult } from './trustScore';

// ─── Graph structure ──────────────────────────────────────────────────────────

export interface TrustGraph {
  id:     string;
  title:  string;
  nodes:  TrustNode[];
  edges:  TrustEdge[];
  score:  TrustScoreResult;
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export const trustGraphEngine = {

  /** University → Degree → Student */
  buildEducationGraph(): TrustGraph {
    const nodes: TrustNode[] = [
      makeNode('uni',    'University',    'issuer',     '🎓', 'verified', 'IIT Bombay'),
      makeNode('degree', 'B.Tech Degree', 'credential', '📜', 'verified', 'Computer Science'),
      makeNode('student','Student',       'holder',     '👤', 'trusted',  'Aarav Shah'),
    ];
    const edges: TrustEdge[] = [
      makeEdge('e1', 'uni',    'degree',  'issues',  'strong', 'Signs credential'),
      makeEdge('e2', 'degree', 'student', 'holds',   'strong', 'Stores in wallet'),
    ];
    return { id: 'education', title: 'Education', nodes, edges, score: trustScore.calculate(nodes, edges) };
  },

  /** Manufacturer → Product → Retailer */
  buildProductGraph(): TrustGraph {
    const nodes: TrustNode[] = [
      makeNode('mfg',      'Manufacturer', 'issuer',   '🏭', 'verified', 'Apple Inc.'),
      makeNode('product',  'MacBook Pro',  'product',  '💻', 'verified', 'Serial: SN2024MBP'),
      makeNode('retailer', 'Retailer',     'verifier', '🏪', 'trusted',  'Authorised Reseller'),
    ];
    const edges: TrustEdge[] = [
      makeEdge('e1', 'mfg',     'product',  'anchors',  'strong', 'DID-anchored serial'),
      makeEdge('e2', 'product', 'retailer', 'verifies', 'strong', 'Scans at checkout'),
    ];
    return { id: 'product', title: 'Product', nodes, edges, score: trustScore.calculate(nodes, edges) };
  },

  /** Government → ID Document → Citizen */
  buildIdentityGraph(): TrustGraph {
    const nodes: TrustNode[] = [
      makeNode('govt',    'Government', 'institution', '🏛️', 'verified', 'UIDAI'),
      makeNode('aadhaar', 'Aadhaar ID',  'credential',  '🪪', 'verified', 'Biometric-backed'),
      makeNode('citizen', 'Citizen',    'holder',      '👤', 'trusted',  'Verified identity'),
    ];
    const edges: TrustEdge[] = [
      makeEdge('e1', 'govt',    'aadhaar', 'issues',   'strong', 'Government-signed'),
      makeEdge('e2', 'aadhaar', 'citizen', 'holds',    'strong', 'Hardware wallet'),
    ];
    return { id: 'identity', title: 'Identity', nodes, edges, score: trustScore.calculate(nodes, edges) };
  },

  /** Issuer → Wallet → Verifier (full flow) */
  buildNetworkGraph(): TrustGraph {
    const nodes: TrustNode[] = [
      makeNode('issuer',   'Issuer',   'issuer',   '🏦', 'verified', 'Trusted Authority'),
      makeNode('wallet',   'Wallet',   'wallet',   '📱', 'verified', 'Sovereign Passport'),
      makeNode('verifier', 'Verifier', 'verifier', '🔍', 'trusted',  'Service Provider'),
    ];
    const edges: TrustEdge[] = [
      makeEdge('e1', 'issuer',   'wallet',   'issues',   'strong', 'Issues credential'),
      makeEdge('e2', 'wallet',   'verifier', 'verifies', 'strong', 'Presents proof'),
    ];
    return { id: 'network', title: 'Network', nodes, edges, score: trustScore.calculate(nodes, edges) };
  },

  /** Fetch all graphs */
  getAllGraphs(): TrustGraph[] {
    return [
      this.buildEducationGraph(),
      this.buildProductGraph(),
      this.buildIdentityGraph(),
      this.buildNetworkGraph(),
    ];
  },
};
