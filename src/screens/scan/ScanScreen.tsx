/**
 * ScanScreen — Universal Verification Engine
 *
 * Scan types: credential | product | document | login | did
 *
 * Flow:
 *   1. ScanTypeSelector → pick what you're scanning
 *   2. Glowing viewfinder (ScanOverlay) with animated phase label
 *   3. Simulate Scan button → 5-step pipeline with connector lines
 *   4. VerificationResultCard with 3-layer progressive reveal
 *
 * Phase machine:  idle → scanning → verifying → done | error
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors }             from '../../theme/colors';
import { radius }             from '../../theme/radius';
import { GlassCard }          from '../../components/common/GlassCard';
import { AppButton }          from '../../components/common/AppButton';
import { verificationRouter } from '../../domain/verification/verificationRouter';
import {
  SCAN_TYPE_META,
  type VerificationSubjectType,
  type VerificationStepStatus,
}                             from '../../domain/verification/verificationTypes';
import type { VerificationResult } from '../../domain/verification/verificationTypes';
import type { TrustState }         from '../../theme/colors';

import { ScanOverlay }            from './components/ScanOverlay';
import { ScanTypeSelector }       from './components/ScanTypeSelector';
import { VerificationStepRow }    from './components/VerificationStepRow';
import { VerificationResultCard } from './components/VerificationResultCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2:  t.title2   ?? {},
  title3:  t.title3   ?? {},
  body:    t.bodySm   ?? t.body    ?? {},
  caption: t.captionSm ?? t.caption ?? {},
  label:   t.label    ?? {},
};

// ─── Mock QR payloads ─────────────────────────────────────────────────────────

const MOCK_QR: Record<VerificationSubjectType, string> = {
  credential: JSON.stringify({
    v: 1, t: 'vc',
    id: 'cred-sovereign-demo-001',
    did: 'did:sov:7Tq3kTmNpL8vXoAe9fP2Yz',
    iss: 'did:sov:IITB_ISSUER_DID_abc123456',
    hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    ts: new Date().toISOString(),
  }),
  product: JSON.stringify({
    v: 1, t: 'product',
    id: 'prod-macbook-pro-m3-001',
    did: '',
    iss: 'did:sov:APPLE_MFG_DID_abc123456',
    hash: 'SN2024MBP001VERIFIED',
    ts: new Date().toISOString(),
    serial: 'SN2024MBP001',
    brand: 'Apple Inc.',
  }),
  document: JSON.stringify({
    v: 1, t: 'document',
    id: 'doc-degree-iitb-2024',
    did: '',
    iss: 'did:sov:IITB_ISSUER_DID_abc123456',
    hash: 'e3b0c44298fc1c149afbf4c8996fb924',
    ts: new Date(Date.now() + 365 * 86400000).toISOString(),
    docType: 'degree',
    title: 'B.Tech Computer Science',
  }),
  login: JSON.stringify({
    v: 1, t: 'handshake',
    id: `challenge-${Date.now()}`,
    did: '',
    iss: 'did:sov:SERVICE_ISSUER_DID_xyz',
    hash: '',
    ts: new Date().toISOString(),
    service: 'Sovereign Trust Portal',
    nonce: Math.random().toString(36).slice(2, 18),
    exp: Math.floor(Date.now() / 1000) + 300,
    callback: 'https://auth.sovereign.trust/callback',
  }),
  post: JSON.stringify({
    v: 1, t: 'vc',
    id: 'post-truth-feed-001',
    did: 'did:sov:AUTHOR_DID_abc123',
    iss: 'did:sov:IITB_ISSUER_DID_abc123456',
    hash: 'truth-post-hash-a1b2c3d4',
    ts: new Date().toISOString(),
  }),
  did: 'did:sov:7Tq3kTmNpL8vXoAe9fP2Yz',
};

type Phase = 'idle' | 'scanning' | 'verifying' | 'done' | 'error';
const STEP_MS = 520;
const delay   = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Component ────────────────────────────────────────────────────────────────

export const ScanScreen: React.FC = () => {
  const [scanType,     setScanType]     = useState<VerificationSubjectType>('credential');
  const [phase,        setPhase]        = useState<Phase>('idle');
  const [stepStatuses, setStepStatuses] = useState<VerificationStepStatus[]>([]);
  const [result,       setResult]       = useState<VerificationResult | null>(null);
  const [tapLayer,     setTapLayer]     = useState(0);
  const [errorMsg,     setErrorMsg]     = useState('');

  const resultFade   = useRef(new Animated.Value(0)).current;
  const headerAnim   = useRef(new Animated.Value(0)).current;
  const stepsCardAnim = useRef(new Animated.Value(0)).current;

  const meta       = SCAN_TYPE_META[scanType];
  const trustState = result?.trustState as TrustState | undefined;

  // Animate header text change
  useEffect(() => {
    headerAnim.setValue(0);
    Animated.timing(headerAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [phase, headerAnim]);

  // ── Start scan ─────────────────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    const steps = meta.steps;
    setPhase('scanning');
    setResult(null);
    setTapLayer(0);
    setErrorMsg('');
    resultFade.setValue(0);
    stepsCardAnim.setValue(0);
    setStepStatuses(steps.map(() => 'idle' as VerificationStepStatus));

    // Animate steps card in
    Animated.spring(stepsCardAnim, {
      toValue: 1, speed: 14, bounciness: 4, useNativeDriver: true,
    }).start();

    for (let i = 0; i < steps.length; i++) {
      setStepStatuses(prev =>
        prev.map((_, idx) =>
          idx < i  ? 'done'   :
          idx === i ? 'active' : 'idle',
        ) as VerificationStepStatus[],
      );
      await delay(STEP_MS);
    }

    setStepStatuses(steps.map(() => 'done' as VerificationStepStatus));
    setPhase('verifying');

    try {
      const verResult = await verificationRouter.routeQR(MOCK_QR[scanType]);
      setResult(verResult);
      setPhase('done');
      Animated.spring(resultFade, {
        toValue: 1, useNativeDriver: true, speed: 12, bounciness: 5,
      }).start();
    } catch (err) {
      setPhase('error');
      setErrorMsg((err as Error).message ?? 'Verification failed');
    }
  }, [meta.steps, scanType, resultFade, stepsCardAnim]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPhase('idle');
    setStepStatuses([]);
    setResult(null);
    setTapLayer(0);
    setErrorMsg('');
    resultFade.setValue(0);
    stepsCardAnim.setValue(0);
  }, [resultFade, stepsCardAnim]);

  const phaseSubtext =
    phase === 'idle'      ? meta.description             :
    phase === 'scanning'  ? 'Reading and verifying…'     :
    phase === 'verifying' ? 'Running trust checks…'      :
    phase === 'done' && result ? result.summary          :
    phase === 'error'     ? errorMsg || 'Scan failed'    :
    '…';

  const accentColor = trustState
    ? (colors.trust[trustState]?.solid ?? meta.accentColor)
    : meta.accentColor;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity:   headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }],
            },
          ]}
        >
          <Text style={styles.title}>Scan & Verify</Text>
          <Text style={styles.headerSub} numberOfLines={2}>{phaseSubtext}</Text>
        </Animated.View>

        {/* ── Type selector (idle only) ────────────────────────────────── */}
        {phase === 'idle' && (
          <View style={styles.selectorWrap}>
            <ScanTypeSelector
              selected={scanType}
              onSelect={(type: VerificationSubjectType) => { setScanType(type); reset(); }}
            />
          </View>
        )}

        {/* ── Viewfinder ───────────────────────────────────────────────── */}
        <View style={[styles.viewfinder, { borderColor: `${accentColor}30` }]}>
          <View style={styles.vfBg} />

          <ScanOverlay
            size={240}
            scanning={phase === 'scanning' || phase === 'idle'}
            trustState={trustState ?? null}
          />

          {/* Phase indicator at the bottom of the viewfinder */}
          <View style={styles.vfBottom}>
            {phase === 'idle' && (
              <View style={styles.vfHintRow}>
                <Text style={styles.vfEmoji}>{meta.emoji}</Text>
                <Text style={styles.vfHint}>Point camera at {meta.label} QR code</Text>
              </View>
            )}

            {phase === 'scanning' && (
              <View style={[styles.vfPill, { borderColor: `${accentColor}50`, backgroundColor: `${accentColor}14` }]}>
                <View style={[styles.vfPulseDot, { backgroundColor: accentColor }]} />
                <Text style={[styles.vfPillText, { color: accentColor }]}>Reading…</Text>
              </View>
            )}

            {phase === 'verifying' && (
              <View style={[styles.vfPill, { borderColor: `${colors.brand.primary}50`, backgroundColor: `${colors.brand.primary}14` }]}>
                <View style={[styles.vfPulseDot, { backgroundColor: colors.brand.primary }]} />
                <Text style={[styles.vfPillText, { color: colors.brand.primary }]}>Verifying…</Text>
              </View>
            )}

            {phase === 'done' && trustState && (
              <View style={[styles.vfPill, {
                borderColor:     `${colors.trust[trustState]?.solid ?? accentColor}60`,
                backgroundColor: `${colors.trust[trustState]?.solid ?? accentColor}18`,
              }]}>
                <Text style={[styles.vfPillText, {
                  color:         colors.trust[trustState]?.solid ?? accentColor,
                  fontWeight:    '700',
                  letterSpacing: 1.5,
                }]}>
                  {trustState.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Verification steps ───────────────────────────────────────── */}
        {phase !== 'idle' && stepStatuses.length > 0 && (
          <Animated.View
            style={{
              opacity:   stepsCardAnim,
              transform: [{ translateY: stepsCardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            }}
          >
            <GlassCard
              style={styles.stepsCard}
              padding="md"
              glowState={phase === 'done' && trustState ? trustState : 'none'}
            >
              {/* Steps card header */}
              <View style={styles.stepsHeader}>
                <Text style={styles.stepsEmoji}>{meta.emoji}</Text>
                <Text style={styles.stepsTitle}>
                  {phase === 'done' ? 'Verified' : 'Verifying'} {meta.label}
                </Text>
                {phase === 'done' && trustState && (
                  <View style={[styles.stepsStatePill, {
                    borderColor:     `${colors.trust[trustState]?.solid}50`,
                    backgroundColor: `${colors.trust[trustState]?.solid}14`,
                  }]}>
                    <Text style={[styles.stepsStateText, { color: colors.trust[trustState]?.solid }]}>
                      {trustState}
                    </Text>
                  </View>
                )}
              </View>

              {/* Step rows */}
              <View style={styles.stepsRows}>
                {meta.steps.map((step, i) => (
                  <VerificationStepRow
                    key={step}
                    label={step}
                    status={stepStatuses[i] ?? 'idle'}
                    index={i}
                    totalSteps={meta.steps.length}
                    accentColor={meta.accentColor}
                  />
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* ── Result card ──────────────────────────────────────────────── */}
        {phase === 'done' && result && (
          <VerificationResultCard
            result={result}
            fadeAnim={resultFade}
            tapLayer={tapLayer}
            onTapLayer={setTapLayer}
          />
        )}

        {/* ── Error state ──────────────────────────────────────────────── */}
        {phase === 'error' && (
          <GlassCard glowState="revoked" padding="md" style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Text style={styles.errorIcon}>✕</Text>
            </View>
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.errorBody}>
              {errorMsg || 'Unable to verify. Please try again.'}
            </Text>
          </GlassCard>
        )}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <View style={styles.actions}>
          {phase === 'idle' && (
            <AppButton
              label={`Simulate ${meta.label} Scan`}
              onPress={startScan}
              variant="primary"
              fullWidth
            />
          )}
          {(phase === 'done' || phase === 'error') && (
            <AppButton
              label="Scan Again"
              onPress={reset}
              variant="secondary"
              fullWidth
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg.base,
    paddingTop:      Platform.OS === 'ios' ? 60 : 40,
  },
  scroll: { paddingHorizontal: 16 },

  // Header
  header:    { marginBottom: 16 },
  title:     { ...typo.title2, color: colors.text.primary },
  headerSub: { ...typo.body, color: colors.text.tertiary, marginTop: 4, lineHeight: 20 },

  // Selector
  selectorWrap: { marginBottom: 16 },

  // Viewfinder
  viewfinder: {
    height:          310,
    borderRadius:    radius['3xl'],
    backgroundColor: colors.bg.base,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    borderWidth:     1,
    overflow:        'hidden',
  },
  vfBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,8,16,0.88)',
  },
  vfBottom: {
    position:   'absolute',
    bottom:     20,
    left:       0,
    right:      0,
    alignItems: 'center',
    gap:        6,
  },
  vfHintRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  vfEmoji:   { fontSize: 14 },
  vfHint:    { ...typo.caption, color: colors.text.quaternary },
  vfPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               7,
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  vfPulseDot: {
    width:        7,
    height:       7,
    borderRadius: 3.5,
  },
  vfPillText: { ...typo.caption, fontWeight: '600' },

  // Steps card
  stepsCard:  { marginBottom: 16 },
  stepsHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginBottom:   14,
  },
  stepsEmoji: { fontSize: 16 },
  stepsTitle: { ...typo.label, color: colors.text.secondary, flex: 1 },
  stepsStatePill: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  stepsStateText: { ...typo.caption, fontWeight: '700', letterSpacing: 0.5, textTransform: 'lowercase' },
  stepsRows:  { gap: 0 },

  // Error
  errorCard: { alignItems: 'center', marginBottom: 16, paddingVertical: 24 },
  errorIconWrap: {
    width:           52,
    height:          52,
    borderRadius:    radius.full,
    backgroundColor: `${colors.trust.revoked.solid}18`,
    borderWidth:     1,
    borderColor:     `${colors.trust.revoked.solid}50`,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  errorIcon:  { fontSize: 22, color: colors.trust.revoked.solid },
  errorTitle: { ...typo.title3, color: colors.trust.revoked.solid, marginBottom: 6 },
  errorBody:  { ...typo.body, color: colors.text.secondary, textAlign: 'center' },

  // Actions
  actions: { marginTop: 4 },
});

export default ScanScreen;
