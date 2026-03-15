/**
 * TrustScoreRing
 *
 * Animated arc-progress ring for the trust score.
 * Uses the two-half-mask technique (pure JS / Animated) —
 * zero native module dependencies.
 *
 * Props:
 *   score   0–100
 *   size    outer diameter (default 96)
 *   label   text below the number (default "Trust Score")
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors }           from '../../../theme/colors';
import { radius }           from '../../../theme/radius';
import {
  TRUST_SCORE_HIGH,
  TRUST_SCORE_MEDIUM,
  trustScoreLabel,
}                           from '../../../constants/appConstants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  label:   t.label   ?? {},
  caption: t.captionSm ?? t.caption ?? {},
  display: t.display ?? {},
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrustScoreRingProps {
  score:  number;
  size?:  number;
  label?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const clamped     = Math.min(100, Math.max(0, score));
  const arcColor    = scoreColor(clamped);
  const strokeW     = Math.round(size * 0.08);
  const halfSize    = size / 2;
  const innerSize   = size - strokeW * 2;

  const animScore = useRef(new Animated.Value(0)).current;
  const leftRot   = useRef(new Animated.Value(0)).current;
  const rightRot  = useRef(new Animated.Value(0)).current;
  const glowOp    = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const deg  = (clamped / 100) * 360;

    Animated.parallel([
      // Number counter
      Animated.timing(animScore, {
        toValue: clamped, duration: 1100, delay: 300, useNativeDriver: false,
      }),
      // Ring fill
      Animated.sequence([
        Animated.timing(rightRot, {
          toValue:  Math.min(180, deg),
          duration: deg > 180 ? 550 : 1100,
          delay:    300,
          useNativeDriver: true,
        }),
        deg > 180
          ? Animated.timing(leftRot, {
              toValue: deg - 180, duration: 550, useNativeDriver: true,
            })
          : Animated.delay(0),
      ]),
    ]).start();

    // Glow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 1,   duration: 1800, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.45,duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [clamped, animScore, leftRot, rightRot, glowOp]);

  const leftDeg  = leftRot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const rightDeg = rightRot.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[styles.container, { width: size, height: size + 30 }]}>

      {/* Track ring */}
      <View
        style={[
          styles.track,
          {
            width:        size,
            height:       size,
            borderRadius: halfSize,
            borderWidth:  strokeW,
            borderColor:  `${arcColor}1C`,
          },
        ]}
      />

      {/* Glow ring */}
      <Animated.View
        style={[
          styles.track,
          {
            width:         size + 8,
            height:        size + 8,
            borderRadius:  (size + 8) / 2,
            borderWidth:   1,
            borderColor:   arcColor,
            top:           -4,
            left:          -4,
            opacity:       glowOp,
            shadowColor:   arcColor,
            shadowOffset:  { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius:  12,
          },
        ]}
        pointerEvents="none"
      />

      {/* Arc fill — two half-masks */}
      <View
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          width:         size,
          height:        size,
          borderRadius:  halfSize,
          flexDirection: 'row',
        }}
        pointerEvents="none"
      >
        {/* Right half fills first */}
        <View style={{ width: halfSize, height: size, overflow: 'hidden', position: 'absolute', right: 0 }}>
          <Animated.View
            style={{
              position:     'absolute',
              width:        size,
              height:       size,
              borderRadius: halfSize,
              borderWidth:  strokeW,
              borderColor:  arcColor,
              transform:    [{ rotate: rightDeg }],
            }}
          />
        </View>

        {/* Left half fills after 50% */}
        <View style={{ width: halfSize, height: size, overflow: 'hidden', position: 'absolute', left: 0 }}>
          <Animated.View
            style={{
              position:     'absolute',
              width:        size,
              height:       size,
              borderRadius: halfSize,
              borderWidth:  strokeW,
              borderColor:  arcColor,
              right:        0,
              transform:    [{ rotate: leftDeg }],
            }}
          />
        </View>
      </View>

      {/* Inner circle with animated score */}
      <View
        style={[
          styles.inner,
          {
            width:        innerSize,
            height:       innerSize,
            borderRadius: innerSize / 2,
            top:          strokeW,
            left:         strokeW,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.scoreNum,
            {
              color:    arcColor,
              fontSize: size * 0.26,
            },
          ]}
        >
          {animScore.interpolate({
            inputRange:  [0, 100],
            outputRange: ['0', '100'],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any}
        </Animated.Text>
      </View>

      {/* Labels below ring */}
      <Text style={[styles.stateLabel, { color: arcColor, marginTop: size + 8 }]}>
        {trustScoreLabel(clamped).toUpperCase()}
      </Text>
      <Text style={styles.sublabel}>{label}</Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position:   'relative',
  },
  track: {
    position: 'absolute',
    top:      0,
    left:     0,
  },
  inner: {
    position:        'absolute',
    backgroundColor: colors.bg.elevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scoreNum: {
    ...typo.display,
    fontWeight:  '800',
    lineHeight:  undefined,
  },
  stateLabel: {
    ...typo.label,
    letterSpacing: 1.5,
    position:      'absolute',
  },
  sublabel: {
    ...typo.caption,
    color:    colors.text.quaternary,
    marginTop: 2,
    position: 'absolute',
  },
});

export default TrustScoreRing;
