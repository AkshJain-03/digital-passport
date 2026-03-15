/**
 * HomeScreen
 *
 * Layout:
 *   1. Animated greeting header + live trust score
 *   2. WalletSummarySection — DID hero card
 *   3. QuickActionsSection  — 2×2 action grid
 *   4. RecentVerificationsSection — horizontal credential scroll
 *   5. TrustHighlightsSection — trust network alerts
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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { colors }             from '../../theme/colors';
import { radius }             from '../../theme/radius';
import { AppSectionTitle }    from '../../components/common/AppSectionTitle';
import { LoadingState }       from '../../components/common/LoadingState';
import { EmptyState }         from '../../components/common/EmptyState';
import { useCredentialStore } from '../../hooks/useCredentialStore';
import { MOCK_IDENTITY }      from '../../constants/mockData';
import { ROUTES, type RootStackParamList, type TabParamList } from '../../app/routes';
import type { CredentialWithIssuer } from '../../models/credential';

import { WalletSummarySection }       from './sections/WalletSummarySection';
import { QuickActionsSection }        from './sections/QuickActionsSection';
import { RecentVerificationsSection } from './sections/RecentVerificationsSection';
import { TrustHighlightsSection, type TrustHighlight } from './sections/TrustHighlightsSection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title1:  t.title1   ?? {},
  title2:  t.title2   ?? {},
  caption: t.captionSm ?? t.caption ?? {},
};

type Nav = BottomTabNavigationProp<TabParamList>;

const TAB_CLEARANCE = Platform.OS === 'ios' ? 110 : 96;

// ─── Mock highlights ──────────────────────────────────────────────────────────

const MOCK_HIGHLIGHTS: TrustHighlight[] = [
  {
    id:         'h1',
    title:      'IIT Bombay Degree Verified',
    detail:     'Education credential passed all cryptographic checks.',
    trustState: 'verified',
    timestamp:  new Date(Date.now() - 7_200_000).toISOString(),
    icon:       '🎓',
  },
  {
    id:         'h2',
    title:      'Suspicious Post Detected',
    detail:     'A post from an unverified source has high fraud signals.',
    trustState: 'suspicious',
    timestamp:  new Date(Date.now() - 14_400_000).toISOString(),
    icon:       '⚠',
  },
  {
    id:         'h3',
    title:      'AWS Cert Expiring Soon',
    detail:     'Your AWS Solutions Architect cert expires in 28 days.',
    trustState: 'pending',
    timestamp:  new Date(Date.now() - 86_400_000).toISOString(),
    icon:       '☁️',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const {
    credentials, isLoading, error,
    trustScore, verifiedCount, refresh,
  } = useCredentialStore();

  const [refreshing, setRefreshing] = useState(false);

  const headerAnim   = useRef(new Animated.Value(0)).current;
  const sectionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim,   { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(sectionsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, sectionsAnim]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const identity = { ...MOCK_IDENTITY, trustScore, credentialCount: credentials.length };

  const scoreColor =
    trustScore >= 80 ? colors.trust.verified.solid   :
    trustScore >= 50 ? colors.trust.suspicious.solid :
    colors.trust.revoked.solid;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* ── Animated greeting header ─────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity:   headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1], outputRange: [-10, 0],
              }),
            }],
          },
        ]}
      >
        <View>
          <Text style={styles.greeting}>Good morning ☀</Text>
          <Text style={styles.pageTitle}>Sovereign Trust</Text>
        </View>

        {/* Live trust score pill */}
        <TouchableOpacity
          style={[styles.scorePill, { borderColor: `${scoreColor}50` }]}
          onPress={() => nav.navigate(ROUTES.PASSPORT)}
          activeOpacity={0.8}
        >
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{trustScore}</Text>
          <Text style={styles.scoreLabel}>Trust</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Main scroll ──────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: TAB_CLEARANCE }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        <Animated.View style={{ opacity: sectionsAnim }}>

          {/* Wallet summary */}
          <WalletSummarySection
            identity={identity}
            trustScore={trustScore}
            onViewAll={() => nav.navigate(ROUTES.PASSPORT)}
          />

          {/* Quick actions */}
          <View style={styles.section}>
            <AppSectionTitle title="Quick Actions" spacing="normal" />
            <QuickActionsSection
              onScan={()     => nav.navigate(ROUTES.SCAN)}
              onVerify={()   => nav.navigate(ROUTES.VERIFY)}
              onPassport={() => nav.navigate(ROUTES.PASSPORT)}
              onProduct={()  => nav.navigate(ROUTES.VERIFY)}
            />
          </View>

          {/* Recent credentials */}
          <View style={styles.section}>
            <AppSectionTitle
              title="Recent Credentials"
              count={credentials.length}
              actionLabel="View all"
              onAction={() => (nav as any).navigate(ROUTES.CREDENTIAL_LIST)}
              spacing="normal"
            />
            {isLoading ? (
              <LoadingState message="Loading…" />
            ) : credentials.length === 0 ? (
              <EmptyState
                icon="◈"
                title="No credentials"
                description="Scan a credential QR to get started."
                glowState="primary"
              />
            ) : (
              <RecentVerificationsSection
                credentials={credentials.slice(0, 6)}
                onPress={() => (nav as any).navigate(ROUTES.CREDENTIAL_LIST)}
              />
            )}
          </View>

          {/* Trust highlights */}
          <View style={styles.section}>
            <AppSectionTitle title="Trust Highlights" spacing="normal" />
            <TrustHighlightsSection highlights={MOCK_HIGHLIGHTS} />
          </View>

        </Animated.View>
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
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    marginBottom:      16,
  },
  greeting: {
    ...typo.caption,
    color:         colors.text.quaternary,
    letterSpacing: 0.4,
  },
  pageTitle: {
    ...typo.title1,
    color:     colors.text.primary,
    marginTop: 3,
  },
  scorePill: {
    alignItems:        'center',
    backgroundColor:   colors.glass.medium,
    borderRadius:      radius['2xl'],
    borderWidth:       1,
    paddingHorizontal: 14,
    paddingVertical:   8,
  },
  scoreNum: {
    ...typo.title2,
    lineHeight: 26,
    fontWeight: '700',
  },
  scoreLabel: {
    ...typo.caption,
    color:     colors.text.quaternary,
    marginTop: 1,
  },
  content:  { gap: 0 },
  section:  { marginTop: 20 },
});

export default HomeScreen;
