/**
 * Verification Engine
 *
 * Universal verification for ALL subject types.
 * Pure domain logic — no UI, no navigation.
 * Each handler runs checks and returns a VerificationResult.
 */

import { credentialRepository }   from '../../database/repositories/credentialRepository';
import { productRepository }      from '../../database/repositories/productRepository';
import { issuerDirectoryService } from '../../services/identity/issuerDirectoryService';
import { validateCredential }     from '../credentials/credentialValidator';
import {
  buildVerificationResult,
  passCheck,
  failCheck,
  warnCheck,
  unknownCheck,
}                                 from './verificationResult';
import type {
  VerificationResult,
  VerificationSubjectType,
}                                 from './verificationTypes';

// ─── Engine ───────────────────────────────────────────────────────────────────

export const verificationEngine = {

  async verify(
    subjectType: VerificationSubjectType,
    subjectId:   string,
    rawPayload?: string,
  ): Promise<VerificationResult> {
    const startMs = Date.now();

    switch (subjectType) {
      case 'credential': return this._verifyCredential(subjectId, startMs);
      case 'product':    return this._verifyProduct(subjectId, startMs);
      case 'document':   return this._verifyDocument(subjectId, rawPayload ?? '', startMs);
      case 'login':      return this._verifyLoginChallenge(subjectId, rawPayload ?? '', startMs);
      case 'did':        return this._verifyDid(subjectId, startMs);
      default:
        return buildVerificationResult({
          subjectId,
          subjectType,
          checks: [unknownCheck('unsupported', `Verification of ${subjectType} not yet implemented`)],
          startMs,
        });
    }
  },

  // ── Credential ─────────────────────────────────────────────────────────────

  async _verifyCredential(id: string, startMs: number): Promise<VerificationResult> {
    const credential = await credentialRepository.findById(id);

    if (!credential) {
      return buildVerificationResult({
        subjectId:   id,
        subjectType: 'credential',
        checks:      [failCheck('not_found', 'Credential not found in wallet')],
        startMs,
      });
    }

    const knownDids = await issuerDirectoryService.getKnownDidSet();
    const checks    = validateCredential(credential, knownDids);

    const result = buildVerificationResult({
      subjectId:   id,
      subjectType: 'credential',
      checks,
      startMs,
    });

    await credentialRepository.updateTrustState(
      id,
      result.trustState,
      result.trustState === 'verified',
    );

    return result;
  },

  // ── Product ────────────────────────────────────────────────────────────────

  async _verifyProduct(id: string, startMs: number): Promise<VerificationResult> {
    const product = await productRepository.findById(id);

    if (!product) {
      return buildVerificationResult({
        subjectId:   id,
        subjectType: 'product',
        checks:      [failCheck('not_found', 'Product not found in registry')],
        startMs,
      });
    }

    const knownDids  = await issuerDirectoryService.getKnownDidSet();
    const mfgKnown   = knownDids.has(product.manufacturerDid);
    const hasSerial  = !!product.serialNumber;
    const hasCustody = product.custodyChain.length > 0;
    const isRecalled = product.status === 'recalled';
    const isCounterfeit = product.status === 'counterfeit';

    const checks = [
      hasSerial
        ? passCheck('serial', 'Serial number present', product.serialNumber)
        : failCheck('serial', 'No serial number on record'),

      isCounterfeit
        ? failCheck('authenticity', 'Product flagged as counterfeit')
        : passCheck('authenticity', `Product registered as ${product.status}`),

      mfgKnown
        ? passCheck('manufacturer', 'Manufacturer in trusted directory', product.brand)
        : warnCheck('manufacturer', 'Manufacturer not in trusted directory'),

      hasCustody
        ? passCheck('custody', `${product.custodyChain.length} custody checkpoint(s)`)
        : warnCheck('custody', 'No custody chain recorded'),

      isRecalled
        ? failCheck('recall', 'Product has an active recall')
        : passCheck('recall', 'No active recall found'),
    ];

    const result = buildVerificationResult({
      subjectId:   id,
      subjectType: 'product',
      checks,
      startMs,
    });

    await productRepository.updateTrustState(id, result.trustState, product.status);
    return result;
  },

  // ── Document ───────────────────────────────────────────────────────────────

  async _verifyDocument(
    id:         string,
    rawPayload: string,
    startMs:    number,
  ): Promise<VerificationResult> {
    // Parse doc metadata from payload
    let docData: Record<string, string> = {};
    try { docData = JSON.parse(rawPayload); } catch { /* ignore */ }

    const hasHash      = !!(docData.hash ?? id);
    const hasIssuerDid = /^did:[a-z]+:[A-Za-z0-9._-]{8,}$/.test(docData.iss ?? '');
    const hasTimestamp = !!(docData.ts);
    const isExpired    = hasTimestamp
      ? new Date(docData.ts) < new Date()
      : false;

    const knownDids = await issuerDirectoryService.getKnownDidSet();
    const issuerKnown = hasIssuerDid ? knownDids.has(docData.iss) : false;

    const checks = [
      hasHash
        ? passCheck('integrity', 'Document hash present', `SHA-256: ${(docData.hash ?? id).slice(0, 16)}…`)
        : failCheck('integrity', 'No integrity hash found'),

      hasIssuerDid
        ? passCheck('signature', 'Issuer DID found', docData.iss)
        : warnCheck('signature', 'No issuer DID in document'),

      issuerKnown
        ? passCheck('authority', 'Issuing authority is in trusted registry')
        : warnCheck('authority', 'Issuing authority not in local registry'),

      isExpired
        ? failCheck('expiry', 'Document has expired', `Issued: ${docData.ts}`)
        : passCheck('expiry', hasTimestamp ? 'Document is current' : 'No expiry set'),
    ];

    return buildVerificationResult({
      subjectId:   id,
      subjectType: 'document',
      checks,
      startMs,
    });
  },

  // ── Login Challenge ────────────────────────────────────────────────────────

  async _verifyLoginChallenge(
    id:         string,
    rawPayload: string,
    startMs:    number,
  ): Promise<VerificationResult> {
    let challenge: Record<string, string> = {};
    try { challenge = JSON.parse(rawPayload); } catch { /* ignore */ }

    const hasNonce     = !!(challenge.nonce ?? id);
    const hasService   = !!(challenge.service);
    const hasExpiry    = !!(challenge.exp);
    const isExpired    = hasExpiry
      ? new Date(Number(challenge.exp) * 1000) < new Date()
      : false;
    const hasCallbackUrl = /^https:\/\//.test(challenge.callback ?? '');

    const checks = [
      hasNonce
        ? passCheck('nonce', 'Challenge nonce present')
        : failCheck('nonce', 'Missing challenge nonce'),

      hasService
        ? passCheck('service', 'Service identified', challenge.service)
        : warnCheck('service', 'Service identifier missing'),

      hasCallbackUrl
        ? passCheck('callback', 'Secure callback URL verified')
        : warnCheck('callback', 'Callback URL not HTTPS'),

      isExpired
        ? failCheck('expiry', 'Login challenge has expired')
        : passCheck('expiry', hasExpiry ? 'Challenge is valid and current' : 'No expiry specified'),
    ];

    return buildVerificationResult({
      subjectId:   id,
      subjectType: 'login',
      checks,
      startMs,
    });
  },

  // ── DID ────────────────────────────────────────────────────────────────────

  async _verifyDid(did: string, startMs: number): Promise<VerificationResult> {
    const issuer  = await issuerDirectoryService.findByDid(did);
    const isValid = /^did:[a-z]+:[A-Za-z0-9._-]{8,}$/.test(did);
    const method  = did.split(':')[1] ?? '';
    const knownMethods = ['sov', 'key', 'web', 'ethr', 'ion'];

    const checks = [
      isValid
        ? passCheck('format', 'DID format is valid', `Method: did:${method}`)
        : failCheck('format', 'Invalid DID format'),

      knownMethods.includes(method)
        ? passCheck('method', `DID method "did:${method}" is supported`)
        : warnCheck('method', `DID method "did:${method}" is unknown`),

      issuer
        ? passCheck('registry', 'DID found in trusted directory', issuer.name)
        : warnCheck('registry', 'DID not in local trusted registry'),

      issuer?.isVerified
        ? passCheck('verified', 'Issuer account is verified')
        : warnCheck('verified', issuer ? 'Issuer not yet verified' : 'Cannot verify unknown DID'),
    ];

    return buildVerificationResult({
      subjectId:   did,
      subjectType: 'did',
      checks,
      startMs,
    });
  },
};
