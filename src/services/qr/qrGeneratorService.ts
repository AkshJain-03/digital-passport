/**
 * QR Generator Service
 *
 * Builds compact QR payloads for all subject types:
 *   vc        → Verifiable Credential
 *   product   → Product authenticity
 *   handshake → Login challenge
 *   document  → Signed document
 */

import type { Credential } from '../../models/credential';

export interface QRPayload {
  v:    number;
  t:    'vc' | 'product' | 'handshake' | 'document';
  id:   string;
  did:  string;
  iss:  string;
  hash: string;
  ts:   string;
  /** Optional extras per type */
  service?:   string;  // for handshake
  nonce?:     string;  // for handshake
  exp?:       number;  // for handshake (unix timestamp)
  callback?:  string;  // for handshake
  serial?:    string;  // for product
  brand?:     string;  // for product
  docType?:   string;  // for document
  title?:     string;  // for document
}

export const qrGeneratorService = {

  /** Credential QR payload */
  buildCredentialQRString(credential: Credential): string {
    const payload: QRPayload = {
      v:    1,
      t:    'vc',
      id:   credential.id,
      did:  credential.subjectDid,
      iss:  credential.issuerDid,
      hash: credential.proofHash.slice(0, 32),
      ts:   new Date().toISOString(),
    };
    return JSON.stringify(payload);
  },

  /** Login challenge QR payload */
  buildLoginChallengeQRString(params: {
    service:   string;
    issuerDid: string;
    callback:  string;
    ttlSec?:   number;
  }): string {
    const ttl = params.ttlSec ?? 300;
    const payload: QRPayload = {
      v:        1,
      t:        'handshake',
      id:       `challenge-${Date.now()}`,
      did:      '',
      iss:      params.issuerDid,
      hash:     '',
      ts:       new Date().toISOString(),
      service:  params.service,
      nonce:    Math.random().toString(36).slice(2, 18),
      exp:      Math.floor(Date.now() / 1000) + ttl,
      callback: params.callback,
    };
    return JSON.stringify(payload);
  },

  /** Document QR payload */
  buildDocumentQRString(params: {
    docId:     string;
    title:     string;
    docType:   string;
    issuerDid: string;
    hash:      string;
  }): string {
    const payload: QRPayload = {
      v:       1,
      t:       'document',
      id:      params.docId,
      did:     '',
      iss:     params.issuerDid,
      hash:    params.hash.slice(0, 32),
      ts:      new Date().toISOString(),
      docType: params.docType,
      title:   params.title,
    };
    return JSON.stringify(payload);
  },

  /** Parse a raw string back to QRPayload — returns null if not valid */
  parseQRString(raw: string): QRPayload | null {
    try {
      const obj = JSON.parse(raw) as Partial<QRPayload>;
      if (
        typeof obj.v === 'number' &&
        typeof obj.t === 'string' &&
        ['vc', 'product', 'handshake', 'document'].includes(obj.t)
      ) {
        return obj as QRPayload;
      }
      return null;
    } catch {
      return null;
    }
  },
};
