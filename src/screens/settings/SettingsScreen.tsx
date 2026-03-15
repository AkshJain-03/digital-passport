/**
 * SettingsScreen
 *
 * App settings and hardware diagnostics:
 *   • Identity — DID, fingerprint, algorithm
 *   • Hardware Security — enclave, biometrics
 *   • Diagnostics — biometric test runner
 *   • About — version, platform
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors }           from '../../theme/colors';
import { radius }           from '../../theme/radius';
import { GlassCard }        from '../../components/common/GlassCard';
import { AppBadge }         from '../../components/common/AppBadge';
import { ROUTES, type RootStackParamList } from '../../app/routes';
import { AppButton }        from '../../components/common/AppButton';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { runBiometricTest } from '../../crypto/biometricTest';
import { MOCK_IDENTITY }    from '../../constants/mockData';
import { APP_VERSION, APP_BUILD } from '../../constants/appConstants';
import type { BiometricTestResult } from '../../crypto/biometricTest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2:   t.title2   ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.body     ?? {},
  bodySm:   t.bodySm   ?? t.body      ?? {},
  caption:  t.captionSm ?? t.caption  ?? {},
  label:    t.label    ?? {},
  mono:     t.mono     ?? {},
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { biometryType, checkSupport } = useBiometricAuth();
  const [diagResult, setDiagResult]   = useState<BiometricTestResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => { checkSupport(); }, [checkSupport]);

  const runDiag = useCallback(async () => {
    setDiagLoading(true);
    const result = await runBiometricTest();
    setDiagResult(result);
    setDiagLoading(false);
  }, []);

  const identity = MOCK_IDENTITY;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => nav.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <SettingsSection title="Identity" icon="◈">
          <SettingsRow label="DID"    value={`${identity.did.slice(0, 26)}…`} mono />
          <SettingsRow label="Alias"  value={identity.alias} />
          <SettingsRow label="Status">
            <AppBadge label={identity.status} variant="verified" dot size="sm" />
          </SettingsRow>
          <SettingsRow label="Created" value={identity.createdAt.slice(0, 10)} />
        </SettingsSection>

        {/* Hardware Security */}
        <SettingsSection title="Hardware Security" icon="🔐">
          <SettingsRow label="Fingerprint"     value={identity.hardwareKey.fingerprint} mono />
          <SettingsRow label="Algorithm"       value={identity.hardwareKey.algorithm} />
          <SettingsRow label="Attestation"     value={identity.hardwareKey.attestationType} />
          <SettingsRow label="Biometrics"      value={biometryType ?? 'Not available'} />
          <SettingsRow label="Hardware Backed">
            <AppBadge
              label={identity.hardwareKey.isHardwareBacked ? 'Yes' : 'Software'}
              variant={identity.hardwareKey.isHardwareBacked ? 'verified' : 'suspicious'}
              size="sm"
            />
          </SettingsRow>
        </SettingsSection>

        {/* Diagnostics */}
        <SettingsSection title="Diagnostics" icon="🔬">
          <View style={styles.diagBtn}>
            <AppButton
              label={diagLoading ? 'Running test…' : 'Run Biometric Test'}
              onPress={runDiag}
              loading={diagLoading}
              variant="secondary"
              fullWidth
            />
          </View>
          {diagResult && (
            <View style={styles.diagResult}>
              <SettingsRow label="Available"  value={diagResult.available ? 'Yes' : 'No'} />
              <SettingsRow label="Type"       value={diagResult.biometryType} />
              <SettingsRow label="Keys Exist" value={diagResult.keysExist ? 'Yes' : 'No'} />
              {diagResult.error ? <SettingsRow label="Error" value={diagResult.error} /> : null}
            </View>
          )}
        </SettingsSection>

        {/* Trust Engine */}
        <SettingsSection title="Trust Engine" icon="🌐">
          <TouchableOpacity
            onPress={() => nav.navigate(ROUTES.TRUST_ENGINE)}
            activeOpacity={0.75}
            style={trustEngineStyles.row}
          >
            <View style={trustEngineStyles.left}>
              <Text style={trustEngineStyles.label}>How Sovereign Trust Works</Text>
              <Text style={trustEngineStyles.sub}>Explore the global trust infrastructure</Text>
            </View>
            <View style={trustEngineStyles.right}>
              <AppBadge label="Explore" variant="trusted" size="sm" />
              <Text style={trustEngineStyles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon="ℹ">
          <SettingsRow label="App"        value="Sovereign Trust Passport" />
          <SettingsRow label="Version"    value={`${APP_VERSION} (${APP_BUILD})`} />
          <SettingsRow label="Platform"   value={Platform.OS === 'ios' ? 'iOS' : 'Android'} />
          <SettingsRow label="OS Version" value={String(Platform.Version)} />
        </SettingsSection>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

// ─── SettingsSection ──────────────────────────────────────────────────────────

const SettingsSection: React.FC<{
  title:    string;
  icon:     string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={sectionStyles.wrap}>
    <View style={sectionStyles.header}>
      <Text style={sectionStyles.icon}>{icon}</Text>
      <Text style={sectionStyles.title}>{title.toUpperCase()}</Text>
    </View>
    <GlassCard padding="md" style={sectionStyles.card}>
      {children}
    </GlassCard>
  </View>
);

const sectionStyles = StyleSheet.create({
  wrap:   { marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 4 },
  icon:   { fontSize: 12 },
  title:  { ...typo.label, color: colors.text.quaternary },
  card:   {},
});

// ─── SettingsRow ──────────────────────────────────────────────────────────────

const SettingsRow: React.FC<{
  label:     string;
  value?:    string;
  mono?:     boolean;
  children?: React.ReactNode;
}> = ({ label, value, mono, children }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    {children
      ? children
      : (
        <Text
          style={[rowStyles.value, mono && rowStyles.mono]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.hairline,
  },
  label: { ...typo.body,   color: colors.text.secondary, flex: 0.45 },
  value: { ...typo.bodySm, color: colors.text.tertiary, flex: 0.55, textAlign: 'right' },
  mono:  { ...typo.mono,   fontSize: 10, color: colors.text.quaternary },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg.base,
    paddingTop:      Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    marginBottom:      20,
  },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow: { ...typo.body, color: colors.brand.primary, fontSize: 18 },
  backText:  { ...typo.body, color: colors.brand.primary },
  title:     { ...typo.headline, color: colors.text.primary },
  scroll:    { paddingHorizontal: 16 },
  diagBtn:   { marginBottom: 8 },
  diagResult:{ marginTop: 4 },
});

const trustEngineStyles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  left:  { flex: 1, gap: 3 },
  label: { ...typo.body, color: colors.text.secondary },
  sub:   { ...typo.caption, color: colors.text.quaternary },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { ...typo.title3, color: colors.brand.primary, lineHeight: 22 },
});

export default SettingsScreen;
