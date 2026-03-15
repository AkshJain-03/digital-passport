/**
 * Custody Service
 *
 * Helpers for reading and building product chain-of-custody records.
 */

import type { CustodyCheckpoint, Product } from '../../models/product';
import { productRepository }               from '../../database/repositories/productRepository';

export const custodyService = {

  /**
   * Returns the full custody chain for a product, sorted oldest-first.
   */
  getChain(product: Product): CustodyCheckpoint[] {
    return [...product.custodyChain].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  },

  /**
   * Returns the most recent custody checkpoint.
   */
  getLatestCheckpoint(product: Product): CustodyCheckpoint | null {
    const sorted = this.getChain(product);
    return sorted[sorted.length - 1] ?? null;
  },

  /**
   * Adds a new checkpoint and persists the updated product.
   * In production, this would require a signed transaction from the actor's DID.
   */
  async addCheckpoint(
    product:    Product,
    checkpoint: Omit<CustodyCheckpoint, 'id'>,
  ): Promise<Product> {
    const newCheckpoint: CustodyCheckpoint = {
      ...checkpoint,
      id: `cp-${Date.now()}`,
    };
    const updatedProduct: Product = {
      ...product,
      custodyChain: [...product.custodyChain, newCheckpoint],
      updatedAt:    new Date().toISOString(),
    };
    await productRepository.updateTrustState(
      updatedProduct.id,
      updatedProduct.trustState,
      updatedProduct.status,
    );
    return updatedProduct;
  },
};