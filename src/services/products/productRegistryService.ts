/**
 * Product Registry Service
 *
 * Manages the local product registry:
 *   - Looks up products by ID or serial number
 *   - Caches scan results in SQLite
 *   - Falls back to mock catalog in dev mode
 */

import { productRepository }  from '../../database/repositories/productRepository';
import { MOCK_PRODUCTS }      from '../../constants/productCatalog';
import type { Product }       from '../../models/product';

export const productRegistryService = {

  async findById(id: string): Promise<Product | null> {
    const fromDb = await productRepository.findById(id);
    if (fromDb) return fromDb;
    return MOCK_PRODUCTS.find(p => p.id === id) ?? null;
  },

  async findBySerial(serial: string): Promise<Product | null> {
    const all = await productRepository.findAll();
    const fromDb = all.find(p => p.serialNumber === serial);
    if (fromDb) return fromDb;
    return MOCK_PRODUCTS.find(p => p.serialNumber === serial) ?? null;
  },

  async save(product: Product): Promise<void> {
    const existing = await productRepository.findById(product.id);
    if (!existing) await productRepository.insert(product);
  },

  async getAll(): Promise<Product[]> {
    const db = await productRepository.findAll();
    return db.length > 0 ? db : MOCK_PRODUCTS;
  },
};