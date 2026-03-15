/**
 * VerifyScreen
 *
 * Manual verification with three tabs:
 *   • Credential — verify by ID or DID
 *   • Product    — verify by serial number or ID
 *   • DID        — verify an issuer or person's DID
 *
 * Each tab: text input → verify button → animated result reveal.
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

import { colors }                  from '../../theme/colors';
import { radius }                  from '../../theme/radius';
import { spacing }                 from '../../theme/spacing';
import { typography }              from '../../theme/typography';
import { GlassCard }               from '../../components/common/GlassCard';
import { AppButton }               from '../../components/common/AppButton';
import { AppBadge }                from '../../components/common/AppBadge';
import { LoadingState }            from '../../components/common/LoadingState';
import { EmptyState }              from '../../components/common/EmptyState';
import { verificationRouter }      from '../../domain/verification/verificationRouter';
import type { VerificationResult, VerificationSubjectType } from '../../domain/verification/verificationTypes';
import type { TrustState }         from '../../theme/colors';

type Tab = 'credential' | 'product' | 'did';

const TABS: { key: Tab; label: string; placeholder: string; hint: string }[] = [
  { key: 'credential', label: 'Credential', placeholder: 'cred-001',
    hint: 'Enter credential ID' },
  { key: 'product',    label: 'Product',    placeholder: 'C02XK1J5JGH5',
    hint: 'Enter serial number or product ID' },
  { key: 'did',        label: 'DID',        placeholder: 'did:sov:…',
    hint: 'Enter a DID to verify' },
];

export const VerifyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('credential');
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<VerificationResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [tapLayer,  setTapLayer]  = useState(0);

  const resultFade = useRef(new Animated.Value(0)).current;

  const tabConfig = TABS.find(t => t.key === activeTab)!;

  const handleVerify = useCallback(async () => {
    const query = input.trim() || defaultInput(activeTab);
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
      Animated.spring(resultFade, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 4 }).start();
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
    ? colors.trust[result.trustState as TrustState]?.solid ?? colors.brand.primary
    : colors.brand.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify</Text>
          <Text style={styles.sub}>Verify credentials, products, or identities manually</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <GlassCard style={styles.inputCard}>
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
            label="Verify"
            onPress={handleVerify}
            loading={loading}
            variant="primary"
            fullWidth
            style={styles.verifyBtn}
          />
        </GlassCard>

        {/* Loading */}
        {loading && (
          <LoadingState
            mode="verification"
            steps={['Looking up record', 'Checking signature', 'Checking issuer', 'Evaluating trust']}
            activeStep={1}
            completedStep={0}
          />
        )}

        {/* Error */}
        {error && !loading && (
          <EmptyState icon="⚠" title="Verification failed" description={error} glowState="suspicious" />
        )}

        {/* Result */}
        {result && !loading && (
          <Animated.View style={{ opacity: resultFade }}>
            <GlassCard
              glowState={result.trustState as TrustState}
              revealLayers={3}
              onTapLayer={setTapLayer}
              style={styles.resultCard}
            >
              {/* Header row */}
              <View style={styles.resultTop}>
                <AppBadge label={result.trustState} variant={result.trustState as TrustState} dot size="lg" />
                <Text style={styles.resultDuration}>{result.durationMs}ms</Text>
              </View>
              <Text style={styles.resultSummary}>{result.summary}</Text>

              {/* Layer 1: checks */}
              {tapLayer >= 1 && (
                <View style={styles.checksWrap}>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>CHECKS</Text>
                  {result.checks.map(c => (
                    <View key={c.id} style={styles.checkRow}>
                      <Text style={[styles.checkIcon, {
                        color: c.outcome === 'pass' ? colors.trust.verified.solid :
                               c.outcome === 'fail' ? colors.trust.revoked.solid  :
                               colors.trust.suspicious.solid,
                      }]}>{c.outcome === 'pass' ? '✓' : c.outcome === 'fail' ? '✕' : '⚠'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.checkLabel}>{c.label}</Text>
                        {c.detail && <Text style={styles.checkDetail}>{c.detail}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Layer 2: metadata */}
              {tapLayer >= 2 && (
                <View style={styles.checksWrap}>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>METADATA</Text>
                  <MetaRow label="Subject ID"   value={result.subjectId.slice(0, 28) + '…'} />
                  <MetaRow label="Subject type" value={result.subjectType} />
                  <MetaRow label="Verified at"  value={new Date(result.verifiedAt).toLocaleTimeString()} />
                </View>
              )}

              <Text style={styles.tapHint}>
                {tapLayer === 0 ? 'Tap for check details'
                  : tapLayer === 1 ? 'Tap for metadata' : 'Tap to collapse'}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
    <Text style={{ ...typography.caption, color: colors.text.quaternary }}>{label}</Text>
    <Text style={{ ...typography.caption, color: colors.text.secondary }}>{value}</Text>
  </View>
);

const defaultInput = (tab: Tab): string => {
  if (tab === 'credential') return 'cred-001';
  if (tab === 'product')    return 'prod-001';
  return 'did:sov:IIT-Bombay-0xA1B2C3';
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg.base, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  scroll: { paddingHorizontal: spacing.xs },
  header: { marginBottom: spacing.xl },
  title:  { ...typography.title2, color: colors.text.primary },
  sub:    { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 3 },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.glass.medium,
    borderRadius: radius['2xl'], padding: 3, marginBottom: spacing.xl,
  },
  tab: {
    flex: 1, paddingVertical: spacing.xxs, borderRadius: radius.xl, alignItems: 'center',
  },
  tabActive:      { backgroundColor: colors.bg.elevated, borderWidth: 1, borderColor: colors.border.light },
  tabLabel:       { ...typography.buttonSmall, color: colors.text.tertiary },
  tabLabelActive: { color: colors.text.primary },
  inputCard:   { marginBottom: spacing.xl },
  inputLabel:  { ...typography.label, color: colors.text.quaternary, marginBottom: spacing.xxs },
  input: {
    ...typography.body,
    color:           colors.text.primary,
    backgroundColor: colors.glass.subtle,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     colors.border.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical:   spacing.xxs + 2,
    marginBottom:    spacing.sm,
  },
  verifyBtn:   {},
  resultCard:  { marginBottom: spacing.sm },
  resultTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxs },
  resultDuration: { ...typography.caption, color: colors.text.quaternary },
  resultSummary:  { ...typography.body, color: colors.text.secondary },
  checksWrap: { marginTop: spacing.xxs },
  divider:    { height: 1, backgroundColor: colors.border.subtle, marginBottom: spacing.xxs },
  sectionLabel: { ...typography.label, color: colors.text.quaternary, marginBottom: spacing.xxs },
  checkRow:   { flexDirection: 'row', gap: spacing.xxs, marginBottom: 6, alignItems: 'flex-start' },
  checkIcon:  { ...typography.body, fontWeight: '700', width: 16, flexShrink: 0 },
  checkLabel: { ...typography.bodySmall, color: colors.text.secondary },
  checkDetail:{ ...typography.caption, color: colors.text.quaternary, marginTop: 1 },
  tapHint:    { ...typography.caption, color: colors.text.quaternary, marginTop: spacing.sm, textAlign: 'right' },
});

export default VerifyScreen;