/**
 * ScanOverlay
 *
 * Animated QR scanner frame:
 *  • Outer neon glow ring — pulses with trust-state colour, springs on result
 *  • Four corner brackets with independent opacity pulse
 *  • Sweeping laser beam with glow shadow
 *  • Frosted glass viewport
 *  • Result tint fill on verification complete
 *  • Particle dots that drift upward while scanning (pure JS, no deps)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors }         from '../../../theme/colors';
import { radius }         from '../../../theme/radius';
import type { TrustState } from '../../../theme/colors';

interface ScanOverlayProps {
  size?:       number;
  trustState?: TrustState | null;
  scanning?:   boolean;
}

// Particle config
const PARTICLE_COUNT = 5;
const makeParticle = () => ({
  x:     Math.random(),           // 0–1 relative to size
  anim:  new Animated.Value(0),
  delay: Math.random() * 1400,
  size:  2 + Math.random() * 2,
});

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  size       = 260,
  trustState = null,
  scanning   = true,
}) => {
  const beam          = useRef(new Animated.Value(0)).current;
  const glowOpacity   = useRef(new Animated.Value(0.45)).current;
  const cornerOpacity = useRef(new Animated.Value(0.6)).current;
  const ringScale     = useRef(new Animated.Value(1)).current;
  const resultFill    = useRef(new Animated.Value(0)).current;
  const particles     = useRef(Array.from({ length: PARTICLE_COUNT }, makeParticle)).current;

  const accentColor = trustState
    ? (colors.trust[trustState]?.solid ?? colors.brand.primary)
    : colors.brand.primary;
  const glowColor = trustState
    ? (colors.trust[trustState]?.solid ?? colors.brand.primary)
    : colors.brand.primary;

  // Beam sweep
  useEffect(() => {
    if (!scanning) { beam.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beam, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(beam, { toValue: 0, duration: 0,    useNativeDriver: true }),
        Animated.delay(200),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanning, beam]);

  // Glow ring pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 1,    duration: 900, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowOpacity]);

  // Corner bracket pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerOpacity, { toValue: 1,    duration: 650, useNativeDriver: true }),
        Animated.timing(cornerOpacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cornerOpacity]);

  // Particles drift upward while scanning
  useEffect(() => {
    if (!scanning) return;
    particles.forEach(p => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, { toValue: 1, duration: 2200, useNativeDriver: true }),
          Animated.timing(p.anim, { toValue: 0, duration: 0,    useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => particles.forEach(p => p.anim.stopAnimation());
  }, [scanning, particles]);

  // Spring scale + result tint on trust state arrival
  useEffect(() => {
    if (!trustState) return;
    Animated.parallel([
      Animated.spring(ringScale, {
        toValue: 1.05, useNativeDriver: true, speed: 16, bounciness: 10,
      }),
      Animated.timing(resultFill, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() =>
      Animated.spring(ringScale, {
        toValue: 1, useNativeDriver: true, speed: 16,
      }).start(),
    );
  }, [trustState, ringScale, resultFill]);

  const beamY = beam.interpolate({ inputRange: [0, 1], outputRange: [0, size - 2] });

  return (
    <View style={[styles.wrapper, { width: size + 48, height: size + 48 }]}>

      {/* ── Outer neon glow ring ────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width:        size + 36,
            height:       size + 36,
            borderRadius: radius['3xl'],
            borderColor:  accentColor,
            shadowColor:  glowColor,
            opacity:      glowOpacity,
            transform:    [{ scale: ringScale }],
          },
        ]}
      />

      {/* ── Second softer outer ring (depth) ───────────────────────────── */}
      <Animated.View
        style={[
          styles.glowRingOuter,
          {
            width:        size + 48,
            height:       size + 48,
            borderRadius: radius['3xl'] + 6,
            borderColor:  accentColor,
            shadowColor:  glowColor,
            opacity:      Animated.multiply(glowOpacity, 0.35),
            transform:    [{ scale: ringScale }],
          },
        ]}
      />

      {/* ── Scanner viewport ────────────────────────────────────────────── */}
      <View
        style={[
          styles.window,
          { width: size, height: size, borderRadius: radius.xl },
        ]}
      >
        {/* Frosted overlay */}
        <View style={styles.frost} />

        {/* Corner brackets */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <Animated.View
            key={pos}
            style={[
              styles.corner,
              styles[pos],
              { borderColor: accentColor, opacity: cornerOpacity },
            ]}
          />
        ))}

        {/* Laser beam */}
        {scanning && (
          <Animated.View
            style={[
              styles.beam,
              {
                backgroundColor: accentColor,
                shadowColor:     accentColor,
                transform:       [{ translateY: beamY }],
              },
            ]}
          />
        )}

        {/* Drift particles */}
        {scanning && particles.map((p, i) => {
          const y = p.anim.interpolate({ inputRange: [0, 1], outputRange: [size * 0.9, -10] });
          const op = p.anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.9, 0.7, 0] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left:            p.x * (size - 8),
                  width:           p.size,
                  height:          p.size,
                  borderRadius:    p.size / 2,
                  backgroundColor: accentColor,
                  opacity:         op,
                  transform:       [{ translateY: y }],
                },
              ]}
            />
          );
        })}

        {/* Result tint fill */}
        {trustState && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: `${accentColor}14`,
                borderRadius:    radius.xl,
                opacity:         resultFill,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const CORNER = 26;
const BW     = 3;

const styles = StyleSheet.create({
  wrapper: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  glowRing: {
    position:      'absolute',
    borderWidth:   1.5,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius:  20,
  },
  glowRingOuter: {
    position:      'absolute',
    borderWidth:   1,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius:  32,
  },
  window: {
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
  },
  frost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,8,16,0.50)',
  },
  corner: {
    position:     'absolute',
    width:        CORNER,
    height:       CORNER,
    borderWidth:  BW,
    borderRadius: 5,
  },
  tl: { top: 0,    left: 0,    borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0,    right: 0,   borderLeftWidth:  0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0,    borderRightWidth: 0, borderTopWidth:    0 },
  br: { bottom: 0, right: 0,   borderLeftWidth:  0, borderTopWidth:    0 },
  beam: {
    position:      'absolute',
    left:          0,
    right:         0,
    height:        2,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius:  10,
  },
  particle: {
    position: 'absolute',
    bottom:   0,
  },
});
