/**
 * SettingsScreen
 *
 * App settings and diagnostics, with a dedicated Vision section.
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { GlassCard } from '../../components/common/GlassCard';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { LiquidBackButton } from '../../components/common/LiquidBackButton';
import { ROUTES, type RootStackParamList } from '../../app/routes';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { runBiometricTest } from '../../crypto/biometricTest';
import { MOCK_IDENTITY } from '../../constants/mockData';
import { APP_VERSION, APP_BUILD } from '../../constants/appConstants';
import type { BiometricTestResult } from '../../crypto/biometricTest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title1: t.title1 ?? {},
  title2: t.title2 ?? {},
  title3: t.title3 ?? t.title2 ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body: t.body ?? {},
  bodySm: t.bodySm ?? t.body ?? {},
  caption: t.captionSm ?? t.caption ?? {},
  label: t.label ?? {},
  mono: t.mono ?? {},
};

type UseCase = {
  icon: string;
  title: string;
  summary: string;
};

const USE_CASES: UseCase[] = [
  { icon: '◎', title: 'Identity & Login Everywhere', summary: 'Passwordless login via Scan → Face ID → verified access across websites, airports, government, banks, and corporate systems.' },
  { icon: '🎓', title: 'Education Credentials', summary: 'Degrees, certificates, and transcripts as verifiable credentials for instant hiring checks.' },
  { icon: '⚖️', title: 'Professional Licensing', summary: 'Instant verification of doctor/lawyer/engineer/pilot licenses with issuer and expiry proof.' },
  { icon: '⬡', title: 'Product Authenticity', summary: 'Scan products to verify manufacturer, factory, date, supply chain, and authenticity proof.' },
  { icon: '🔗', title: 'Supply Chain Transparency', summary: 'Signed custody events from Factory → Distributor → Retailer → Consumer for traceability and compliance.' },
  { icon: '🏠', title: 'Property Ownership', summary: 'Digitally signed ownership credentials for land, vehicles, and assets.' },
  { icon: '💼', title: 'Employment Verification', summary: 'Recruiters verify signed role credentials without external background agencies.' },
  { icon: '🩺', title: 'Medical Records', summary: 'Patient-controlled health credentials: vaccines, prescriptions, allergies, and insurance.' },
  { icon: '✈️', title: 'Travel & Immigration', summary: 'Digital passport and visa credentials with biometric confirmation.' },
  { icon: '🛡', title: 'Insurance Claims', summary: 'Claims validated through signed evidence credentials for faster processing.' },
  { icon: '🏦', title: 'Financial Compliance', summary: 'KYC once, reuse everywhere: banks verify existing credential instead of repeating KYC.' },
  { icon: '📰', title: 'Social Media Truth Verification', summary: 'Posts include issuer, timestamp, and authenticity proofs to reduce misinformation.' },
  { icon: '🖊', title: 'Digital Contracts', summary: 'Freelance, employment, and business contracts signed by hardware-backed keys.' },
  { icon: '🏛', title: 'Government Certificates', summary: 'Birth, marriage, tax, and license documents as portable verifiable credentials.' },
  { icon: '🤖', title: 'AI Content Verification', summary: 'Signed AI content provenance with creator, timestamp, and model metadata.' },
  { icon: '🧪', title: 'Academic Research Validation', summary: 'Proofs for author identity, institution, and peer-review credentials.' },
  { icon: '🎟', title: 'Event Access Control', summary: 'Ticket credentials for scan-and-enter access with fraud prevention.' },
  { icon: '💠', title: 'Charity & Donations', summary: 'Signed spending credentials increase donor transparency and trust.' },
  { icon: '🍽', title: 'Welfare Distribution', summary: 'Eligibility credentials for subsidies and healthcare to reduce fraud.' },
  { icon: '🗳', title: 'Voting Systems (Future)', summary: 'Election-issued voting credentials and signed ballots for secure remote voting design.' },
];

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { biometryType, checkSupport, authenticate } = useBiometricAuth();
  const [diagResult, setDiagResult] = useState<BiometricTestResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const bubble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSupport();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bubble, { toValue: 1, duration: 4200, useNativeDriver: true }),
        Animated.timing(bubble, { toValue: 0, duration: 4200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [checkSupport, bubble]);

  const runDiag = useCallback(async () => {
    setDiagLoading(true);
    const result = await runBiometricTest();
    setDiagResult(result);
    setDiagLoading(false);
  }, []);

  const runAuth = useCallback(async () => {
    setAuthLoading(true);
    const ok = await authenticate('Authenticate with Face ID / Touch ID');
    setAuthStatus(ok ? 'Authentication successful' : 'Authentication failed or cancelled');
    setAuthLoading(false);
  }, [authenticate]);

  const identity = MOCK_IDENTITY;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.bubble,
          {
            opacity: bubble.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.24] }),
            transform: [{ translateY: bubble.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) }],
          },
        ]}
      />

      <View style={styles.header}>
        <LiquidBackButton onPress={() => nav.goBack()} />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsSection title="Identity" icon="◈">
          <SettingsRow label="DID" value={`${identity.did.slice(0, 26)}…`} mono />
          <SettingsRow label="Alias" value={identity.alias} />
          <SettingsRow label="Status">
            <AppBadge label={identity.status} variant="verified" dot size="sm" />
          </SettingsRow>
          <SettingsRow label="Created" value={identity.createdAt.slice(0, 10)} />
        </SettingsSection>

        <SettingsSection title="Hardware Security" icon="🔐">
          <SettingsRow label="Fingerprint" value={identity.hardwareKey.fingerprint} mono />
          <SettingsRow label="Algorithm" value={identity.hardwareKey.algorithm} />
          <SettingsRow label="Attestation" value={identity.hardwareKey.attestationType} />
          <SettingsRow label="Biometrics" value={biometryType ?? 'Not available'} />
          <SettingsRow label="Hardware Backed">
            <AppBadge
              label={identity.hardwareKey.isHardwareBacked ? 'Yes' : 'Software'}
              variant={identity.hardwareKey.isHardwareBacked ? 'verified' : 'suspicious'}
              size="sm"
            />
          </SettingsRow>
        </SettingsSection>

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
          <View style={styles.diagBtn}>
            <AppButton
              label={authLoading ? 'Authenticating…' : 'Authenticate Biometrics'}
              onPress={runAuth}
              loading={authLoading}
              variant="primary"
              fullWidth
            />
          </View>
          {authStatus ? (
            <View style={styles.authStatusWrap}>
              <Text style={styles.authStatusText}>{authStatus}</Text>
            </View>
          ) : null}
          {diagResult && (
            <View style={styles.diagResult}>
              <SettingsRow label="Available" value={diagResult.available ? 'Yes' : 'No'} />
              <SettingsRow label="Type" value={diagResult.biometryType} />
              <SettingsRow label="Keys Exist" value={diagResult.keysExist ? 'Yes' : 'No'} />
              {diagResult.error ? <SettingsRow label="Error" value={diagResult.error} /> : null}
            </View>
          )}
        </SettingsSection>

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

        <SettingsSection title="Vision" icon="🌍">
          <Text style={visionStyles.heroTitle}>Global Use Cases for a Universal Trust Wallet</Text>
          <Text style={visionStyles.heroSub}>Identity, compliance, ownership, healthcare, travel, media, and governance in one verifiable wallet.</Text>
          <View style={visionStyles.badges}>
            <AppBadge label="Passwordless" variant="trusted" size="sm" />
            <AppBadge label="Portable" variant="verified" size="sm" />
            <AppBadge label="Verifiable" variant="pending" size="sm" />
          </View>

          <View style={visionStyles.listWrap}>
            {USE_CASES.map(item => (
              <View key={item.title} style={visionStyles.item}>
                <Text style={visionStyles.itemIcon}>{item.icon}</Text>
                <View style={visionStyles.itemBody}>
                  <Text style={visionStyles.itemTitle}>{item.title}</Text>
                  <Text style={visionStyles.itemSummary}>{item.summary}</Text>
                </View>
              </View>
            ))}
          </View>
        </SettingsSection>

        <SettingsSection title="About" icon="ℹ">
          <SettingsRow label="App" value="Sovereign Trust Passport" />
          <SettingsRow label="Version" value={`${APP_VERSION} (${APP_BUILD})`} />
          <SettingsRow label="Platform" value={Platform.OS === 'ios' ? 'iOS' : 'Android'} />
          <SettingsRow label="OS Version" value={String(Platform.Version)} />
        </SettingsSection>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const SettingsSection: React.FC<{
  title: string;
  icon: string;
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

const SettingsRow: React.FC<{
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}> = ({ label, value, mono, children }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    {children ? children : (
      <Text style={[rowStyles.value, mono && rowStyles.mono]} numberOfLines={1}>
        {value}
      </Text>
    )}
  </View>
);

const sectionStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 4 },
  icon: { fontSize: 12 },
  title: { ...typo.label, color: colors.text.quaternary },
  card: {},
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.hairline,
  },
  label: { ...typo.body, color: colors.text.secondary, flex: 0.45 },
  value: { ...typo.bodySm, color: colors.text.tertiary, flex: 0.55, textAlign: 'right' },
  mono: { ...typo.mono, fontSize: 10, color: colors.text.quaternary },
});

const trustEngineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  left: { flex: 1, gap: 3 },
  label: { ...typo.body, color: colors.text.secondary },
  sub: { ...typo.caption, color: colors.text.quaternary },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { ...typo.title3, color: colors.brand.primary, lineHeight: 22 },
});

const visionStyles = StyleSheet.create({
  heroTitle: { ...typo.headline, color: colors.text.primary, marginBottom: 4 },
  heroSub: { ...typo.caption, color: colors.text.tertiary, marginBottom: 8, lineHeight: 17 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  listWrap: { gap: 8 },
  item: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: radius.xl,
    backgroundColor: colors.glass.subtle,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  itemIcon: { fontSize: 13, marginTop: 1 },
  itemBody: { flex: 1 },
  itemTitle: { ...typo.body, color: colors.text.secondary, marginBottom: 2 },
  itemSummary: { ...typo.caption, color: colors.text.quaternary, lineHeight: 16 },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 66 : 46,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  title: { ...typo.headline, color: colors.text.primary },
  scroll: { paddingHorizontal: 20, paddingBottom: 128 },
  diagBtn: { marginBottom: 8 },
  diagResult: { marginTop: 4 },
  authStatusWrap: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.glass.subtle,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  authStatusText: {
    ...typo.caption,
    color: colors.text.secondary,
  },
  bubble: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: colors.brand.primaryDim,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    right: -35,
    top: 36,
  },
});

export default SettingsScreen;
