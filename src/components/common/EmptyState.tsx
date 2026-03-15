/**
 * EmptyState
 *
 * Used whenever a list or section has no data to display.
 *
 * Anatomy:
 *   • Animated icon ring (pulsing glow halo)
 *   • Large icon / emoji
 *   • Title
 *   • Optional description
 *   • Optional primary action button
 *
 * The icon ring gently pulses using the brand cyan by default, or
 * a trust-state colour when glowState is provided (e.g. "revoked"
 * for an empty revocation list).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  TRUST_COLORS,
  type GlowState,
} from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { spacing }    from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppButton }  from './AppButton';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Unicode symbol or short emoji displayed inside the glow ring */
  icon?: string;

  /** Heading — concise, e.g. "No credentials yet" */
  title: string;

  /** Supporting copy beneath the title */
  description?: string;

  /** Label for the primary CTA button */
  actionLabel?: string;

  /** Called when CTA is tapped */
  onAction?: () => void;

  /** Controls ring glow colour */
  glowState?: GlowState;

  style?: StyleProp<ViewStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon         = '◎',
  title,
  description,
  actionLabel,
  onAction,
  glowState    = 'primary',
  style,
}) => {
  const ringScale   = useRef(new Animated.Value(0.85)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;
  const entryAnim   = useRef(new Animated.Value(0)).current;

  // ── Entry fade + slide ───────────────────────────────────────────────────
  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue:     1,
      useNativeDriver: true,
      speed:       12,
      bounciness:  5,
    }).start();
  }, [entryAnim]);

  // ── Ring pulse loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale,   { toValue: 1.12, duration: 1800, useNativeDriver: true }),
          Animated.timing(ringScale,   { toValue: 0.85, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.9, duration: 1800, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.3, duration: 1800, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ringScale, ringOpacity]);

  // ── Glow colour ──────────────────────────────────────────────────────────
  const glowColor =
    glowState === 'primary' || glowState === 'none'
      ? colors.brand.primary
      : TRUST_COLORS[glowState as keyof typeof TRUST_COLORS]?.solid ?? colors.brand.primary;

  const ringBg =
    glowState === 'primary' || glowState === 'none'
      ? colors.brand.primaryDim
      : TRUST_COLORS[glowState as keyof typeof TRUST_COLORS]?.dim ?? colors.brand.primaryDim;

  const entryStyle = {
    opacity:   entryAnim,
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange:  [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, entryStyle, style]}>
      {/* ── Glow ring ───────────────────────────────────────────────────── */}
      <View style={styles.ringWrap}>
        {/* Outer halo */}
        <Animated.View
          style={[
            styles.halo,
            {
              borderColor:  glowColor,
              transform:    [{ scale: ringScale }],
              opacity:      ringOpacity,
            },
          ]}
        />
        {/* Icon container */}
        <View
          style={[
            styles.iconRing,
            {
              borderColor:     glowColor,
              backgroundColor: ringBg,
            },
          ]}
        >
          <Text style={[styles.icon, { color: glowColor }]}>{icon}</Text>
        </View>
      </View>

      {/* ── Text ─────────────────────────────────────────────────────────── */}
      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="md"
          style={styles.cta}
        />
      ) : null}
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const RING_SIZE  = 80;
const HALO_SIZE  = 108;

const styles = StyleSheet.create({
  container: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
  },
  ringWrap: {
    width:           HALO_SIZE,
    height:          HALO_SIZE,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  halo: {
    position:    'absolute',
    width:       HALO_SIZE,
    height:      HALO_SIZE,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  iconRing: {
    width:           RING_SIZE,
    height:          RING_SIZE,
    borderRadius:    radius.full,
    borderWidth:     1.5,
    alignItems:      'center',
    justifyContent:  'center',
  },
  icon: {
    fontSize:   30,
    lineHeight: 36,
  },
  title: {
    ...typography.title3,
    color:      colors.text.primary,
    textAlign:  'center',
    marginBottom: spacing.xxs,
  },
  description: {
    ...typography.body,
    color:      colors.text.tertiary,
    textAlign:  'center',
    maxWidth:   280,
    lineHeight: 22,
  },
  cta: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;