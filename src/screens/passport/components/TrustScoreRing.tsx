/**
 * TrustScoreRing
 *
 * Animated SVG-inspired ring that fills from 0 → score on mount.
 * Built with React Native Animated + borderRadius arc technique
 * so there are zero native module dependencies.
 *
 * The ring uses two half-circle masks (left / right) that rotate
 * to fill proportionally — a pure JS implementation of the
 * "CSS conic progress ring" pattern.
 *
 * Props:
 *   score     0–100
 *   size      outer diameter (default 96)
 *   label     text shown below the number (default "Trust Score")
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors }                 from '../../../theme/colors';
import { radius }                 from '../../../theme/radius';
import { typography }             from '../../../theme/typography';
import {
  TRUST_SCORE_HIGH,
  TRUST_SCORE_MEDIUM,
  trustScoreLabel,
}                                 from '../../../constants/appConstants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrustScoreRingProps {
  score:  number;
  size?:  number;
  label?: string;
}

// ─── Score → ring colour ──────────────────────────────────────────────────────

const scoreColor = (score: number): string => {
  if (score >= TRUST_SCORE_HIGH)   return colors.trust.verified.solid;
  if (score >= TRUST_SCORE_MEDIUM) return colors.trust.pending.solid;
  return colors.trust.revoked.solid;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const TrustScoreRing: React.FC<TrustScoreRingProps> = ({
  score,
  size  = 96,
  label = 'Trust Score',
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const arcColor     = scoreColor(clampedScore);
  const strokeWidth  = size * 0.08;
  const innerSize    = size - strokeWidth * 2;
  const halfSize     = size / 2;

  // Animated score counter
  const animScore  = useRef(new Animated.Value(0)).current;
  const displayRef = useRef(0);

  // Rotation for each half-ring mask
  const leftRot  = useRef(new Animated.Value(0)).current;
  const rightRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const deg   = (clampedScore / 100) * 360;
    const half  = deg / 2;

    // Animate ring fill
    Animated.parallel([
      Animated.timing(animScore, {
        toValue:  clampedScore,
        duration: 1100,
        delay:    300,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(rightRot, {
          toValue:  Math.min(180, deg),
          duration: deg > 180 ? 550 : 1100,
          delay:    300,
          useNativeDriver: true,
        }),
        deg > 180
          ? Animated.timing(leftRot, {
              toValue:  deg - 180,
              duration: 550,
              useNativeDriver: true,
            })
          : Animated.delay(0),
      ]),
    ]).start();
  }, [clampedScore, animScore, leftRot, rightRot]);

  const leftDeg  = leftRot.interpolate({
    inputRange: [0, 180], outputRange: ['0deg', '180deg'],
  });
  const rightDeg = rightRot.interpolate({
    inputRange: [0, 180], outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size + 24 }]}>
      {/* ── Track ring ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.track,
          {
            width:        size,
            height:       size,
            borderRadius: size / 2,
            borderWidth:  strokeWidth,
            borderColor:  arcColor + '1A',
          },
        ]}
      />

      {/* ── Progress ring (two half-masks) ────────────────────────────── */}
      <View
        style={[
          styles.ringWrap,
          { width: size, height: size, borderRadius: halfSize },
        ]}
        pointerEvents="none"
      >
        {/* Right half (fills first) */}
        <View
          style={[
            styles.half,
            styles.halfRight,
            { width: halfSize, height: size, overflow: 'hidden' },
          ]}
        >
          <Animated.View
            style={[
              styles.halfArc,
              {
                width:        size,
                height:       size,
                borderRadius: halfSize,
                borderWidth:  strokeWidth,
                borderColor:  arcColor,
                transform:    [{ rotate: rightDeg }],
                transformOrigin: `${halfSize}px ${halfSize}px`,
              },
            ]}
          />
        </View>

        {/* Left half (fills after 50%) */}
        <View
          style={[
            styles.half,
            styles.halfLeft,
            { width: halfSize, height: size, overflow: 'hidden' },
          ]}
        >
          <Animated.View
            style={[
              styles.halfArc,
              {
                width:        size,
                height:       size,
                borderRadius: halfSize,
                borderWidth:  strokeWidth,
                borderColor:  arcColor,
                transform:    [{ rotate: leftDeg }],
                transformOrigin: `${halfSize}px ${halfSize}px`,
              },
            ]}
          />
        </View>
      </View>

      {/* ── Inner circle content ──────────────────────────────────────── */}
      <View
        style={[
          styles.inner,
          {
            width:        innerSize,
            height:       innerSize,
            borderRadius: innerSize / 2,
            top:          strokeWidth,
            left:         strokeWidth,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.scoreValue,
            { color: arcColor, fontSize: size * 0.28 },
          ]}
        >
          {animScore.interpolate({
            inputRange:  [0, 100],
            outputRange: ['0', '100'],
          }) as any}
        </Animated.Text>
      </View>

      {/* ── Label beneath ring ────────────────────────────────────────── */}
      <Text style={[styles.label, { color: arcColor }]}>
        {trustScoreLabel(clampedScore).toUpperCase()}
      </Text>
      <Text style={styles.sublabel}>{label}</Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems:    'center',
    position:      'relative',
  },
  track: {
    position: 'absolute',
    top: 0, left: 0,
  },
  ringWrap: {
    position:  'absolute',
    top:       0,
    left:      0,
    flexDirection: 'row',
  },
  half: {
    position: 'absolute',
    top:      0,
  },
  halfRight: { right: 0 },
  halfLeft:  { left: 0 },
  halfArc: {
    position: 'absolute',
    top: 0, left: 0,
  },
  inner: {
    position:        'absolute',
    backgroundColor: colors.bg.elevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scoreValue: {
    ...typography.display,
    fontWeight: '800',
    lineHeight: undefined,
  },
  label: {
    ...typography.label,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  sublabel: {
    ...typography.captionSm,
    color: colors.text.quaternary,
    marginTop: 2,
  },
});

export default TrustScoreRing;