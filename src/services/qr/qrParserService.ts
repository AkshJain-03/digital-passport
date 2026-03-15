/**
 * QR Parser Service
 *
 * Classifies any incoming QR scan string into a typed result
 * so the verification router can dispatch correctly.
 */

import { qrGeneratorService, type QRPayload } from './qrGeneratorService';

export type QRScanType =
  | 'credential'
  | 'product'
  | 'document'
  | 'login'
  | 'did'
  | 'unknown';

export interface QRScanResult {
  type:     QRScanType;
  raw:      string;
  payload?: QRPayload;
  error?:   string;
}

export const qrParserService = {

  /** Parse a raw scanned string → typed QRScanResult */
  parse(raw: string): QRScanResult {
    const trimmed = raw.trim();

    // ── 1. Sovereign Trust compact JSON ──────────────────────────────────────
    const payload = qrGeneratorService.parseQRString(trimmed);
    if (payload) {
      const type: QRScanType =
        payload.t === 'vc'        ? 'credential' :
        payload.t === 'product'   ? 'product'    :
        payload.t === 'handshake' ? 'login'      :
        payload.t === 'document'  ? 'document'   :
        'unknown';
      return { type, raw: trimmed, payload };
    }

    // ── 2. Raw DID string ─────────────────────────────────────────────────────
    if (/^did:[a-z]+:[A-Za-z0-9._-]{8,}$/.test(trimmed)) {
      return { type: 'did', raw: trimmed };
    }

    // ── 3. Login challenge JWT / nonce ────────────────────────────────────────
    if (trimmed.startsWith('login:') || trimmed.startsWith('challenge:')) {
      return { type: 'login', raw: trimmed };
    }
    // Detect login challenge JSON (has "nonce" field)
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (parsed.nonce) return { type: 'login',    raw: trimmed };
      if (parsed.hash && parsed.iss) return { type: 'document', raw: trimmed };
    } catch { /* not JSON */ }

    // ── 4. URL-based routing ──────────────────────────────────────────────────
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      if (trimmed.includes('/vc/')         || trimmed.includes('/credential/'))    return { type: 'credential', raw: trimmed };
      if (trimmed.includes('/product/')    || trimmed.includes('/authenticity/'))  return { type: 'product',    raw: trimmed };
      if (trimmed.includes('/doc/')        || trimmed.includes('/document/'))      return { type: 'document',   raw: trimmed };
      if (trimmed.includes('/login/')      || trimmed.includes('/challenge/'))     return { type: 'login',      raw: trimmed };
    }

    return { type: 'unknown', raw: trimmed, error: 'Unrecognised QR format' };
  },

  /** Human-readable description of a scan result type */
  describe(result: QRScanResult): string {
    switch (result.type) {
      case 'credential': return 'Verifiable Credential';
      case 'product':    return 'Product Authenticity';
      case 'document':   return 'Signed Document';
      case 'login':      return 'Login Challenge';
      case 'did':        return 'Decentralised Identity';
      default:           return 'Unknown QR Code';
    }
  },
};
