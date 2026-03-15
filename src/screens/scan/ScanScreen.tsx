/**
 * ScanScreen
 *
 * QR scan interface with live verification animation:
 *   1. Camera viewfinder with animated ScanOverlay
 *   2. "Simulate scan" button in dev mode
 *   3. Sequential VerificationStepRow animation
 *   4. Result reveal with trust glow card
 *   5. 3-layer progressive reveal on result card
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }                  from '../../theme/colors';
import { radius }                  from '../../theme/radius';
import { spacing }                 from '../../theme/spacing';
import { typography }              from '../../theme/typography';
import { shadows }                 from '../../theme/shadows';
import { GlassCard }               from '../../components/common/GlassCard';
import { AppButton }               from '../../components/common/AppButton';
import { AppBadge }                from '../../components/common/AppBadge';
import { VERIFICATION_STEPS }      from '../../constants/appConstants';
import { verificationRouter }      from '../../domain/verification/verificationRouter';
import { MOCK_CREDENTIALS }        from '../../constants/mockData';
import { CREDENTIAL_TYPE_META }    from '../../models/credential';
import type { VerificationResult } from '../../domain/verification/verificationTypes';
import type { TrustState }         from '../../theme/colors';

import { ScanOverlay }            from './components/ScanOverlay';
import { VerificationStepRow }    from './components/VerificationStepRow';
import type { VerificationStepStatus } from '../../domain/verification/verificationTypes';

// ─── Step machine ─────────────────────────────────────────────────────────────

const STEPS = [...VERIFICATION_STEPS];
const STEP_MS = 520;

type Phase = 'idle' | 'scanning' | 'done' | 'error';

export const ScanScreen: React.FC = () => {
  const [phase,        setPhase]        = useState<Phase>('idle');
  const [activeStep,   setActiveStep]   = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<VerificationStepStatus[]>(
    STEPS.map(() => 'idle'),
  );
  const [result,       setResult]       = useState<VerificationResult | null>(null);
  const [tapLayer,     setTapLayer]     = useState(0);

  const resultFade = useRef(new Animated.Value(0)).current;
  const stepRef    = useRef(-1);

  // ── Kick off verification simulation ──────────────────────────────────────
  const startScan = useCallback(async () => {
    setPhase('scanning');
    setResult(null);
    setTapLayer(0);
    setStepStatuses(STEPS.map(() => 'idle'));
    resultFade.setValue(0);

    // Animate through each step
    for (let i = 0; i < STEPS.length; i++) {
      stepRef.current = i;
      setActiveStep(i);
      setStepStatuses(prev => prev.map((s, idx) =>
        idx < i ? 'done' : idx === i ? 'active' : 'idle',
      ));
      await delay(STEP_MS);
    }

    // Mark all done
    setStepStatuses(STEPS.map(() => 'done'));
    setActiveStep(STEPS.length);

    // Run actual verification against first mock credential
    const mockCred = MOCK_CREDENTIALS[0];
    try {
      const verResult = await verificationRouter.routeQR(
        JSON.stringify({ v: 1, t: 'vc', id: mockCred.id, did: mockCred.subjectDid,
          iss: mockCred.issuerDid, hash: mockCred.proofHash.slice(0, 32), ts: new Date().toISOString() }),
      );
      setResult(verResult);
      setPhase('done');
      Animated.spring(resultFade, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 5 }).start();
    } catch {
      setPhase('error');
    }
  }, [resultFade]);

  const reset = useCallback(() => {
    setPhase('idle');
    setActiveStep(-1);
    setStepStatuses(STEPS.map(() => 'idle'));
    setResult(null);
    setTapLayer(0);
    resultFade.setValue(0);
  }, [resultFade]);

  const cred      = MOCK_CREDENTIALS[0];
  const credMeta  = CREDENTIAL_TYPE_META[cred.type];
  const trustColor = result
    ? colors.trust[result.trustState as TrustState]?.solid ?? colors.brand.primary
    : colors.brand.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan & Verify</Text>
          <Text style={styles.sub}>
            {phase === 'idle'    ? 'Point camera at a credential or product QR' :
             phase === 'scanning'? 'Verifying…' :
             phase === 'done'    ? 'Verification complete' : 'Scan failed'}
          </Text>
        </View>

        {/* ── Viewfinder ─────────────────────────────────────────────── */}
        <View style={styles.viewfinder}>
          {/* Dark background */}
          <View style={styles.vfBg} />

          <ScanOverlay
            size={240}
            scanning={phase === 'scanning' || phase === 'idle'}
            trustState={result?.trustState as TrustState ?? null}
          />

          {phase === 'idle' && (
            <Text style={styles.scanHint}>Dev: tap below to simulate scan</Text>
          )}
        </View>

        {/* ── Verification steps ──────────────────────────────────────── */}
        {phase !== 'idle' && (
          <GlassCard style={styles.stepsCard}>
            {STEPS.map((step, i) => (
              <VerificationStepRow
                key={step}
                label={step}
                status={stepStatuses[i]}
                index={i}
              />
            ))}
          </GlassCard>
        )}

        {/* ── Result card ─────────────────────────────────────────────── */}
        {phase === 'done' && result && (
          <Animated.View style={{ opacity: resultFade }}>
            <GlassCard
              glowState={result.trustState as TrustState}
              style={styles.resultCard}
              revealLayers={3}
              onTapLayer={setTapLayer}
            >
              {/* Layer 0: summary */}
              <View style={styles.resultHeader}>
                <View style={[styles.resultIconWrap, { borderColor: trustColor + '60' }]}>
                  <Text style={styles.resultEmoji}>{credMeta.emoji}</Text>
                </View>
                <View style={styles.resultHeaderBody}>
                  <Text style={styles.resultTitle}>{cred.title}</Text>
                  <Text style={styles.resultIssuer}>{cred.issuer.shortName}</Text>
                </View>
                <AppBadge
                  label={result.trustState}
                  variant={result.trustState as TrustState}
                  dot size="md"
                />
              </View>
              <Text style={styles.resultSummary}>{result.summary}</Text>

              {/* Layer 1: checks */}
              {tapLayer >= 1 && (
                <View style={styles.checksSection}>
                  <View style={styles.layerDivider} />
                  <Text style={styles.layerLabel}>VERIFICATION DETAILS</Text>
                  {result.checks.map(check => (
                    <View key={check.id} style={styles.checkRow}>
                      <Text style={[
                        styles.checkIcon,
                        { color: check.outcome === 'pass' ? colors.trust.verified.solid :
                                  check.outcome === 'fail' ? colors.trust.revoked.solid  :
                                  colors.trust.suspicious.solid },
                      ]}>
                        {check.outcome === 'pass' ? '✓' : check.outcome === 'fail' ? '✕' : '⚠'}
                      </Text>
                      <Text style={styles.checkLabel}>{check.label}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Layer 2: trust graph */}
              {tapLayer >= 2 && (
                <View style={styles.trustGraphSection}>
                  <View style={styles.layerDivider} />
                  <Text style={styles.layerLabel}>TRUST GRAPH</Text>
                  <View style={styles.trustChain}>
                    {[cred.issuer.shortName, credMeta.label, 'You'].map((node, i, arr) => (
                      <React.Fragment key={node}>
                        <View style={[styles.trustNode, { borderColor: trustColor + '80' }]}>
                          <Text style={[styles.trustNodeText, { color: trustColor }]}>{node}</Text>
                        </View>
                        {i < arr.length - 1 && (
                          <Text style={styles.trustArrow}>→</Text>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              <Text style={styles.tapHint}>
                {tapLayer === 0 ? 'Tap for details'
                  : tapLayer === 1 ? 'Tap for trust graph' : 'Tap to collapse'}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          {phase === 'idle' && (
            <AppButton label="Simulate Scan" onPress={startScan} variant="primary" fullWidth />
          )}
          {(phase === 'done' || phase === 'error') && (
            <AppButton label="Scan Again" onPress={reset} variant="secondary" fullWidth />
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.bg.base, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  scroll: { paddingHorizontal: spacing.xs },
  header: { marginBottom: spacing.xl },
  title:  { ...typography.title2, color: colors.text.primary },
  sub:    { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 3 },
  viewfinder: {
    height: 300, borderRadius: radius['3xl'], backgroundColor: colors.bg.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
    borderWidth: 1, borderColor: colors.border.subtle, overflow: 'hidden',
  },
  vfBg:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,8,16,0.85)' },
  scanHint:  { ...typography.caption, color: colors.text.quaternary, marginTop: spacing.xs },
  stepsCard: { marginBottom: spacing.sm },
  resultCard: { marginBottom: spacing.sm },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxs },
  resultIconWrap: {
    width: 44, height: 44, borderRadius: radius.xl, borderWidth: 1,
    backgroundColor: colors.glass.medium, alignItems: 'center', justifyContent: 'center',
  },
  resultEmoji: { fontSize: 22 },
  resultHeaderBody: { flex: 1 },
  resultTitle:   { ...typography.headline, color: colors.text.primary },
  resultIssuer:  { ...typography.caption, color: colors.text.tertiary, marginTop: 1 },
  resultSummary: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: spacing.xxs },
  checksSection: { marginTop: spacing.xxs },
  layerDivider:  { height: 1, backgroundColor: colors.border.subtle, marginBottom: spacing.xxs },
  layerLabel:    { ...typography.caption, color: colors.text.quaternary, marginBottom: spacing.xxs, fontWeight: '600' },
  checkRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginBottom: 5 },
  checkIcon:     { ...typography.body, fontWeight: '700', width: 16 },
  checkLabel:    { ...typography.bodySmall, color: colors.text.secondary, flex: 1 },
  trustGraphSection: { marginTop: spacing.xxs },
  trustChain:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xxs },
  trustNode: {
    paddingHorizontal: spacing.xxs, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  trustNodeText: { ...typography.caption, fontWeight: '600' },
  trustArrow:    { ...typography.caption, color: colors.text.quaternary },
  tapHint:       { ...typography.caption, color: colors.text.quaternary, marginTop: spacing.sm, textAlign: 'right' },
  actions: { marginTop: spacing.xxs },
});

export default ScanScreen;