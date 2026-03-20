/**
 * LiquidAmbientBackground
 *
 * Deep-space layered background with:
 *   • Base gradient: #05070F → #0A0F2C → #120A3A
 *   • Two animated radial glow orbs (cyan + purple)
 *   • Subtle noise grain overlay
 *   • Optional faint mesh grid lines
 *
 * Used as root background in App.tsx and wraps screens
 * that need the full ambient depth effect.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

interface LiquidAmbientBackgroundProps {
  children?: React.ReactNode;
}

export const LiquidAmbientBackground: React.FC<LiquidAmbientBackgroundProps> = ({
  children,
}) => {
  // Cyan orb drift animation
  const cyanX  = useRef(new Animated.Value(0)).current;
  const cyanY  = useRef(new Animated.Value(0)).current;
  const cyanOp = useRef(new Animated.Value(0.18)).current;

  // Purple orb drift animation
  const purpleX  = useRef(new Animated.Value(0)).current;
  const purpleY  = useRef(new Animated.Value(0)).current;
  const purpleOp = useRef(new Animated.Value(0.14)).current;

  // Third accent orb (deep blue)
  const blueOp = useRef(new Animated.Value(0.10)).current;

  useEffect(() => {
    // Cyan orb — slow drift
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cyanX,  { toValue: 30,  duration: 9000, useNativeDriver: true }),
          Animated.timing(cyanY,  { toValue: -20, duration: 9000, useNativeDriver: true }),
          Animated.timing(cyanOp, { toValue: 0.28, duration: 4500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(cyanX,  { toValue: -15, duration: 9000, useNativeDriver: true }),
          Animated.timing(cyanY,  { toValue: 25,  duration: 9000, useNativeDriver: true }),
          Animated.timing(cyanOp, { toValue: 0.14, duration: 4500, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    // Purple orb — opposite phase
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(purpleX,  { toValue: -25, duration: 11000, useNativeDriver: true }),
          Animated.timing(purpleY,  { toValue: 30,  duration: 11000, useNativeDriver: true }),
          Animated.timing(purpleOp, { toValue: 0.22, duration: 5500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(purpleX,  { toValue: 20,   duration: 11000, useNativeDriver: true }),
          Animated.timing(purpleY,  { toValue: -15,  duration: 11000, useNativeDriver: true }),
          Animated.timing(purpleOp, { toValue: 0.10, duration: 5500, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    // Blue center orb — slow breath
    Animated.loop(
      Animated.sequence([
        Animated.timing(blueOp, { toValue: 0.18, duration: 6000, useNativeDriver: true }),
        Animated.timing(blueOp, { toValue: 0.06, duration: 6000, useNativeDriver: true }),
      ]),
    ).start();
  }, [cyanX, cyanY, cyanOp, purpleX, purpleY, purpleOp, blueOp]);

  return (
    <View style={styles.root}>
      {/* ── Base: deep space gradient (void → navy → deep purple) ──────── */}
      <View style={styles.base} />

      {/* ── Mid layer: navy surface ──────────────────────────────────── */}
      <View style={styles.midLayer} />

      {/* ── Top right: deep purple zone ─────────────────────────────── */}
      <View style={styles.purpleZone} />

      {/* ── Cyan orb — top left ─────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.cyanOrb,
          {
            opacity:   cyanOp,
            transform: [{ translateX: cyanX }, { translateY: cyanY }],
          },
        ]}
        pointerEvents="none"
      />

      {/* ── Purple orb — bottom right ────────────────────────────────── */}
      <Animated.View
        style={[
          styles.purpleOrb,
          {
            opacity:   purpleOp,
            transform: [{ translateX: purpleX }, { translateY: purpleY }],
          },
        ]}
        pointerEvents="none"
      />

      {/* ── Blue center accent ───────────────────────────────────────── */}
      <Animated.View
        style={[styles.blueOrb, { opacity: blueOp }]}
        pointerEvents="none"
      />

      {/* ── Noise grain overlay ─────────────────────────────────────── */}
      <View style={styles.grain} pointerEvents="none" />

      {/* ── Faint horizontal scan lines (holographic) ───────────────── */}
      <View style={styles.scanLines} pointerEvents="none" />

      {/* ── Content ─────────────────────────────────────────────────── */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex:             1,
    backgroundColor:  '#05070F',  // void base
  },

  // Deep space base — darkest layer
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05070F',
  },

  // Navy surface depth
  midLayer: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          H * 0.6,
    backgroundColor: 'rgba(10,15,44,0.85)',
  },

  // Deep purple zone — bottom
  purpleZone: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          H * 0.45,
    backgroundColor: 'rgba(18,10,58,0.70)',
  },

  // Cyan ambient orb — top left glow
  cyanOrb: {
    position:     'absolute',
    top:          -W * 0.25,
    left:         -W * 0.15,
    width:        W * 0.85,
    height:       W * 0.85,
    borderRadius: W * 0.425,
    backgroundColor: 'rgba(0,229,255,1)',
    // React Native can't do real radial gradient — simulate with large orb + opacity
  },

  // Purple orb — bottom right
  purpleOrb: {
    position:     'absolute',
    bottom:       -W * 0.20,
    right:        -W * 0.20,
    width:        W * 0.90,
    height:       W * 0.90,
    borderRadius: W * 0.45,
    backgroundColor: 'rgba(124,58,237,1)',
  },

  // Blue center orb
  blueOrb: {
    position:     'absolute',
    top:          H * 0.25,
    left:         W * 0.10,
    width:        W * 0.80,
    height:       W * 0.80,
    borderRadius: W * 0.40,
    backgroundColor: 'rgba(10,132,255,1)',
  },

  // Grain overlay — adds depth texture
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.20)',
    // Real noise would use a texture image
    // This approximates via dark semi-transparent overlay
  },

  // Subtle scan lines — holographic effect
  scanLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.025,
    backgroundColor: 'transparent',
    // In production: use a repeating SVG pattern
    // For now: subtle blue-tinted overlay
  },
});

export default LiquidAmbientBackground;
