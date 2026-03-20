/**
 * QRVerificationResultScreen — Apple Wallet-style verification result
 *
 * Displayed after scanning a QR code. Shows credential details in a
 * premium glass card with animated reveal and trust badge.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors }      from '../../theme/colors';
import { radius }      from '../../theme/radius';
import { typography }  from '../../theme/typography';
import { shadows }     from '../../theme/shadows';
import { GlassCard }   from '../../components/common/GlassCard';
import { AppButton }   from '../../components/common/AppButton';
import { LiquidBackButton } from '../../components/common/LiquidBackButton';
import { ROUTES, type RootStackParamList } from '../../app/routes';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, typeof ROUTES.QR_VERIFICATION_RESULT>;

// ─── Credential interface ─────────────────────────────────────────────────────

interface ScannedCredential {
  type?:       string;
  title?:      string;
  issuer?:     string;
  holder?:     string;
  issuedAt?:   string;
  expiresAt?:  string;
  trustState?: string;
}

// ─── Trust state helpers ──────────────────────────────────────────────────────

const TRUST_EMOJI: Record<string, string> = {
  verified:   '✓',
  trusted:    '✓',
  suspicious: '⚠',
  revoked:    '✕',
  pending:    '⏳',
  unknown:    '?',
};

const TRUST_LABEL: Record<string, string> = {
  verified:   'Verified',
  trusted:    'Trusted',
  suspicious: 'Suspicious',
  revoked:    'Revoked',
  pending:    'Pending',
  unknown:    'Unknown',
};

const resolveTrustColor = (state: string): string => {
  const ts = state as keyof typeof colors.trust;
  return colors.trust[ts]?.solid ?? colors.brand.primary;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const QRVerificationResultScreen: React.FC = () => {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();

  // Parse payload safely
  let credential: ScannedCredential = {};
  try {
    const parsed = JSON.parse(route.params?.payload ?? '{}');
    if (parsed && typeof parsed === 'object') {
      credential = parsed as ScannedCredential;
    }
  } catch {
    // Fallback to empty credential
  }

  const trustState = credential.trustState ?? 'unknown';
  const trustColor = resolveTrustColor(trustState);
  const glowState  = (trustState === 'verified' || trustState === 'trusted' ||
                      trustState === 'suspicious' || trustState === 'revoked' ||
                      trustState === 'pending' || trustState === 'unknown')
    ? (trustState as import('../../theme/colors').GlowState)
    : ('primary' as const);

  // Animations
  const cardScale   = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale  = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const glowPulse   = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      // Card entrance
      Animated.parallel([
        Animated.spring(cardScale,   { toValue: 1, speed: 12, bounciness: 6, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Badge pop
      Animated.spring(badgeScale, { toValue: 1, speed: 14, bounciness: 10, useNativeDriver: true }),
      // Details reveal
      Animated.timing(detailsAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    // Glow pulse loop
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [cardScale, cardOpacity, badgeScale, detailsAnim, glowPulse]);

  const detailsTranslateY = detailsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const fields: { label: string; value: string }[] = [
    { label: 'Issuer',      value: credential.issuer    ?? '—' },
    { label: 'Credential',  value: credential.title     ?? '—' },
    { label: 'Holder',      value: credential.holder    ?? '—' },
    { label: 'Issued',      value: credential.issuedAt  ?? '—' },
    { label: 'Expires',     value: credential.expiresAt ?? 'No expiry' },
    { label: 'Trust State', value: TRUST_LABEL[trustState] ?? trustState },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LiquidBackButton onPress={() => nav.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Verification Result</Text>
          <Text style={styles.headerSub}>Credential scanned successfully</Text>
        </View>

        {/* Main credential card */}
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          }}
        >
          <GlassCard
            glowState={glowState}
            animateGlow
            padding="none"
            style={styles.card}
            disabled
          >
            {/* Top accent stripe */}
            <View style={[styles.stripe, { backgroundColor: trustColor }]} />

            <View style={styles.cardInner}>
              {/* Trust badge */}
              <Animated.View
                style={[
                  styles.badgeWrap,
                  {
                    borderColor: `${trustColor}60`,
                    backgroundColor: `${trustColor}14`,
                    shadowColor: trustColor,
                    transform: [{ scale: badgeScale }],
                  },
                ]}
              >
                <Text style={[styles.badgeIcon, { color: trustColor }]}>
                  {TRUST_EMOJI[trustState] ?? '?'}
                </Text>
              </Animated.View>

              {/* Title */}
              <Text style={styles.credTitle}>
                {credential.title ?? 'Unknown Credential'}
              </Text>
              <Text style={styles.credIssuer}>
                by {credential.issuer ?? 'Unknown Issuer'}
              </Text>

              {/* Trust pill */}
              <View style={[styles.trustPill, {
                borderColor: `${trustColor}50`,
                backgroundColor: `${trustColor}14`,
              }]}>
                <View style={[styles.trustDot, { backgroundColor: trustColor }]} />
                <Text style={[styles.trustText, { color: trustColor }]}>
                  {(TRUST_LABEL[trustState] ?? trustState).toUpperCase()}
                </Text>
              </View>

              {/* Details */}
              <Animated.View
                style={[
                  styles.detailsWrap,
                  {
                    opacity: detailsAnim,
                    transform: [{ translateY: detailsTranslateY }],
                  },
                ]}
              >
                <View style={[styles.divider, { backgroundColor: `${trustColor}30` }]} />

                {fields.map((field, i) => (
                  <View
                    key={field.label}
                    style={[
                      styles.fieldRow,
                      i > 0 && { borderTopWidth: 1, borderTopColor: colors.border.hairline },
                    ]}
                  >
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldValue}>{field.value}</Text>
                  </View>
                ))}
              </Animated.View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            label="Scan Another"
            onPress={() => nav.goBack()}
            variant="primary"
            fullWidth
          />
          <AppButton
            label="Done"
            onPress={() => nav.popToTop()}
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default QRVerificationResultScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 104 : 86,
    paddingBottom: 112,
  },

  header: {
    marginBottom: 24,
  },
  headerTitle: {
    ...typography.title1,
    color: colors.text.primary,
  },
  headerSub: {
    ...typography.bodySm,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  card: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  stripe: {
    height: 3,
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
  },

  badgeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.glowVerified,
  },
  badgeIcon: {
    fontSize: 28,
    fontWeight: '700',
  },

  credTitle: {
    ...typography.title2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  credIssuer: {
    ...typography.bodySm,
    color: colors.text.tertiary,
    marginBottom: 16,
  },

  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: 20,
  },
  trustDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  trustText: {
    ...typography.label,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  detailsWrap: {
    width: '100%',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },

  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.text.quaternary,
    letterSpacing: 0.5,
  },
  fieldValue: {
    ...typography.bodySm,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  actions: {
    gap: 12,
  },
});
