import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppSectionTitle } from '../../components/common/AppSectionTitle';

import { WalletSummarySection } from './sections/WalletSummarySection';
import { QuickActionsSection } from './sections/Quickactionssection ';
import { RecentVerificationsSection } from './sections/RecentVerificationsSection';
import { TrustHighlightsSection } from './sections/TrustHighlightsSection';

// Height reserved for the floating tab bar
const TAB_BAR_CLEARANCE = Platform.OS === 'ios' ? 112 : 96;

export const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentEntry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentEntry, {
        toValue: 1,
        duration: 700,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, contentEntry]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh — replace with real data fetch
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.appName}>Sovereign Trust</Text>
          </View>
          <View style={styles.notifBtn}>
            <Text style={styles.notifIcon}>◎</Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </Animated.View>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_CLEARANCE },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        {/* Wallet Summary */}
        <Animated.View
          style={{
            opacity: contentEntry,
            transform: [
              {
                translateY: contentEntry.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <WalletSummarySection 
            identity={{
              did: 'did:example:user123',
              alias: 'My Identity',
              hardwareKey: {
                fingerprint: 'A3:4F:9C',
                keyId: 'key123',
                algorithm: 'EC P-256',
                attestationType: 'SecureEnclave',
                createdAt: new Date().toISOString(),
                lastUsedAt: new Date().toISOString(),
                isHardwareBacked: true,
              },
              status: 'active',
              trustScore: 85,
              credentialCount: 5,
              issuerCount: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            trustScore={85}
            onViewAll={() => {}}
          />
        </Animated.View>

        {/* Quick Actions */}
        <Section delay={150} entryAnim={contentEntry}>
          <AppSectionTitle title="Quick Actions" style={styles.sectionTitle} />
          <QuickActionsSection />
        </Section>

        {/* Recent Verifications */}
        <Section delay={250} entryAnim={contentEntry}>
          <AppSectionTitle
            title="Recent Verifications"
            actionLabel="See all"
            onAction={() => {}}
            style={styles.sectionTitle}
          />
          <RecentVerificationsSection />
        </Section>

        {/* Trust Highlights */}
        <Section delay={350} entryAnim={contentEntry}>
          <AppSectionTitle
            title="Trust Highlights"
            actionLabel="View feed"
            onAction={() => {}}
            style={styles.sectionTitle}
          />
          <TrustHighlightsSection />
        </Section>
      </Animated.ScrollView>
    </View>
  );
};

// Staggered entry wrapper
const Section: React.FC<{
  children: React.ReactNode;
  delay: number;
  entryAnim: Animated.Value;
}> = ({ children, delay, entryAnim }) => {
  const localAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(localAnim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, [localAnim, delay]);

  return (
    <Animated.View
      style={{
        opacity: localAnim,
        transform: [
          {
            translateY: localAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
        marginBottom: spacing.xl,
      }}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.bg.base,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.base,
  },
  greeting: {
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  appName: {
    ...typography.title1,
    color: colors.text.primary,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
});

export default HomeScreen;