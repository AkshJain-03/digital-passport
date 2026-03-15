/**
 * useProductVerification
 *
 * Manages product authenticity verification state:
 *   - Lookup by ID or serial number
 *   - Run verification via verificationEngine
 *   - Provide loading / result / error state to the UI
 */

import { useCallback, useState } from 'react';
import { verificationEngine }    from '../domain/verification/verificationEngine';
import { productRepository }     from '../database/repositories/productRepository';
import { MOCK_PRODUCTS }         from '../constants/productCatalog';
import type { Product }          from '../models/product';
import type { VerificationResult } from '../domain/verification/verificationTypes';

interface ProductVerificationState {
  product:    Product | null;
  result:     VerificationResult | null;
  isLoading:  boolean;
  error:      string | null;
  verify:     (idOrSerial: string) => Promise<void>;
  reset:      () => void;
}

export const useProductVerification = (): ProductVerificationState => {
  const [product,   setProduct]   = useState<Product | null>(null);
  const [result,    setResult]    = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const verify = useCallback(async (idOrSerial: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProduct(null);

    try {
      // Try DB first, then fall back to mock catalog
      let found = await productRepository.findById(idOrSerial);
      if (!found) {
        found = MOCK_PRODUCTS.find(
          p => p.id === idOrSerial || p.serialNumber === idOrSerial,
        ) ?? null;
      }

      if (!found) {
        setError(`No product found with ID or serial: ${idOrSerial}`);
        return;
      }

      setProduct(found);

      // If not in DB, insert it for subsequent lookups
      try {
        await productRepository.insert(found);
      } catch {
        // Already exists — ignore
      }

      const verificationResult = await verificationEngine.verify('product', found.id);
      setResult(verificationResult);
    } catch (e) {
      setError((e as Error).message ?? 'Product verification failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProduct(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { product, result, isLoading, error, verify, reset };
};
