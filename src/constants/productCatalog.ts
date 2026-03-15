/**
 * Product Catalog
 *
 * Sample product registry for development and UI preview.
 * Production fetches from the manufacturer's verifiable registry.
 */

import type { Product } from '../models/product';

export const MOCK_PRODUCTS: Product[] = [
  {
    id:              'prod-001',
    name:            'MacBook Pro 14"',
    description:     'Apple MacBook Pro 14-inch M3 Max — Space Black',
    category:        'Electronics',
    brand:           'Apple',
    manufacturerDid: 'did:sov:Apple-Manufacturer-0xA1B2C3',
    serialNumber:    'C02XK1J5JGH5',
    batchId:         'BATCH-2024-Q1-MBP14',
    manufacturedAt:  '2024-01-10T00:00:00Z',
    status:          'authentic',
    trustState:      'verified',
    custodyChain: [
      {
        id:        'cp-001',
        location:  'Foxconn Zhengzhou, CN',
        actor:     'did:sov:Foxconn-0xF1',
        timestamp: '2024-01-10T08:00:00Z',
        note:      'Manufactured',
      },
      {
        id:        'cp-002',
        location:  'Apple Logistics Hub, SG',
        actor:     'did:sov:Apple-Logistics-0xA2',
        timestamp: '2024-01-18T12:00:00Z',
        note:      'QA passed',
      },
      {
        id:        'cp-003',
        location:  'Mumbai Retail Store, IN',
        actor:     'did:sov:Apple-Retail-IN-0xA3',
        timestamp: '2024-02-01T09:00:00Z',
        note:      'Delivered to retail',
      },
    ],
    verifiedAt: '2025-03-01T14:00:00Z',
    createdAt:  '2025-03-01T14:00:00Z',
    updatedAt:  '2025-03-01T14:00:00Z',
  },
  {
    id:              'prod-002',
    name:            'Rolex Submariner',
    description:     'Rolex Submariner Date — Ref. 126610LN',
    category:        'Luxury Watch',
    brand:           'Rolex',
    manufacturerDid: 'did:sov:Rolex-0xR1B2C3',
    serialNumber:    'RL-2024-9827364',
    batchId:         undefined,
    manufacturedAt:  '2023-06-01T00:00:00Z',
    status:          'authentic',
    trustState:      'trusted',
    custodyChain: [
      {
        id:        'cp-010',
        location:  'Rolex HQ, Geneva, CH',
        actor:     'did:sov:Rolex-0xR1B2C3',
        timestamp: '2023-06-01T00:00:00Z',
        note:      'Manufactured and certified',
      },
      {
        id:        'cp-011',
        location:  'Authorised Dealer, Mumbai, IN',
        actor:     'did:sov:Rolex-Dealer-IN-0xD1',
        timestamp: '2023-09-15T10:00:00Z',
        note:      'Transferred to authorised dealer',
      },
    ],
    verifiedAt: '2025-02-15T10:00:00Z',
    createdAt:  '2025-02-15T10:00:00Z',
    updatedAt:  '2025-02-15T10:00:00Z',
  },
];

export const findMockProductBySerial = (serial: string): Product | undefined =>
  MOCK_PRODUCTS.find(p => p.serialNumber === serial);
