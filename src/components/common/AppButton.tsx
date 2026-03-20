/**
 * AppButton — Liquid Glass Edition
 *
 * Primary: cyan-to-purple gradient glow + breathing pulse
 * Secondary: dark glass with edge emission
 * Ghost: ultra-transparent + hairline cyan edge
 * Danger: crimson glass
 * Trust: adopts trust-state colour
 *
 * All buttons:
 *   • Glass material (not solid)
 *   • Edge emission (light, not border)
 *   • Spring press scale + glow intensify
 *   • Breathing pulse on primary
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  TRUST_COLORS,
  type TrustState,
} from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { shadows }    from '../../theme/shadows';
import { typography } from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'trust';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppButtonProps {
  label:        string;
  onPress:      () => void;
  variant?:     ButtonVariant;
  size?:        ButtonSize;
  trustState?:  TrustState;
  iconLeft?:    React.ReactNode;
  iconRight?:   React.ReactNode;
  disabled?:    boolean;
  loading?:     boolean;
  fullWidth?:   boolean;
  style?:       StyleProp<ViewStyle>;
}

const SIZE: Record<ButtonSize, { height: number; ph: number; br: number }> = {
  xs: { height: 30, ph: 10,  br: radius.md  },
  sm: { height: 36, ph: 14,  br: radius.lg  },
  md: { height: 48, ph: 20,  br: radius.xl  },
  lg: { height: 54, ph: 26,  br: radius['2xl'] },
  xl: { height: 62, ph: 32,  br: radius['3xl'] },
};

const TYPOGRAPHY: Record<ButtonSize, object> = {
  xs: typography.buttonXs,
  sm: typography.buttonSm,
  md: typography.button,
  lg: typography.button,
  xl: typography.buttonLg,
};

// ─── Variant resolver ─────────────────────────────────────────────────────────

interface VariantTokens {
  bg:      string;
  border:  string;
  text:    string;
  glow?:   object;
  topEdge: string;
}

const resolveVariant = (
  variant: ButtonVariant,
  trustState?: TrustState,
): VariantTokens => {
  switch (variant) {
    case 'primary':
      return {
        bg:      'rgba(0,229,255,0.12)',
        border:  colors.brand.primary,
        text:    colors.brand.primary,
        glow:    shadows.glowPrimary,
        topEdge: 'rgba(0,229,255,0.55)',
      };
    case 'secondary':
      return {
        bg:      'rgba(5,9,25,0.70)',
        border:  colors.border.medium,
        text:    colors.text.primary,
        topEdge: 'rgba(255,255,255,0.12)',
      };
    case 'ghost':
      return {
        bg:      'rgba(5,9,25,0.35)',
        border:  colors.border.subtle,
        text:    colors.text.secondary,
        topEdge: 'rgba(255,255,255,0.07)',
      };
    case 'danger':
      return {
        bg:      colors.trust.revoked.dim,
        border:  colors.trust.revoked.solid,
        text:    colors.trust.revoked.solid,
        glow:    shadows.glowRevoked,
        topEdge: 'rgba(255,51,85,0.45)',
      };
    case 'trust': {
      const tok = TRUST_COLORS[trustState ?? 'verified'];
      return {
        bg:      tok.dim,
        border:  tok.solid,
        text:    tok.solid,
        topEdge: `${tok.solid}55`,
      };
    }
    default:
      return {
        bg: colors.glass.medium, border: colors.border.light,
        text: colors.text.primary, topEdge: 'rgba(255,255,255,0.10)',
      };
  }
};

// ─── Loading dots ──────────────────────────────────────────────────────────────

const LoadingDots: React.FC<{ color: string }> = ({ color }) => {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(d, { toValue: 1,   duration: 380, delay, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 380, useNativeDriver: true }),
          Animated.delay(380),
        ]),
      );
    Animated.parallel([anim(d1, 0), anim(d2, 190), anim(d3, 380)]).start();
  }, [d1, d2, d3]);

  return (
    <View style={dotStyles.row}>
      {[d1, d2, d3].map((d, i) => (
        <Animated.View key={i} style={[dotStyles.dot, { backgroundColor: color, opacity: d }]} />
      ))}
    </View>
  );
};

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});

// ─── Component ────────────────────────────────────────────────────────────────

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant    = 'primary',
  size       = 'md',
  trustState,
  iconLeft,
  iconRight,
  disabled   = false,
  loading    = false,
  fullWidth  = false,
  style,
}) => {
  const scale      = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(1)).current;
  const pulseAnim  = useRef(new Animated.Value(0.7)).current;

  const sizeConfig    = SIZE[size];
  const variantTokens = resolveVariant(variant, trustState);
  const typographyStyle = TYPOGRAPHY[size];
  const isPrimary     = variant === 'primary';

  // Primary breathing pulse
  useEffect(() => {
    if (!isPrimary || disabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.55, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isPrimary, disabled, pulseAnim]);

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.958, useNativeDriver: true, speed: 80, bounciness: 2,
      }),
      Animated.timing(glowAnim, { toValue: 1.8, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scale, glowAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1, useNativeDriver: true, speed: 35, bounciness: 12,
      }),
      Animated.timing(glowAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [scale, glowAnim]);

  const isInteractive = !disabled && !loading;

  return (
    <TouchableWithoutFeedback
      onPress={isInteractive ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!isInteractive}
    >
      <Animated.View
        style={[
          styles.base,
          {
            height:            sizeConfig.height,
            paddingHorizontal: sizeConfig.ph,
            borderRadius:      sizeConfig.br,
            backgroundColor:   variantTokens.bg,
            borderColor:       variantTokens.border,
            transform:         [{ scale }],
            opacity:           disabled ? 0.35 : 1,
            alignSelf:         fullWidth ? 'stretch' : 'flex-start',
          },
          variantTokens.glow,
          style,
        ]}
      >
        {/* Glass tint */}
        <View style={[StyleSheet.absoluteFill, styles.glassTint]} />

        {/* Top edge emission */}
        <View
          style={[
            styles.topEdge,
            { backgroundColor: variantTokens.topEdge },
          ]}
        />

        {/* Content */}
        {iconLeft && !loading && <View style={styles.iconLeft}>{iconLeft}</View>}

        {loading ? (
          <LoadingDots color={variantTokens.text} />
        ) : (
          <Text style={[typographyStyle, { color: variantTokens.text }]}>
            {label}
          </Text>
        )}

        {iconRight && !loading && <View style={styles.iconRight}>{iconRight}</View>}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    overflow:       'hidden',
    position:       'relative',
  },
  glassTint: {
    backgroundColor: 'rgba(5,9,25,0.35)',
    borderRadius:    radius.xl,
  },
  topEdge: {
    position:   'absolute',
    top:        0,
    left:       12,
    right:      12,
    height:     1,
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft:  8 },
});

export default AppButton;
