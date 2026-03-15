import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, type TrustState } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export type GlowState = TrustState | 'primary' | 'none';

export interface GlassCardProps {
  children: React.ReactNode;
  glowState?: GlowState;
  /** How many tap layers this card supports (default 1 = no reveal) */
  revealLayers?: 1 | 2 | 3;
  onTapLayer?: (layer: number) => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  // Backwards-compatible props accepted by older callers — ignored if present
  padding?: string;
  animateGlow?: boolean;
}

const GLOW_COLOR: Record<GlowState, string> = {
  verified: colors.trust.verified.solid,
  trusted: colors.trust.trusted.solid,
  suspicious: colors.trust.suspicious.solid,
  revoked: colors.trust.revoked.solid,
  pending: colors.trust.pending.solid,
  unknown: colors.trust.unknown.solid,
  primary: colors.brand.primary,
  none: colors.transparent,
};

const GLOW_DIM: Record<GlowState, string> = {
  verified: colors.trust.verified.dim,
  trusted: colors.trust.trusted.dim,
  suspicious: colors.trust.suspicious.dim,
  revoked: colors.trust.revoked.dim,
  pending: colors.trust.pending.dim,
  unknown: colors.trust.unknown.dim,
  primary: colors.brand.primaryDim,
  none: colors.transparent,
};

const GLOW_SHADOW: Record<GlowState, object> = {
  verified: shadows.glowVerified,
  trusted: shadows.glowTrusted,
  suspicious: shadows.glowSuspicious,
  revoked: shadows.glowRevoked,
  pending: shadows.glowPending,
  unknown: {},
  primary: shadows.glowPrimary,
  none: {},
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowState = 'none',
  revealLayers = 1,
  onTapLayer,
  style,
  contentStyle,
  disabled = false,
}) => {
  const [tapLayer, setTapLayer] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(glowState !== 'none' ? 1 : 0)).current;

  // Pulse glow on mount if there's a trust state
  React.useEffect(() => {
    if (glowState === 'none') return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.3,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [glowState, glowAnim]);

  const handlePress = useCallback(() => {
    if (disabled || revealLayers <= 1) return;

    const nextLayer = (tapLayer + 1) % (revealLayers + 1);
    setTapLayer(nextLayer);
    onTapLayer?.(nextLayer);

    // Press haptic spring
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
    ]).start();
  }, [disabled, revealLayers, tapLayer, onTapLayer, scaleAnim]);

  const borderColor = glowState !== 'none' ? GLOW_COLOR[glowState] : colors.border.light;
  const bgTint = glowState !== 'none' ? GLOW_DIM[glowState] : colors.glass.light;
  const glowShadow = glowState !== 'none' ? GLOW_SHADOW[glowState] : shadows.md;

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={disabled || revealLayers <= 1}>
      <Animated.View
        style={[
          styles.card,
          {
            borderColor,
            backgroundColor: bgTint,
            transform: [{ scale: scaleAnim }],
          },
          glowShadow,
          style,
        ]}
      >
        {/* Inner highlight line at top */}
        <View
          style={[
            styles.topHighlight,
            { backgroundColor: glowState !== 'none' ? GLOW_COLOR[glowState] : colors.border.medium },
          ]}
        />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  topHighlight: {
    height: 1,
    opacity: 0.6,
    marginHorizontal: 16,
  },
  content: {
    padding: 20,
  },
});

export default GlassCard;