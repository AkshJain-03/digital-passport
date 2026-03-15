/**
 * IdentityCard
 *
 * Hero component for the Passport screen — a full-width glass panel
 * styled like a physical identity card:
 *
 *   • Animated cyan + violet orb mesh gradient
 *   • Sweeping holographic shimmer
 *   • DID (monospace, truncated)
 *   • Hardware key fingerprint + lock icon
 *   • Identity status badge
 *   • Live trust score
 *   • Bottom neon accent stripe
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import { AppBadge } from '../../../components/common/AppBadge';
import type { Identity } from '../../../models/identity';
import { IDENTITY_STATUS_META } from '../../../models/identity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  label:    t.label    ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  title1:   t.title1   ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  mono:     t.mono     ?? {},
  display:  t.display  ?? {},
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface IdentityCardProps {
  identity: Identity;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glowAnim    = useRef(new Animated.Value(0.55)).current;
  const entryAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry spring
    Animated.spring(entryAnim, {
      toValue: 1, useNativeDriver: true, speed: 10, bounciness: 5,
    }).start();

    // Shimmer sweep — cycles every ~5.5 s
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 2, duration: 2800, useNativeDriver: true }),
        Animated.delay(2700),
        Animated.timing(shimmerAnim, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    ).start();

    // Orb glow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.0, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.45, duration: 2400, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmerAnim, glowAnim, entryAnim]);

  const shimmerX = shimmerAnim.interpolate({
    inputRange:  [-1, 2],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputRange: ['-100%' as any, '300%' as any],
  });

  const statusMeta    = IDENTITY_STATUS_META[identity.status];
  const trustVariant  = identity.status === 'active' ? 'verified' : 'suspicious';
  const scoreColor    = identity.trustScore >= 80
    ? colors.trust.verified.solid
    : identity.trustScore >= 50
    ? colors.trust.suspicious.solid
    : colors.trust.revoked.solid;

  // Shortened DID for card display
  const displayDid = identity.did.length > 32
    ? `${identity.did.slice(0, 16)}…${identity.did.slice(-8)}`
    : identity.did;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity:   entryAnim,
          transform: [
            {
              scale: entryAnim.interpolate({
                inputRange: [0, 1], outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* ── Background mesh orbs ─────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.orb, styles.orbCyan,   { opacity: glowAnim }]} />
        <Animated.View style={[styles.orb, styles.orbViolet, { opacity: glowAnim }]} />
      </View>

      {/* ── Holographic shimmer ──────────────────────────────────────────── */}
      <Animated.View
        style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
        pointerEvents="none"
      />

      {/* ── Card content ─────────────────────────────────────────────────── */}
      <View style={styles.content}>

        {/* Top row: app brand + status badge */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.appLabel}>SOVEREIGN TRUST</Text>
            <Text style={styles.cardType}>Identity Passport</Text>
          </View>
          <AppBadge
            label={statusMeta.label}
            variant={trustVariant}
            dot
            size="sm"
          />
        </View>

        {/* Alias / display name */}
        <Text style={styles.alias}>{identity.alias}</Text>

        {/* DID row */}
        <View style={styles.didRow}>
          <Text style={styles.didLabel}>DID</Text>
          <Text style={styles.didValue} numberOfLines={1}>{displayDid}</Text>
        </View>

        <View style={styles.divider} />

        {/* Bottom row: hardware key left, trust score right */}
        <View style={styles.bottomRow}>
          <View style={styles.keySection}>
            <Text style={styles.sectionLabel}>HARDWARE KEY</Text>
            <View style={styles.fingerprintRow}>
              <Text style={styles.lockIcon}>
                {identity.hardwareKey.isHardwareBacked ? '🔐' : '🔑'}
              </Text>
              <Text style={styles.fingerprint}>
                {identity.hardwareKey.fingerprint}
              </Text>
            </View>
            <Text style={styles.keyAlgo}>
              {identity.hardwareKey.algorithm} · {identity.hardwareKey.attestationType}
            </Text>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.sectionLabel}>TRUST SCORE</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {identity.trustScore}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom accent stripe ─────────────────────────────────────────── */}
      <View style={styles.bottomStripe} />
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 222;

const styles = StyleSheet.create({
  card: {
    height:           CARD_HEIGHT,
    borderRadius:     radius['4xl'],
    borderWidth:      1,
    borderColor:      colors.trust.trusted.solid,
    backgroundColor:  colors.bg.elevated,
    overflow:         'hidden',
    position:         'relative',
    marginHorizontal: 16,
    // iOS glow
    shadowColor:      colors.brand.primary,
    shadowOffset:     { width: 0, height: 0 },
    shadowOpacity:    0.35,
    shadowRadius:     24,
    elevation:        12,
  },

  // Orbs
  orb: {
    position:     'absolute',
    width:        200,
    height:       200,
    borderRadius: 100,
    opacity:      0.14,
  },
  orbCyan: {
    top:             -60,
    right:           -40,
    backgroundColor: colors.brand.primary,
  },
  orbViolet: {
    bottom:          -80,
    left:            -40,
    backgroundColor: colors.brand.secondary,
  },

  // Shimmer
  shimmer: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           '38%',
    backgroundColor: 'rgba(255,255,255,0.035)',
    transform:       [{ skewX: '-20deg' }],
  },

  // Content
  content: {
    flex:           1,
    padding:        20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  appLabel: {
    ...typo.label,
    color:    colors.brand.primary,
    fontSize: 9,
  },
  cardType: {
    ...typo.caption,
    color:     colors.text.tertiary,
    marginTop: 1,
  },
  alias: {
    ...typo.title1,
    color:     colors.text.primary,
    marginTop: 8,
  },

  // DID
  didRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     4,
  },
  didLabel: {
    ...typo.label,
    color:    colors.text.quaternary,
    fontSize: 8,
  },
  didValue: {
    ...typo.mono,
    color: colors.text.tertiary,
    flex:  1,
  },

  divider: {
    height:          1,
    backgroundColor: colors.border.subtle,
    marginVertical:  8,
  },

  // Bottom row
  bottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  keySection: { flex: 1 },
  sectionLabel: {
    ...typo.label,
    color:        colors.text.quaternary,
    fontSize:     8,
    marginBottom: 3,
  },
  fingerprintRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  lockIcon:    { fontSize: 13 },
  fingerprint: {
    ...typo.mono,
    color:    colors.brand.primary,
    fontSize: 12,
  },
  keyAlgo: {
    ...typo.caption,
    color:     colors.text.quaternary,
    marginTop: 2,
    fontSize:  10,
  },

  // Score
  scoreSection: { alignItems: 'flex-end' },
  scoreValue: {
    ...typo.display,
    lineHeight: 48,
    fontWeight: '800',
  },
  scoreOutOf: {
    ...typo.caption,
    color:     colors.text.tertiary,
    marginTop: -4,
  },

  // Stripe
  bottomStripe: {
    height:          3,
    backgroundColor: colors.trust.trusted.solid,
    opacity:         0.55,
  },
});

export default IdentityCard;
