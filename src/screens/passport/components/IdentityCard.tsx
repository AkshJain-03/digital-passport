/**
 * IdentityCard
 *
 * The hero component of the Passport screen.
 * Visually inspired by a physical identity card / Apple Cash card —
 * rendered as a full-width glass panel with:
 *
 *   • Animated mesh gradient background (cyan → violet sweep)
 *   • User DID (truncated, monospace)
 *   • Hardware key fingerprint with lock icon
 *   • Identity status badge
 *   • Subtle holographic shimmer overlay
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors }       from '../../../theme/colors';
import { radius }       from '../../../theme/radius';
import { shadows }      from '../../../theme/shadows';
import { spacing }      from '../../../theme/spacing';
import { typography }   from '../../../theme/typography';
import { AppBadge }     from '../../../components/common/AppBadge';
import type { Identity } from '../../../models/identity';
import { IDENTITY_STATUS_META } from '../../../models/identity';

interface IdentityCardProps {
  identity: Identity;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glowAnim    = useRef(new Animated.Value(0.6)).current;
  const entryAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry
    Animated.spring(entryAnim, {
      toValue: 1, useNativeDriver: true, speed: 10, bounciness: 5,
    }).start();

    // Shimmer sweep
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 2, duration: 3000, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(shimmerAnim, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.0, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2200, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmerAnim, glowAnim, entryAnim]);

  const shimmerX = shimmerAnim.interpolate({
    inputRange: [-1, 2], outputRange: ['-100%' as any, '300%' as any],
  });

  const statusMeta = IDENTITY_STATUS_META[identity.status];
  const trustVariant = identity.status === 'active' ? 'verified' : 'suspicious';

  // Truncated DID for display
  const displayDid = identity.did.length > 30
    ? identity.did.slice(0, 16) + '…' + identity.did.slice(-8)
    : identity.did;

  return (
    <Animated.View
      style={[
        styles.card,
        shadows.glowTrusted,
        {
          opacity: entryAnim,
          transform: [
            { scale: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      {/* ── Background gradient mesh ─────────────────────────────────────── */}
      <View style={styles.meshBg}>
        {/* Cyan orb top-right */}
        <Animated.View style={[styles.orb, styles.orbCyan, { opacity: glowAnim }]} />
        {/* Violet orb bottom-left */}
        <Animated.View style={[styles.orb, styles.orbViolet, { opacity: glowAnim }]} />
      </View>

      {/* ── Holographic shimmer ──────────────────────────────────────────── */}
      <Animated.View
        style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
        pointerEvents="none"
      />

      {/* ── Card content ─────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {/* Top row: app name + status */}
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

        {/* Alias */}
        <Text style={styles.alias}>{identity.alias}</Text>

        {/* DID */}
        <View style={styles.didRow}>
          <Text style={styles.didLabel}>DID</Text>
          <Text style={styles.didValue} numberOfLines={1}>{displayDid}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row: fingerprint + key info */}
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
            <Text style={styles.keyAlgorithm}>
              {identity.hardwareKey.algorithm} · {identity.hardwareKey.attestationType}
            </Text>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.sectionLabel}>TRUST SCORE</Text>
            <Text style={styles.scoreValue}>{identity.trustScore}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom card edge stripe ──────────────────────────────────────── */}
      <View style={styles.bottomStripe} />
    </Animated.View>
  );
};

const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  card: {
    height:          CARD_HEIGHT,
    borderRadius:    radius['4xl'],
    borderWidth:     1,
    borderColor:     colors.trust.trusted.solid,
    backgroundColor: colors.bg.elevated,
    overflow:        'hidden',
    position:        'relative',
    marginHorizontal: spacing.xs,
  },
  meshBg: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position:     'absolute',
    width:        200,
    height:       200,
    borderRadius: 100,
    opacity:      0.15,
  },
  orbCyan: {
    top:    -60,
    right:  -40,
    backgroundColor: colors.brand.primary,
  },
  orbViolet: {
    bottom: -80,
    left:   -40,
    backgroundColor: colors.brand.secondary,
  },
  shimmer: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           '40%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform:       [{ skewX: '-20deg' }],
  },
  content: {
    flex:    1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  appLabel: {
    ...typography.label,
    color:    colors.brand.primary,
    fontSize: 9,
  },
  cardType: {
    ...typography.caption,
    color:     colors.text.tertiary,
    marginTop: 1,
  },
  alias: {
    ...typography.title1,
    color:    colors.text.primary,
    marginTop: spacing.xxs,
  },
  didRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     spacing.xxs,
  },
  didLabel: {
    ...typography.label,
    color:    colors.text.quaternary,
    fontSize: 8,
  },
  didValue: {
    ...typography.mono,
    color: colors.text.tertiary,
    flex:  1,
  },
  divider: {
    height:          1,
    backgroundColor: colors.border.subtle,
    marginVertical:  spacing.xxs,
  },
  bottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  keySection: {
    flex: 1,
  },
  sectionLabel: {
    ...typography.label,
    color:        colors.text.quaternary,
    fontSize:     8,
    marginBottom: 3,
  },
  fingerprintRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  lockIcon: {
    fontSize: 13,
  },
  fingerprint: {
    ...typography.mono,
    color:    colors.brand.primary,
    fontSize: 12,
  },
  keyAlgorithm: {
    ...typography.caption,
    color:     colors.text.quaternary,
    marginTop: 2,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    ...typography.display,
    color:      colors.trust.verified.solid,
    lineHeight: 48,
  },
  scoreOutOf: {
    ...typography.caption,
    color:     colors.text.tertiary,
    marginTop: -4,
  },
  bottomStripe: {
    height:          3,
    backgroundColor: colors.trust.trusted.solid,
    opacity:         0.6,
  },
});
