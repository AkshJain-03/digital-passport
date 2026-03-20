/**
 * VerifyScreen
 *
 * Manual verification — three tabs:
 *   • Credential   verify by ID / DID
 *   • Product      verify by serial or product ID
 *   • DID          resolve an issuer or person's DID
 *
 * Each tab: text input → verify → animated 5-step pipeline → result.
 * Result card has 3-layer progressive reveal.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }             from '../../theme/colors';
import { radius }             from '../../theme/radius';
import { GlassCard }          from '../../components/common/GlassCard';
import { AppButton }          from '../../components/common/AppButton';
import { AppBadge }           from '../../components/common/AppBadge';
import { LoadingState }       from '../../components/common/LoadingState';
import { verificationRouter } from '../../domain/verification/verificationRouter';
import { SCAN_TYPE_META }     from '../../domain/verification/verificationTypes';
import type { VerificationResult, VerificationSubjectType } from '../../domain/verification/verificationTypes';
import type { TrustState }    from '../../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2:   t.title2   ?? {},
  title3:   t.title3   ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm   ?? t.body      ?? {},
  caption:  t.captionSm ?? t.caption  ?? {},
  label:    t.label    ?? {},
  button:   t.buttonSm ?? t.button    ?? {},
  mono:     t.mono     ?? {},
};

// ─── Tab config ───────────────────────────────────────────────────────────────

type Tab = 'credential' | 'product' | 'did';

const TABS: { key: Tab; label: string; emoji: string; placeholder: string; hint: string }[] = [
  {
    key:         'credential',
    label:       'Credential',
    emoji:       '🪪',
    placeholder: 'cred-sovereign-demo-001',
    hint:        'Enter Credential ID',
  },
  {
    key:         'product',
    label:       'Product',
    emoji:       '📦',
    placeholder: 'prod-macbook-pro-m3-001',
    hint:        'Enter Product ID or serial',
  },
  {
    key:         'did',
    label:       'DID',
    emoji:       '🔑',
    placeholder: 'did:sov:7Tq3kTmNpL8vXoAe9fP2Yz',
    hint:        'Enter a DID to resolve',
  },
];

const DEFAULT_INPUT: Record<Tab, string> = {
  credential: 'cred-sovereign-demo-001',
  product:    'prod-macbook-pro-m3-001',
  did:        'did:sov:7Tq3kTmNpL8vXoAe9fP2Yz',
};

const TAB_CLEARANCE = Platform.OS === 'ios' ? 128 : 112;

// ─── Component ────────────────────────────────────────────────────────────────

export const VerifyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('credential');
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<VerificationResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [tapLayer,  setTapLayer]  = useState(0);

  const resultFade = useRef(new Animated.Value(0)).current;
  const tabConfig  = TABS.find(tb => tb.key === activeTab)!;

  const handleVerify = useCallback(async () => {
    const query = input.trim() || DEFAULT_INPUT[activeTab];
    setLoading(true);
    setResult(null);
    setError(null);
    setTapLayer(0);
    resultFade.setValue(0);

    try {
      const res = await verificationRouter.route({
        subjectType: activeTab as VerificationSubjectType,
        subjectId:   query,
      });
      setResult(res);
      Animated.spring(resultFade, {
        toValue: 1, useNativeDriver: true, speed: 14, bounciness: 4,
      }).start();
    } catch (e) {
      setError((e as Error).message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [input, activeTab, resultFade]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setInput('');
    setResult(null);
    setError(null);
    resultFade.setValue(0);
  };

  const trustColor = result
    ? (colors.trust[result.trustState as TrustState]?.solid ?? colors.brand.primary)
    : colors.brand.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_CLEARANCE }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify</Text>
          <Text style={styles.sub}>Verify credentials, products, and identities</Text>
        </View>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <View style={styles.tabs}>
          {TABS.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabChange(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Input card ──────────────────────────────────────────────────── */}
        <GlassCard style={styles.inputCard} padding="md">
          <Text style={styles.inputLabel}>{tabConfig.hint.toUpperCase()}</Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={tabConfig.placeholder}
            placeholderTextColor={colors.text.quaternary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleVerify}
            selectionColor={colors.brand.primary}
          />
          <AppButton
            label={loading ? 'Verifying…' : `Verify ${tabConfig.label}`}
            onPress={handleVerify}
            loading={loading}
            variant="primary"
            fullWidth
          />
        </GlassCard>

        {/* ── Loading pipeline ─────────────────────────────────────────────── */}
        {loading && (
          <GlassCard style={styles.loadingCard} padding="md">
            {SCAN_TYPE_META[activeTab].steps.map((step, i) => (
              <View key={step} style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: colors.brand.primaryDim, borderColor: colors.brand.primary }]}>
                  <Text style={styles.stepIcon}>◌</Text>
                </View>
                <Text style={styles.stepLabel}>{step}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && !loading && (
          <GlassCard glowState="suspicious" padding="md" style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.errorBody}>{error}</Text>
          </GlassCard>
        )}

        {/* ── Result card (3-layer) ────────────────────────────────────────── */}
        {result && !loading && (
          <Animated.View style={{ opacity: resultFade }}>
            <GlassCard
              glowState={result.trustState as TrustState}
              animateGlow
              padding="md"
              revealLayers={3}
              onTapLayer={setTapLayer}
              style={styles.resultCard}
            >
              {/* Top: badge + duration */}
              <View style={styles.resultTop}>
                <AppBadge
                  label={result.trustState}
                  variant={result.trustState as TrustState}
                  dot
                  size="lg"
                />
                <Text style={styles.durationText}>{result.durationMs}ms</Text>
              </View>

              <Text style={styles.summary}>{result.summary}</Text>

              {/* Layer 1: checks */}
              {tapLayer >= 1 && (
                <View style={styles.checksWrap}>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>VERIFICATION CHECKS</Text>
                  {result.checks.map(c => {
                    const isPass = c.outcome === 'pass';
                    const isFail = c.outcome === 'fail';
                    const cc     = isPass ? colors.trust.verified.solid
                                 : isFail ? colors.trust.revoked.solid
                                 : colors.trust.suspicious.solid;
                    return (
                      <View key={c.id} style={styles.checkRow}>
                        <View style={[styles.checkDot, { borderColor: cc, backgroundColor: `${cc}18` }]}>
                          <Text style={[styles.checkIcon, { color: cc }]}>
                            {isPass ? '✓' : isFail ? '✕' : '⚠'}
                          </Text>
                        </View>
                        <View style={styles.checkBody}>
                          <Text style={styles.checkLabel}>{c.label}</Text>
                          {c.detail ? <Text style={styles.checkDetail}>{c.detail}</Text> : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Layer 2: metadata */}
              {tapLayer >= 2 && (
                <View style={styles.checksWrap}>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>METADATA</Text>
                  <MetaRow label="Subject ID"   value={result.subjectId.length > 28 ? `${result.subjectId.slice(0, 26)}…` : result.subjectId} />
                  <MetaRow label="Subject type" value={result.subjectType} />
                  <MetaRow label="Verified at"  value={new Date(result.verifiedAt).toLocaleTimeString()} />
                  <MetaRow label="Duration"     value={`${result.durationMs}ms`} />
                </View>
              )}

              <Text style={styles.tapHint}>
                {tapLayer === 0 ? '↓ Tap for checks'
                  : tapLayer === 1 ? '↓ Tap for metadata'
                  : '↑ Tap to collapse'}
              </Text>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

// ── Sub-component ─────────────────────────────────────────────────────────────

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={metaRowStyles.row}>
    <Text style={metaRowStyles.label}>{label}</Text>
    <Text style={metaRowStyles.value}>{value}</Text>
  </View>
);
const metaRowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { ...typo.caption, color: colors.text.quaternary },
  value: { ...typo.caption, color: colors.text.secondary },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: 'transparent',
    paddingTop:      Platform.OS === 'ios' ? 66 : 46,
  },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: { marginBottom: 20 },
  title:  { ...typo.title2, color: colors.text.primary },
  sub:    { ...typo.body,   color: colors.text.tertiary, marginTop: 3 },

  // Tabs
  tabs: {
    flexDirection:   'row',
    backgroundColor: colors.glass.medium,
    borderRadius:    radius['2xl'],
    padding:         3,
    marginBottom:    20,
    gap:             3,
  },
  tab: {
    flex:           1,
    paddingVertical: 8,
    borderRadius:   radius.xl,
    alignItems:     'center',
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            5,
  },
  tabActive: {
    backgroundColor: colors.bg.elevated,
    borderWidth:     1,
    borderColor:     colors.border.light,
  },
  tabEmoji:      { fontSize: 14 },
  tabLabel:      { ...typo.button, color: colors.text.tertiary, fontSize: 12 },
  tabLabelActive:{ color: colors.text.primary },

  // Input
  inputCard:  { marginBottom: 20 },
  inputLabel: { ...typo.label, color: colors.text.quaternary, marginBottom: 8 },
  input: {
    ...typo.body,
    color:             colors.text.primary,
    backgroundColor:   colors.glass.subtle,
    borderRadius:      radius.xl,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
    paddingHorizontal: 12,
    paddingVertical:   10,
    marginBottom:      12,
  },

  // Loading
  loadingCard: { marginBottom: 20 },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  stepDot: {
    width: 22, height: 22, borderRadius: radius.full, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon:  { fontSize: 10 },
  stepLabel: { ...typo.body, color: colors.text.tertiary, fontSize: 13 },

  // Error
  errorCard:  { alignItems: 'center', marginBottom: 20 },
  errorIcon:  { fontSize: 24, color: colors.trust.suspicious.solid, marginBottom: 8 },
  errorTitle: { ...typo.title3, color: colors.trust.suspicious.solid, marginBottom: 4 },
  errorBody:  { ...typo.body, color: colors.text.secondary, textAlign: 'center' },

  // Result
  resultCard: { marginBottom: 20 },
  resultTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   10,
  },
  durationText: { ...typo.caption, color: colors.text.quaternary },
  summary:      { ...typo.body, color: colors.text.secondary, marginBottom: 4, lineHeight: 20 },

  // Checks
  checksWrap: { marginTop: 8 },
  divider:    { height: 1, backgroundColor: colors.border.subtle, marginBottom: 10 },
  sectionLabel: { ...typo.label, color: colors.text.quaternary, marginBottom: 10 },
  checkRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  checkDot: {
    width: 22, height: 22, borderRadius: radius.full, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkIcon:   { fontSize: 10, fontWeight: '700' },
  checkBody:   { flex: 1 },
  checkLabel:  { ...typo.body, color: colors.text.secondary, fontSize: 13 },
  checkDetail: { ...typo.caption, color: colors.text.quaternary, marginTop: 1 },
  tapHint:     { ...typo.caption, color: colors.text.quaternary, marginTop: 12, textAlign: 'right' },
});

export default VerifyScreen;
