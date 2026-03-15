/**
 * Product Repository
 */

import { getDb }         from '../sqlite/db';
import type { Product, ProductStatus } from '../../models/product';
import type { TrustState }             from '../../theme/colors';

const rowToProduct = (row: any): Product => ({
  id:              row.id,
  name:            row.name,
  description:     row.description,
  category:        row.category,
  brand:           row.brand,
  manufacturerDid: row.manufacturer_did,
  serialNumber:    row.serial_number,
  batchId:         row.batch_id ?? undefined,
  manufacturedAt:  row.manufactured_at,
  status:          row.status          as ProductStatus,
  trustState:      row.trust_state     as TrustState,
  custodyChain:    JSON.parse(row.custody_chain ?? '[]'),
  qrPayload:       row.qr_payload      ?? undefined,
  verifiedAt:      row.verified_at     ?? undefined,
  createdAt:       row.created_at,
  updatedAt:       row.updated_at,
});

export const productRepository = {

  async findAll(): Promise<Product[]> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM products ORDER BY created_at DESC',
    );
    const products: Product[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      products.push(rowToProduct(result.rows.item(i)));
    }
    return products;
  },

  async findById(id: string): Promise<Product | null> {
    const db = await getDb();
    const [result] = await db.executeSql(
      'SELECT * FROM products WHERE id = ?', [id],
    );
    if (result.rows.length === 0) return null;
    return rowToProduct(result.rows.item(0));
  },

  async insert(p: Product): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `INSERT INTO products
        (id, name, description, category, brand, manufacturer_did,
         serial_number, batch_id, manufactured_at, status, trust_state,
         custody_chain, qr_payload, verified_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.id, p.name, p.description, p.category, p.brand,
        p.manufacturerDid, p.serialNumber, p.batchId ?? null,
        p.manufacturedAt, p.status, p.trustState,
        JSON.stringify(p.custodyChain),
        p.qrPayload ?? null, p.verifiedAt ?? null,
        p.createdAt, p.updatedAt,
      ],
    );
  },

  async updateTrustState(id: string, trustState: TrustState, status: ProductStatus): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `UPDATE products SET trust_state = ?, status = ?,
       verified_at = ?, updated_at = ? WHERE id = ?`,
      [trustState, status, new Date().toISOString(), new Date().toISOString(), id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.executeSql('DELETE FROM products WHERE id = ?', [id]);
  },
};