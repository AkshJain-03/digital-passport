/**
 * AppBadge
 *
 * Small pill label expressing trust state, category, or status.
 *
 * Colour is driven by TrustState or 'neutral' / 'primary' variants.
 * Supports an optional leading dot that pulses for 'pending' state.
 *
 * Sizes:
 *   sm  — 9px label, tight padding   (inside dense cards)
 *   md  — 10px label                 (default)
 *   lg  — 12px label, wider padding  (standalone callouts)
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
  TRUST_STATE_LABELS,
  type TrustState,
} from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { typography } from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = TrustState | 'neutral' | 'primary';
export type BadgeSize    = 'sm' | 'md' | 'lg';

export interface AppBadgeProps {
  /** Text shown inside the badge. Defaults to the TrustState label if omitted. */
  label?:   string;

  /** Colour variant */
  variant?: BadgeVariant;

  /** Show leading dot indicator */
  dot?:     boolean;

  /** Size preset */
  size?:    BadgeSize;

  /** Extra container styles */
  style?:   StyleProp<ViewStyle>;
}

// ─── Badge token resolver ─────────────────────────────────────────────────────

interface BadgeTokens {
  text:   string;
  bg:     string;
  border: string;
  dot:    string;
}

const resolveTokens = (variant: BadgeVariant): BadgeTokens => {
  if (variant === 'neutral') {
    return {
      text:   colors.text.secondary,
      bg:     colors.glass.medium,
      border: colors.border.light,
      dot:    colors.text.tertiary,
    };
  }
  if (variant === 'primary') {
    return {
      text:   colors.brand.primary,
      bg:     colors.brand.primaryDim,
      border: colors.brand.primary,
      dot:    colors.brand.primary,
    };
  }
  const t = TRUST_COLORS[variant as TrustState];
  return {
    text:   t.solid,
    bg:     t.dim,
    border: t.solid,
    dot:    t.solid,
  };
};

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<BadgeSize, { ph: number; pv: number; dotSize: number }> = {
  sm: { ph: 6,  pv: 2, dotSize: 4 },
  md: { ph: 8,  pv: 3, dotSize: 5 },
  lg: { ph: 10, pv: 4, dotSize: 6 },
};

const SIZE_TYPOGRAPHY: Record<BadgeSize, object> = {
  sm: { ...typography.label,   fontSize: 9  },
  md: { ...typography.label,   fontSize: 10 },
  lg: { ...typography.labelMd, fontSize: 11 },
};

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

const PulsingDot: React.FC<{ color: string; size: number; shouldPulse: boolean }> = ({
  color,
  size,
  shouldPulse,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shouldPulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0,  duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shouldPulse, pulse]);

  return (
    <Animated.View
      style={{
        width:        size,
        height:       size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginRight:  5,
        opacity:      pulse,
      }}
    />
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'neutral',
  dot     = false,
  size    = 'md',
  style,
}) => {
  const tokens      = resolveTokens(variant);
  const sizeConfig  = SIZE_CONFIG[size];
  const textStyle   = SIZE_TYPOGRAPHY[size];
  const isTrustState = !['neutral', 'primary'].includes(variant);
  const displayLabel = label ?? (isTrustState ? TRUST_STATE_LABELS[variant as TrustState] : '');
  const shouldPulse  = variant === 'pending' && dot;

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.ph,
          paddingVertical:   sizeConfig.pv,
          backgroundColor:   tokens.bg,
          borderColor:       tokens.border,
        },
        style,
      ]}
    >
      {dot && (
        <PulsingDot
          color={tokens.dot}
          size={sizeConfig.dotSize}
          shouldPulse={shouldPulse}
        />
      )}
      <Text style={[textStyle, { color: tokens.text }]}>
        {displayLabel.toUpperCase()}
      </Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    alignSelf:      'flex-start',
    borderRadius:   radius.full,
    borderWidth:    1,
  },
});

export default AppBadge;
