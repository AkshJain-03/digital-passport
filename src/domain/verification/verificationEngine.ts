/**
 * Verification Engine
 *
 * The single source of truth for ALL verification logic.
 * Accepts a subject type + id, loads the entity, runs applicable
 * checks, and returns a VerificationResult.
 *
 * Design principles:
 *   - Pure domain logic only (no UI, no navigation)
 *   - Each check function returns a VerificationCheck — composable
 *   - All async I/O is through repository/service abstractions
 *   - Caller receives a complete result in one await
 */

import { credentialRepository }  from '../../database/repositories/credentialRepository';
import { productRepository }     from '../../database/repositories/productRepository';
import { issuerDirectoryService } from '../../services/identity/issuerDirectoryService';
import {
  validateCredential,
}                                from '../credentials/credentialValidator';
import {
  buildVerificationResult,
  passCheck,
  failCheck,
  warnCheck,
  unknownCheck,
}                                from './verificationResult';
import type {
  VerificationResult,
  VerificationSubjectType,
}                                from './verificationTypes';

// ─── Engine ───────────────────────────────────────────────────────────────────

export const verificationEngine = {

  /**
   * Verifies any subject type by ID.
   * Returns a complete VerificationResult with checks and trust state.
   */
  async verify(
    subjectType: VerificationSubjectType,
    subjectId:   string,
  ): Promise<VerificationResult> {
    const startMs = Date.now();

    switch (subjectType) {
      case 'credential': return this._verifyCredential(subjectId, startMs);
      case 'product':    return this._verifyProduct(subjectId, startMs);
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

  // ── Credential ────────────────────────────────────────────────────────────

  async _verifyCredential(id: string, startMs: number): Promise<VerificationResult> {
    const credential = await credentialRepository.findById(id);

    if (!credential) {
      return buildVerificationResult({
        subjectId:   id,
        subjectType: 'credential',
        checks: [failCheck('not_found', 'Credential not found', 'Check the ID and try again.')],
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

    // Persist updated trust state
    await credentialRepository.updateTrustState(
      id,
      result.trustState,
      result.trustState === 'verified',
    );

    return result;
  },

  // ── Product ───────────────────────────────────────────────────────────────

  async _verifyProduct(id: string, startMs: number): Promise<VerificationResult> {
    const product = await productRepository.findById(id);

    if (!product) {
      return buildVerificationResult({
        subjectId:   id,
        subjectType: 'product',
        checks: [failCheck('not_found', 'Product not found in registry')],
        startMs,
      });
    }

    const knownDids   = await issuerDirectoryService.getKnownDidSet();
    const mfgKnown    = knownDids.has(product.manufacturerDid);
    const hasSerial   = !!product.serialNumber;
    const hasCustody  = product.custodyChain.length > 0;
    const isRecalled  = product.status === 'recalled';

    const checks = [
      hasSerial
        ? passCheck('serial', 'Serial number present', product.serialNumber)
        : failCheck('serial', 'No serial number'),

      mfgKnown
        ? passCheck('manufacturer', 'Manufacturer verified', product.brand)
        : warnCheck('manufacturer', 'Manufacturer not in directory', 'May still be authentic'),

      hasCustody
        ? passCheck('custody', `${product.custodyChain.length} custody checkpoint(s) recorded`)
        : warnCheck('custody', 'No custody chain available'),

      isRecalled
        ? failCheck('recall', 'Product has been recalled', `Status: ${product.status}`)
        : passCheck('recall', 'No recall on record'),
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

  // ── DID ───────────────────────────────────────────────────────────────────

  async _verifyDid(did: string, startMs: number): Promise<VerificationResult> {
    const issuer = await issuerDirectoryService.findByDid(did);
    const isValid = /^did:[a-z]+:[A-Za-z0-9._-]{8,}$/.test(did);

    const checks = [
      isValid
        ? passCheck('format', 'DID format valid')
        : failCheck('format', 'Invalid DID format'),

      issuer
        ? passCheck('known', 'DID found in trusted directory', issuer.name)
        : warnCheck('known', 'DID not in local directory'),

      issuer?.isVerified
        ? passCheck('verified', 'Issuer is verified')
        : warnCheck('verified', issuer ? 'Issuer not verified' : 'Cannot verify unknown DID'),
    ];

    return buildVerificationResult({
      subjectId:   did,
      subjectType: 'did',
      checks,
      startMs,
    });
  },
};