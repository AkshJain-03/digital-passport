/**
 * Verification Router
 *
 * Single entry point for all scan and manual verification flows.
 * Parses a raw QR payload → routes to the correct engine handler.
 */

import { qrParserService }        from '../../services/qr/qrParserService';
import { verificationEngine }     from './verificationEngine';
import type {
  VerificationRequest,
  VerificationResult,
  VerificationSubjectType,
}                                 from './verificationTypes';
import 'react-native-get-random-values';
import { v4 as uuid }             from 'uuid';

// ─── Router ───────────────────────────────────────────────────────────────────

export const verificationRouter = {

  /** Route a raw QR string to the appropriate verification handler. */
  async routeQR(rawQR: string): Promise<VerificationResult> {
    const parsed = qrParserService.parse(rawQR);

    switch (parsed.type) {
      case 'credential':
        return verificationEngine.verify(
          'credential',
          parsed.payload?.id ?? rawQR,
          rawQR,
        );

      case 'product':
        return verificationEngine.verify(
          'product',
          parsed.payload?.id ?? rawQR,
          rawQR,
        );

      case 'document':
        return verificationEngine.verify(
          'document',
          parsed.payload?.id ?? rawQR,
          rawQR,
        );

      case 'login':
        return verificationEngine.verify(
          'login',
          parsed.payload?.id ?? rawQR,
          rawQR,
        );

      case 'did':
        return verificationEngine.verify(
          'did',
          parsed.payload?.did ?? rawQR,
          rawQR,
        );

      default:
        // Unknown QR: try resolving as raw DID string
        if (/^did:[a-z]+:/.test(rawQR.trim())) {
          return verificationEngine.verify('did', rawQR.trim());
        }
        return buildUnsupportedResult(rawQR, 'credential');
    }
  },

  /** Route an explicit VerificationRequest (Verify screen manual input). */
  async route(request: VerificationRequest): Promise<VerificationResult> {
    return verificationEngine.verify(
      request.subjectType,
      request.subjectId,
      request.rawPayload,
    );
  },
};

// ─── Fallback ─────────────────────────────────────────────────────────────────

const buildUnsupportedResult = (
  subjectId:   string,
  subjectType: VerificationSubjectType,
): VerificationResult => ({
  id:          uuid(),
  subjectId,
  subjectType,
  trustState:  'unknown',
  checks: [{
    id:      'unrecognised',
    label:   'QR code format not recognised',
    outcome: 'unknown',
    detail:  'Try scanning a Sovereign Trust credential, product, or login QR.',
  }],
  summary:    'Unable to identify QR code type.',
  verifiedAt: new Date().toISOString(),
  durationMs: 0,
});
