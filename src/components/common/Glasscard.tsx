/**
 * GlassCard
 *
 * The core visual primitive for Sovereign Trust.
 *
 * Features:
 *  • Glassmorphism surface (semi-transparent, layered border)
 *  • Animated trust-state glow (pulsing shadow + neon border)
 *  • Animated shimmer gradient across the card top
 *  • Progressive tap reveal (up to 3 layers) with spring expansion
 *  • Press scale feedback
 *
 * Trust states drive border colour, background tint, and shadow colour:
 *   verified   → #00FF88 green glow
 *   trusted    → #0A84FF blue glow
 *   suspicious → #FF8C00 amber glow
 *   revoked    → #FF3355 red glow
 *   pending    → #FFD60A gold glow
 *   primary    → #00D4FF cyan glow (brand)
 *   none       → neutral glass
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  resolveGlowBg,
  resolveGlowBorder,
  resolveGlowShadowColor,
  type GlowState,
} from '../../theme/colors';
import { radius } from '../../theme/radius';
import { GLOW_SHADOW } from '../../theme/shadows';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GlassCardProps {
  /** Trust/glow state controls the border and shadow hue */
  glowState?: GlowState;

  /**
   * Number of tap layers supported.
   *   1 = single surface, no progressive reveal
   *   2 = tap once to reveal details
   *   3 = tap again to reveal trust graph
   */
  revealLayers?: 1 | 2 | 3;

  /** Fires with the new layer index (0 = collapsed) on each tap */
  onTapLayer?: (layer: number) => void;

  /** Card content */
  children: React.ReactNode;

  /** Extra styles on the outer container */
  style?: StyleProp<ViewStyle>;

  /** Extra styles on the inner content wrapper */
  contentStyle?: StyleProp<ViewStyle>;

  /** Disable tap interactions */
  disabled?: boolean;

  /** Whether to animate the glow pulse on mount */
  animateGlow?: boolean;

  /** Padding size variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// ─── Padding map ──────────────────────────────────────────────────────────────

const PADDING_MAP = { none: 0, sm: 12, md: 16, lg: 20 } as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const GlassCard: React.FC<GlassCardProps> = ({
  glowState = 'none',
  revealLayers = 1,
  onTapLayer,
  children,
  style,
  contentStyle,
  disabled = false,
  animateGlow = true,
  padding = 'md',
}) => {
  const [tapLayer, setTapLayer] = useState(0);

  // ── Animated values ──────────────────────────────────────────────────────
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const glowPulse   = useRef(new Animated.Value(0.7)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const expandAnim  = useRef(new Animated.Value(0)).current;

  // ── Derived colours ──────────────────────────────────────────────────────
  const borderColor  = resolveGlowBorder(glowState);
  const bgColor      = resolveGlowBg(glowState);
  const shadowColor  = resolveGlowShadowColor(glowState);
  const glowShadow   = GLOW_SHADOW[glowState];
  const hasGlow      = glowState !== 'none';

  // ── Glow pulse loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasGlow || !animateGlow) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.15, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.70, duration: 2400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowState, hasGlow, animateGlow, glowPulse]);

  // ── Shimmer sweep loop ───────────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 2,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  // ── Expand animation on layer change ─────────────────────────────────────
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: tapLayer,
      useNativeDriver: false, // height can't use native driver
      speed: 18,
      bounciness: 5,
    }).start();
  }, [tapLayer, expandAnim]);

  // ── Press handler ────────────────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (disabled || revealLayers <= 1) return;
    const next = tapLayer < revealLayers ? tapLayer + 1 : 0;
    setTapLayer(next);
    onTapLayer?.(next);
  }, [disabled, revealLayers, tapLayer, onTapLayer]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.974,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  // ── Shimmer translateX ───────────────────────────────────────────────────
  const shimmerTranslate = useMemo(
    () =>
      shimmerAnim.interpolate({
        inputRange: [-1, 2],
        outputRange: ['-100%' as any, '100%' as any],
      }),
    [shimmerAnim],
  );

  const paddingValue = PADDING_MAP[padding];

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || revealLayers <= 1}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor,
            backgroundColor: bgColor,
            transform: [{ scale: scaleAnim }],
          },
          hasGlow && glowShadow,
          style,
        ]}
      >
        {/* ── Top highlight line (inner) ─────────────────────────────────── */}
        <View
          style={[
            styles.topHighlight,
            { backgroundColor: hasGlow ? borderColor : colors.border.medium },
          ]}
        />

        {/* ── Animated shimmer overlay ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
          pointerEvents="none"
        />

        {/* ── Content ───────────────────────────────────────────────────── */}
        <View style={[styles.content, { padding: paddingValue }, contentStyle]}>
          {children}
        </View>

        {/* ── Bottom reveal indicator ────────────────────────────────────── */}
        {revealLayers > 1 && (
          <View
            style={[
              styles.revealDot,
              { backgroundColor: hasGlow ? borderColor : colors.border.medium },
            ]}
          />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topHighlight: {
    height: 1,
    opacity: 0.55,
    marginHorizontal: 20,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: colors.gradient.shimmer[1],
    opacity: 0.4,
  },
  content: {
    // padding set inline
  },
  revealDot: {
    alignSelf: 'center',
    width: 20,
    height: 3,
    borderRadius: radius.full,
    opacity: 0.35,
    marginBottom: 10,
    marginTop: -4,
  },
});

export default GlassCard;
