/**
 * AppButton
 *
 * Variants:
 *   primary   — cyan glass, neon glow border
 *   secondary — neutral glass, subtle border
 *   ghost     — transparent, hairline border
 *   danger    — crimson tint
 *   trust     — adopts a TrustState colour
 *
 * Features:
 *   • Spring press-scale feedback (0.97×)
 *   • Animated loading dots
 *   • Optional left/right icon slot
 *   • Disabled + loading states
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
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'trust';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  trustState?:   TrustState;       // used when variant === 'trust'
  iconLeft?:     React.ReactNode;
  iconRight?:    React.ReactNode;
  disabled?:     boolean;
  loading?:      boolean;
  fullWidth?:    boolean;
  style?:        StyleProp<ViewStyle>;
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE: Record<ButtonSize, { height: number; ph: number; br: number }> = {
  xs: { height: 30, ph: 10, br: radius.md  },
  sm: { height: 36, ph: 14, br: radius.lg  },
  md: { height: 48, ph: 20, br: radius.xl  },
  lg: { height: 54, ph: 26, br: radius['2xl'] },
  xl: { height: 62, ph: 32, br: radius['3xl'] },
};

const TYPOGRAPHY: Record<ButtonSize, object> = {
  xs: typography.buttonXs,
  sm: typography.buttonSm,
  md: typography.button,
  lg: typography.button,
  xl: typography.buttonLg,
};

// ─── Variant resolver ─────────────────────────────────────────────────────────

const resolveVariantColors = (
  variant: ButtonVariant,
  trustState?: TrustState,
): { bg: string; border: string; text: string; glow?: object } => {
  switch (variant) {
    case 'primary':
      return {
        bg:     colors.brand.primaryDim,
        border: colors.brand.primary,
        text:   colors.brand.primary,
        glow:   shadows.glowPrimary,
      };
    case 'secondary':
      return {
        bg:     colors.glass.medium,
        border: colors.border.medium,
        text:   colors.text.primary,
      };
    case 'ghost':
      return {
        bg:     colors.transparent,
        border: colors.border.subtle,
        text:   colors.text.secondary,
      };
    case 'danger':
      return {
        bg:     colors.trust.revoked.dim,
        border: colors.trust.revoked.solid,
        text:   colors.trust.revoked.solid,
        glow:   shadows.glowRevoked,
      };
    case 'trust': {
      const t = TRUST_COLORS[trustState ?? 'verified'];
      const glowKey = `glow${capitalise(trustState ?? 'verified')}` as keyof typeof shadows;
      return {
        bg:     t.dim,
        border: t.solid,
        text:   t.solid,
        glow:   shadows[glowKey] as object | undefined,
      };
    }
    default:
      return { bg: colors.glass.medium, border: colors.border.light, text: colors.text.primary };
  }
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Loading dots ─────────────────────────────────────────────────────────────

const LoadingDots: React.FC<{ color: string }> = ({ color }) => {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(d, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
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
  const scale = useRef(new Animated.Value(1)).current;
  const sizeConfig   = SIZE[size];
  const variantStyle = resolveVariantColors(variant, trustState);
  const typographyStyle = TYPOGRAPHY[size];

  const handlePressIn  = useCallback(() => {
    Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, speed: 60, bounciness: 2 }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 9 }).start();
  }, [scale]);

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
            backgroundColor:   variantStyle.bg,
            borderColor:       variantStyle.border,
            transform:         [{ scale }],
            opacity:           disabled ? 0.38 : 1,
            alignSelf:         fullWidth ? 'stretch' : 'flex-start',
          },
          variant === 'primary' && variantStyle.glow,
          style,
        ]}
      >
        {iconLeft  && !loading && <View style={styles.iconLeft}>{iconLeft}</View>}

        {loading ? (
          <LoadingDots color={variantStyle.text} />
        ) : (
          <Text style={[typographyStyle, { color: variantStyle.text }]}>
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
    borderWidth: 1,
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});

export default AppButton;
