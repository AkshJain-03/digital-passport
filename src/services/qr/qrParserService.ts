/**
 * QR Parser Service
 *
 * Validates and classifies incoming QR scan data.
 * Returns a typed result so callers can route to the correct handler.
 */

import { qrGeneratorService, type QRPayload } from './qrGeneratorService';

export type QRScanType =
  | 'credential'
  | 'product'
  | 'handshake'
  | 'unknown';

export interface QRScanResult {
  type:     QRScanType;
  raw:      string;
  payload?: QRPayload;
  error?:   string;
}

export const qrParserService = {

  /**
   * Parses a raw scanned string and returns a typed result.
   */
  parse(raw: string): QRScanResult {
    const trimmed = raw.trim();

    // Try Sovereign Trust JSON payload
    const payload = qrGeneratorService.parseQRString(trimmed);
    if (payload) {
      const type: QRScanType =
        payload.t === 'vc'        ? 'credential' :
        payload.t === 'product'   ? 'product'    :
        payload.t === 'handshake' ? 'handshake'  :
        'unknown';
      return { type, raw: trimmed, payload };
    }

    // Plain URL with a recognisable path
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      if (trimmed.includes('/vc/') || trimmed.includes('/credential/')) {
        return { type: 'credential', raw: trimmed };
      }
      if (trimmed.includes('/product/') || trimmed.includes('/authenticity/')) {
        return { type: 'product', raw: trimmed };
      }
    }

    return { type: 'unknown', raw: trimmed, error: 'Unrecognised QR format' };
  },

  /**
   * Returns a human-readable description of the scan result type.
   */
  describe(result: QRScanResult): string {
    switch (result.type) {
      case 'credential': return 'Verifiable Credential';
      case 'product':    return 'Product Authenticity';
      case 'handshake':  return 'Login Challenge';
      default:           return 'Unknown QR Code';
    }
  },
};