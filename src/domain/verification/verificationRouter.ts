/**
 * Verification Router
 *
 * Inspects a raw QR scan payload or an explicit VerificationRequest
 * and dispatches it to the correct verificationEngine handler.
 *
 * This is the single entry point for the Scan screen and Verify screen.
 */

import { qrParserService }         from '../../services/qr/qrParserService';
import { verificationEngine }      from './verificationEngine';
import type {
  VerificationRequest,
  VerificationResult,
  VerificationSubjectType,
}                                  from './verificationTypes';

export const verificationRouter = {

  /**
   * Route a raw QR string to the appropriate verification handler.
   * Returns a VerificationResult regardless of subject type.
   */
  async routeQR(rawQR: string): Promise<VerificationResult> {
    const parsed = qrParserService.parse(rawQR);

    switch (parsed.type) {
      case 'credential':
        return verificationEngine.verify(
          'credential',
          parsed.payload?.id ?? rawQR,
        );

      case 'product':
        return verificationEngine.verify(
          'product',
          parsed.payload?.id ?? rawQR,
        );

      case 'handshake':
        // Handshake QRs are handled separately by useHandshakeFlow
        return buildUnsupportedResult(rawQR, 'document');

      default:
        return buildUnsupportedResult(rawQR, 'document');
    }
  },

  /**
   * Route an explicit VerificationRequest.
   * Used by the Verify screen's manual input tab.
   */
  async route(request: VerificationRequest): Promise<VerificationResult> {
    return verificationEngine.verify(request.subjectType, request.subjectId);
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

const buildUnsupportedResult = (
  subjectId:   string,
  subjectType: VerificationSubjectType,
): VerificationResult => ({
  id:          uuid(),
  subjectId,
  subjectType,
  trustState:  'unknown',
  checks: [{
    id:      'unsupported',
    label:   'Subject type not supported for direct verification',
    outcome: 'unknown',
  }],
  summary:    `Verification for ${subjectType} is handled separately.`,
  verifiedAt: new Date().toISOString(),
  durationMs: 0,
});