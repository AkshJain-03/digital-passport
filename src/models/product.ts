/**
 * Product model
 *
 * Represents a physical or digital product whose authenticity
 * can be verified via QR scan or manual lookup.
 */

import type { TrustState } from '../theme/colors';

export type ProductStatus = 'authentic' | 'counterfeit' | 'unverified' | 'recalled';

export interface CustodyCheckpoint {
  id:          string;
  location:    string;
  actor:       string;       // company / person DID
  timestamp:   string;
  note?:       string;
}

export interface Product {
  id:              string;
  name:            string;
  description:     string;
  category:        string;
  brand:           string;
  manufacturerDid: string;
  serialNumber:    string;
  batchId?:        string;
  manufacturedAt:  string;
  status:          ProductStatus;
  trustState:      TrustState;
  custodyChain:    CustodyCheckpoint[];
  qrPayload?:      string;   // raw scanned string
  verifiedAt?:     string;
  createdAt:       string;
  updatedAt:       string;
}