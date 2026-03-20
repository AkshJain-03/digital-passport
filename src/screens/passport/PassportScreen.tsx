/**
 * PassportScreen
 *
 * The identity hub — user's sovereign DID, hardware key,
 * trust score, credential wallet preview, and security info.
 *
 * Layout:
 *   1. Page header
 *   2. IdentityCard (hero DID card)
 *   3. IdentityStats (credential / issuer / verified pills)
 *   4. TrustScoreRing + status
 *   5. Recent credentials (mini rows)
 *   6. Hardware security card
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors }              from '../../theme/colors';
import { radius }              from '../../theme/radius';
import { AppSectionTitle }     from '../../components/common/AppSectionTitle';
import { AppBadge }            from '../../components/common/AppBadge';
import { GlassCard }           from '../../components/common/GlassCard';
import { LoadingState }        from '../../components/common/LoadingState';
import { EmptyState }          from '../../components/common/EmptyState';
import { useCredentialStore }  from '../../hooks/useCredentialStore';
import { useBiometricAuth }    from '../../hooks/useBiometricAuth';
import { MOCK_IDENTITY }       from '../../constants/mockData';
import type { CredentialWithIssuer } from '../../models/credential';
import { CREDENTIAL_TYPE_META }      from '../../models/credential';

import { IdentityCard }          from './components/IdentityCard';
import { IdentityStats }         from './components/IdentityStats';
import { TrustScoreRing }        from './components/TrustScoreRing';
import { CredentialQRSheet }     from '../credentials/components/CredentialQRSheet';
import { CredentialDetailSheet } from '../credentials/components/CredentialDetailSheet';
import { ROUTES, type RootStackParamList } from '../../app/routes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title1:   t.title1   ?? {},
  title3:   t.title3   ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  label:    t.label    ?? {},
  body:     t.bodySm   ?? t.body     ?? {},
  mono:     t.mono     ?? {},
  button:   t.buttonXs ?? t.button   ?? {},
};

const TAB_CLEARANCE = Platform.OS === 'ios' ? 128 : 112;

// ─── Component ────────────────────────────────────────────────────────────────

export const PassportScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    credentials, isLoading, error,
    trustScore, verifiedCount,
    refresh, verify, remove,
  } = useCredentialStore();

  const { checkSupport, biometryType } = useBiometricAuth();

  const [refreshing,    setRefreshing]    = useState(false);
  const [qrTarget,      setQrTarget]      = useState<CredentialWithIssuer | null>(null);
  const [detailTarget,  setDetailTarget]  = useState<CredentialWithIssuer | null>(null);
  const [qrVisible,     setQrVisible]     = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const headerFade  = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSupport();
    Animated.stagger(120, [
      Animated.timing(headerFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [checkSupport, headerFade, contentFade]);

  const identity    = { ...MOCK_IDENTITY, trustScore, credentialCount: credentials.length };
  const recentCreds = credentials.slice(0, 3);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleShare = useCallback((cred: CredentialWithIssuer) => {
    setQrTarget(cred);
    setQrVisible(true);
  }, []);

  const handleCardPress = useCallback((cred: CredentialWithIssuer) => {
    setDetailTarget(cred);
    setDetailVisible(true);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.pageHeader, { opacity: headerFade }]}>
        <View>
          <Text style={styles.greeting}>Your Identity</Text>
          <Text style={styles.pageTitle}>Sovereign Passport</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          activeOpacity={0.7}
          onPress={() => nav.navigate(ROUTES.SETTINGS)}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_CLEARANCE }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        <Animated.View style={{ opacity: contentFade }}>

          {/* ── Identity card ────────────────────────────────────────────── */}
          <IdentityCard identity={identity} />

          {/* ── Stats row ────────────────────────────────────────────────── */}
          <IdentityStats identity={identity} verifiedCount={verifiedCount} />

          {/* ── Trust score ring + label ─────────────────────────────────── */}
          <View style={styles.ringSection}>
            <TrustScoreRing score={identity.trustScore} size={112} label="Trust Score" />
            <View style={styles.ringMeta}>
              <Text style={styles.ringMetaTitle}>Identity Strength</Text>
              <Text style={styles.ringMetaBody}>
                Your trust score reflects the number and quality of verified
                credentials bound to your DID.
              </Text>
              <AppBadge
                label={identity.status === 'active' ? 'Identity Active' : identity.status}
                variant={identity.status === 'active' ? 'verified' : 'suspicious'}
                size="md"
              />
            </View>
          </View>

          {/* ── Recent credentials ───────────────────────────────────────── */}
          <View style={styles.section}>
            <AppSectionTitle
              title="Recent Credentials"
              count={credentials.length}
              actionLabel={credentials.length > 3 ? 'View all' : undefined}
              spacing="normal"
            />

            {isLoading ? (
              <LoadingState message="Loading credentials…" />
            ) : error ? (
              <EmptyState
                icon="⚠"
                title="Couldn't load"
                description={error}
                glowState="suspicious"
              />
            ) : recentCreds.length === 0 ? (
              <EmptyState
                icon="◈"
                title="No credentials yet"
                description="Scan a QR code to add your first credential."
                glowState="primary"
              />
            ) : (
              <View style={styles.credList}>
                {recentCreds.map((cred, i) => (
                  <MiniCredentialRow
                    key={cred.id}
                    credential={cred}
                    index={i}
                    onPress={() => handleCardPress(cred)}
                    onShare={() => handleShare(cred)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Hardware security ────────────────────────────────────────── */}
          <View style={styles.section}>
            <AppSectionTitle title="Hardware Security" spacing="normal" />
            <HardwareSecurityCard
              fingerprint={identity.hardwareKey.fingerprint}
              algorithm={identity.hardwareKey.algorithm}
              attestationType={identity.hardwareKey.attestationType}
              biometryType={biometryType}
              isHardwareBacked={identity.hardwareKey.isHardwareBacked}
            />
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── Bottom sheets ────────────────────────────────────────────────── */}
      <CredentialQRSheet
        credential={qrTarget}
        visible={qrVisible}
        onDismiss={() => setQrVisible(false)}
      />
      <CredentialDetailSheet
        credential={detailTarget}
        visible={detailVisible}
        onDismiss={() => setDetailVisible(false)}
        onVerify={verify}
        onShare={cred => {
          setDetailVisible(false);
          setTimeout(() => { setQrTarget(cred); setQrVisible(true); }, 350);
        }}
        onDelete={id => { remove(id); setDetailVisible(false); }}
      />
    </View>
  );
};

// ── Mini credential row ────────────────────────────────────────────────────────

const MiniCredentialRow: React.FC<{
  credential: CredentialWithIssuer;
  index:      number;
  onPress:    () => void;
  onShare:    () => void;
}> = ({ credential, index, onPress, onShare }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const meta = CREDENTIAL_TYPE_META[credential.type];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 340, delay: index * 65, useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{
        opacity:   anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      <TouchableOpacity
        style={[styles.miniRow, { borderLeftColor: meta.accentColor as string }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.miniIcon, { borderColor: `${meta.accentColor as string}50` }]}>
          <Text style={styles.miniEmoji}>{credential.issuer.logoEmoji}</Text>
        </View>
        <View style={styles.miniBody}>
          <Text style={styles.miniTitle} numberOfLines={1}>{credential.title}</Text>
          <Text style={styles.miniIssuer}>{credential.issuer.shortName}</Text>
        </View>
        <View style={styles.miniTrailing}>
          <AppBadge label={credential.trustState} variant={credential.trustState} dot size="sm" />
          <TouchableOpacity onPress={onShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.miniShare}>QR</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Hardware security card ─────────────────────────────────────────────────────

const HardwareSecurityCard: React.FC<{
  fingerprint:      string;
  algorithm:        string;
  attestationType:  string;
  biometryType:     string | null;
  isHardwareBacked: boolean;
}> = ({ fingerprint, algorithm, attestationType, biometryType, isHardwareBacked }) => (
  <GlassCard glowState="trusted" style={styles.hwCard} animateGlow>
    <View style={styles.hwHeader}>
      <Text style={styles.hwIcon}>🔐</Text>
      <View style={styles.hwHeaderBody}>
        <Text style={styles.hwTitle}>
          {isHardwareBacked ? 'Hardware-Backed Key' : 'Software Key'}
        </Text>
        <Text style={styles.hwSub}>{attestationType}</Text>
      </View>
      <AppBadge
        label={isHardwareBacked ? 'Secured' : 'Software'}
        variant={isHardwareBacked ? 'trusted' : 'suspicious'}
        size="sm"
      />
    </View>
    <View style={styles.hwGrid}>
      <HWCell label="FINGERPRINT" value={fingerprint} mono />
      <HWCell label="ALGORITHM"   value={algorithm} />
      <HWCell label="BIOMETRICS"  value={biometryType ?? 'Not available'} />
      <HWCell label="ENCLAVE"     value={attestationType} />
    </View>
  </GlassCard>
);

const HWCell: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label, value, mono,
}) => (
  <View style={hwStyles.cell}>
    <Text style={hwStyles.label}>{label}</Text>
    <Text style={[hwStyles.value, mono && hwStyles.mono]}>{value}</Text>
  </View>
);

const hwStyles = StyleSheet.create({
  cell:  { flex: 1, minWidth: '44%' },
  label: { ...typo.label, color: colors.text.quaternary, fontSize: 8, marginBottom: 2 },
  value: { ...typo.caption, color: colors.text.secondary },
  mono:  { ...typo.mono, color: colors.brand.primary, fontSize: 10 },
});

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: 'transparent',
    paddingTop:      Platform.OS === 'ios' ? 66 : 46,
  },
  pageHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-end',
    paddingHorizontal: 20,
    marginBottom:      20,
  },
  greeting: {
    ...typo.caption,
    color:         colors.text.quaternary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle:    { ...typo.title1, color: colors.text.primary, marginTop: 3 },
  settingsBtn: {
    width:           38,
    height:          38,
    borderRadius:    radius.full,
    backgroundColor: colors.glass.medium,
    borderWidth:     1,
    borderColor:     colors.border.light,
    alignItems:      'center',
    justifyContent:  'center',
  },
  settingsIcon: { fontSize: 16, color: colors.text.tertiary },
  scrollContent: { paddingTop: 8 },
  section:       { marginTop: 24 },

  // Trust ring section
  ringSection: {
    flexDirection:     'row',
    alignItems:        'center',
    marginTop:         24,
    paddingHorizontal: 20,
    gap:               24,
  },
  ringMeta:      { flex: 1 },
  ringMetaTitle: { ...typo.title3, color: colors.text.primary, marginBottom: 6 },
  ringMetaBody:  { ...typo.body, color: colors.text.tertiary, marginBottom: 10, lineHeight: 18 },

  // Mini rows
  credList: {
    paddingHorizontal: 20,
    gap:               10,
  },
  miniRow: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.glass.light,
    borderRadius:     radius['2xl'],
    borderWidth:      1,
    borderColor:      colors.border.subtle,
    borderLeftWidth:  3,
    padding:          12,
    gap:              12,
  },
  miniIcon: {
    width:           40,
    height:          40,
    borderRadius:    radius.lg,
    borderWidth:     1,
    backgroundColor: colors.glass.medium,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  miniEmoji:   { fontSize: 18 },
  miniBody:    { flex: 1, minWidth: 0 },
  miniTitle:   { ...typo.headline, color: colors.text.primary },
  miniIssuer:  { ...typo.caption,  color: colors.text.tertiary, marginTop: 1 },
  miniTrailing: { alignItems: 'flex-end', gap: 5 },
  miniShare: {
    ...typo.button,
    color:             colors.brand.primary,
    borderWidth:       1,
    borderColor:       `${colors.brand.primary}50`,
    borderRadius:      radius.full,
    paddingHorizontal: 6,
    paddingVertical:   2,
  },

  // Hardware card
  hwCard:        { marginHorizontal: 20 },
  hwHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  12,
  },
  hwIcon:       { fontSize: 26 },
  hwHeaderBody: { flex: 1 },
  hwTitle:      { ...typo.headline, color: colors.text.primary },
  hwSub:        { ...typo.caption,  color: colors.text.tertiary, marginTop: 1 },
  hwGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
});

export default PassportScreen;
