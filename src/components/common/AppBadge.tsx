/**
 * AppBadge — Liquid Glass Edition
 *
 * Glass pill with:
 *   • Semi-transparent tinted bg
 *   • Edge emission line (trust colour)
 *   • Pulsing dot for pending state
 *   • Top reflection strip
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

export type BadgeVariant = TrustState | 'neutral' | 'primary';
export type BadgeSize    = 'sm' | 'md' | 'lg';

export interface AppBadgeProps {
  label?:   string;
  variant?: BadgeVariant;
  dot?:     boolean;
  size?:    BadgeSize;
  style?:   StyleProp<ViewStyle>;
}

interface BadgeTokens {
  text:   string;
  bg:     string;
  border: string;
  dot:    string;
  glow:   string;
}

const resolveTokens = (variant: BadgeVariant): BadgeTokens => {
  if (variant === 'neutral') {
    return {
      text:   colors.text.secondary,
      bg:     'rgba(5,9,25,0.60)',
      border: colors.border.light,
      dot:    colors.text.tertiary,
      glow:   'transparent',
    };
  }
  if (variant === 'primary') {
    return {
      text:   colors.brand.primary,
      bg:     colors.brand.primaryDim,
      border: colors.brand.primary,
      dot:    colors.brand.primary,
      glow:   colors.brand.primaryGlow,
    };
  }
  const t = TRUST_COLORS[variant as TrustState];
  return {
    text:   t.solid,
    bg:     t.dim,
    border: t.solid,
    dot:    t.solid,
    glow:   t.glow,
  };
};

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

const PulsingDot: React.FC<{ color: string; size: number; shouldPulse: boolean }> = ({
  color, size, shouldPulse,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shouldPulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
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
        shadowColor:  color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius:  4,
      }}
    />
  );
};

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant     = 'neutral',
  dot         = false,
  size        = 'md',
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
          shadowColor:       tokens.glow,
        },
        style,
      ]}
    >
      {/* Top reflection */}
      <View style={styles.topEdge} />

      {dot && (
        <PulsingDot color={tokens.dot} size={sizeConfig.dotSize} shouldPulse={shouldPulse} />
      )}
      <Text style={[textStyle, { color: tokens.text }]}>
        {displayLabel.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    alignSelf:      'flex-start',
    borderRadius:   radius.full,
    borderWidth:    1,
    overflow:       'hidden',
    position:       'relative',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.40,
    shadowRadius:   6,
  },
  topEdge: {
    position:        'absolute',
    top:             0,
    left:            6,
    right:           6,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
});

export default AppBadge;
