/**
 * GlassCard — True liquid glass surface
 *
 * Layer stack:
 *  1) Background blur
 *  2) Translucent material gradient
 *  3) Inner reflections and diagonal shine
 *  4) Edge glow ring
 *  5) Depth shadow and floating motion
 */

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  resolveGlowBorder,
  resolveGlowShadowColor,
  type GlowState,
} from '../../theme/colors';
import { radius } from '../../theme/radius';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GlassCardProps {
  glowState?: GlowState;
  revealLayers?: 1 | 2 | 3;
  onTapLayer?: (layer: number) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  animateGlow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_MAP = { none: 0, sm: 14, md: 18, lg: 22 } as const;

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
  const [cardSize, setCardSize] = useState({ width: 1, height: 1 });

  const hasGlow = glowState !== 'none';
  const borderColor = resolveGlowBorder(glowState);
  const glowShadowColor = resolveGlowShadowColor(glowState);

  const pressProgress = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const wobble = useSharedValue(0);
  const glowPulse = useSharedValue(hasGlow && animateGlow ? 1 : 0.65);
  const floatPhase = useSharedValue(0);
  const lightX = useSharedValue(0.5);
  const lightY = useSharedValue(0.22);
  const shimmerTravel = useSharedValue(0);

  useEffect(() => {
    glowPulse.value = hasGlow && animateGlow ? withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.55, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    ) : withTiming(0.65, { duration: 260 });
  }, [animateGlow, glowPulse, hasGlow]);

  useEffect(() => {
    if (!animateGlow || disabled) {
      floatPhase.value = withTiming(0, { duration: 300 });
      return;
    }

    floatPhase.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [animateGlow, disabled, floatPhase]);

  useEffect(() => {
    shimmerTravel.value = withRepeat(
      withSequence(
        withDelay(900, withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.cubic) })),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [shimmerTravel]);

  const handlePress = useCallback(() => {
    if (disabled || revealLayers <= 1) return;
    const next = tapLayer < revealLayers ? tapLayer + 1 : 0;
    setTapLayer(next);
    onTapLayer?.(next);
  }, [disabled, revealLayers, tapLayer, onTapLayer]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCardSize({ width, height });
    }
  }, []);

  const handlePressIn = useCallback((event: Parameters<NonNullable<React.ComponentProps<typeof Pressable>['onPressIn']>>[0]) => {
    if (disabled) return;
    const nx = Math.max(0, Math.min(1, event.nativeEvent.locationX / Math.max(1, cardSize.width)));
    const ny = Math.max(0, Math.min(1, event.nativeEvent.locationY / Math.max(1, cardSize.height)));

    pressProgress.value = withSpring(1, { damping: 20, stiffness: 280, mass: 0.6 });
    tiltX.value = withSpring((0.5 - ny) * 7, { damping: 17, stiffness: 220, mass: 0.7 });
    tiltY.value = withSpring((nx - 0.5) * 9, { damping: 17, stiffness: 220, mass: 0.7 });
    lightX.value = withTiming(nx, { duration: 180, easing: Easing.out(Easing.quad) });
    lightY.value = withTiming(Math.max(0.1, ny * 0.8), { duration: 180, easing: Easing.out(Easing.quad) });
  }, [cardSize.height, cardSize.width, disabled, lightX, lightY, pressProgress, tiltX, tiltY]);

  const handlePressOut = useCallback(() => {
    pressProgress.value = withSpring(0, { damping: 20, stiffness: 250, mass: 0.7 });

    wobble.value = withSequence(
      withSpring(1, { damping: 7, stiffness: 200, mass: 0.6 }),
      withSpring(-0.45, { damping: 8, stiffness: 190, mass: 0.6 }),
      withSpring(0, { damping: 11, stiffness: 170, mass: 0.7 }),
    );

    tiltX.value = withSpring(0, { damping: 13, stiffness: 150, mass: 0.85 });
    tiltY.value = withSpring(0, { damping: 13, stiffness: 150, mass: 0.85 });
    lightX.value = withTiming(0.5, { duration: 340, easing: Easing.out(Easing.quad) });
    lightY.value = withTiming(0.22, { duration: 340, easing: Easing.out(Easing.quad) });
  }, [lightX, lightY, pressProgress, tiltX, tiltY, wobble]);

  const paddingValue = PADDING_MAP[padding];

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const floatY = interpolate(floatPhase.value, [0, 1], [0, -4]);
    const scale = interpolate(pressProgress.value, [0, 1], [1, 1.02]);
    const wobbleDeg = wobble.value * 0.85;

    return {
      transform: [
        { perspective: 1200 },
        { translateY: floatY },
        { rotateX: `${tiltX.value}deg` },
        { rotateY: `${tiltY.value}deg` },
        { rotateZ: `${wobbleDeg}deg` },
        { scale },
      ],
      shadowOpacity: interpolate(pressProgress.value, [0, 1], [0.22, 0.32]),
      shadowRadius: interpolate(pressProgress.value, [0, 1], [18, 24]),
      shadowOffset: {
        width: 0,
        height: interpolate(pressProgress.value, [0, 1], [12, 16]),
      },
    };
  });

  const edgeGlowStyle = useAnimatedStyle(() => ({
    opacity: hasGlow
      ? interpolate(glowPulse.value, [0.55, 1], [0.35, 0.9])
      : interpolate(pressProgress.value, [0, 1], [0.16, 0.32]),
  }));

  const topHighlightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressProgress.value, [0, 1], [0.55, 0.92]),
    transform: [
      {
        translateX: interpolate(lightX.value, [0, 1], [-14, 14]),
      },
      {
        translateY: interpolate(lightY.value, [0, 1], [-8, 5]),
      },
    ],
  }));

  const diagonalShineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressProgress.value, [0, 1], [0.18, 0.44]),
    transform: [
      { translateX: interpolate(shimmerTravel.value, [0, 1], [-cardSize.width * 0.6, cardSize.width * 0.65]) },
      { translateY: interpolate(lightY.value, [0, 1], [-4, 8]) },
      { rotate: '-18deg' },
    ],
  }));

  const movingSpecularStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressProgress.value, [0, 1], [0.2, 0.58]),
    transform: [
      { translateX: interpolate(lightX.value, [0, 1], [-cardSize.width * 0.35, cardSize.width * 0.35]) },
      { translateY: interpolate(lightY.value, [0, 1], [-16, 16]) },
    ],
  }));

  return (
    <Animated.View style={[styles.shadowShell, styles.depthShadow, containerAnimatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLayout={handleLayout}
        disabled={disabled || revealLayers <= 1}
        style={[
          styles.card,
          {
            borderColor: hasGlow ? borderColor : 'rgba(255,255,255,0.10)',
            backgroundColor: Platform.OS === 'ios'
              ? 'rgba(8,12,24,0.20)'
              : 'rgba(255,255,255,0.03)',
          },
          style,
        ]}
      >
        {/* Layer 1 — background blur */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={16}
            reducedTransparencyFallbackColor="transparent"
          />
        ) : null}

        {/* Layer 2 — translucent glass surface */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(18,28,56,0.18)', 'rgba(8,12,24,0.24)']}
          start={{ x: 0.06, y: 0 }}
          end={{ x: 0.92, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255,255,255,0.06)',
            'rgba(255,255,255,0.04)',
            'rgba(255,255,255,0.02)',
          ]}
          start={{ x: 0.03, y: 0.01 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255,255,255,0.04)',
            'rgba(255,255,255,0.02)',
            'rgba(4,7,16,0.18)',
          ]}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.62, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Layer 3 — inner light reflections */}
        <View pointerEvents="none" style={styles.topLightStrip} />

        <Animated.View pointerEvents="none" style={[styles.topEdgeHighlight, topHighlightStyle]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.20)',
              'rgba(255,255,255,0.08)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.diagonalShine, diagonalShineStyle]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.00)',
              'rgba(255,255,255,0.10)',
              'rgba(255,255,255,0.00)',
            ]}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 1, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.movingSpecular, movingSpecularStyle]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.00)',
              'rgba(255,255,255,0.08)',
              'rgba(255,255,255,0.00)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Layer 4 — edge glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowRing,
            {
              borderColor: hasGlow ? borderColor : 'rgba(255,255,255,0.12)',
              shadowColor: hasGlow ? glowShadowColor : '#00D4FF',
            },
            edgeGlowStyle,
          ]}
        />

        {/* Content */}
        <View style={[styles.content, { padding: paddingValue }, contentStyle]}>
          {children}
        </View>

        {/* Reveal indicator */}
        {revealLayers > 1 && (
          <View
            style={[
              styles.revealDot,
              { backgroundColor: hasGlow ? borderColor : 'rgba(255,255,255,0.12)' },
              { opacity: hasGlow ? 0.3 : 0.18 },
            ]}
          />
        )}

        {/* Layer 5 — bottom depth tint */}
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(0,0,0,0.00)',
            'rgba(4,8,16,0.30)',
          ]}
          start={{ x: 0.5, y: 0.58 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shadowShell: {
    borderRadius: radius['2xl'],
  },
  depthShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 20,
    },
    default: {
      elevation: 12,
    },
  }) as ViewStyle,
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 72,
  },
  topLightStrip: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
    opacity: 0.75,
  },
  topEdgeHighlight: {
    position: 'absolute',
    top: -6,
    left: -12,
    right: -12,
    height: 46,
  },
  diagonalShine: {
    position: 'absolute',
    top: '-22%',
    left: '-40%',
    width: '130%',
    height: '72%',
  },
  movingSpecular: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: '70%',
    height: '50%',
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
  },
  content: {},
  revealDot: {
    alignSelf: 'center',
    width: 24,
    height: 3,
    borderRadius: radius.full,
    opacity: 0.18,
    marginBottom: 10,
    marginTop: -4,
  },
});

export default GlassCard;
