/**
 * Product Verification Service
 *
 * Orchestrates the full product verification pipeline:
 *   1. Registry lookup
 *   2. Fraud signal analysis
 *   3. Verification engine
 *   4. Result persistence
 */

import { productRegistryService } from './productRegistryService';
import { fraudSignalService }     from '../ai/fraudSignalService';
import { verificationEngine }     from '../../domain/verification/verificationEngine';
import type { Product }           from '../../models/product';
import type { VerificationResult } from '../../domain/verification/verificationTypes';

export const productVerificationService = {

  async verify(idOrSerial: string): Promise<{
    product: Product | null;
    result:  VerificationResult;
  }> {
    // Try ID first, then serial
    let product = await productRegistryService.findById(idOrSerial)
      ?? await productRegistryService.findBySerial(idOrSerial);

    if (!product) {
      const result = await verificationEngine.verify('product', idOrSerial);
      return { product: null, result };
    }

    // Save to DB if not already there
    await productRegistryService.save(product);

    // Fraud signal pre-check
    const fraudAnalysis = fraudSignalService.analyseProduct(product);

    // Engine verification
    const result = await verificationEngine.verify('product', product.id);

    // If fraud signals are worse than engine result, use the worse state
    const finalTrustState =
      riskRank(fraudAnalysis.trustState) > riskRank(result.trustState)
        ? fraudAnalysis.trustState
        : result.trustState;

    return {
      product,
      result: { ...result, trustState: finalTrustState },
    };
  },
};

const RISK_RANK: Record<string, number> = {
  verified: 0, trusted: 1, pending: 2, unknown: 3, suspicious: 4, revoked: 5,
};
const riskRank = (s: string) => RISK_RANK[s] ?? 3;