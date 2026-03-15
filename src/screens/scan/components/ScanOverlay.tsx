/**
 * ScanOverlay
 *
 * Animated QR code finder box with:
 *   • Corner bracket markers that pulse
 *   • Sweeping neon scan line
 *   • Trust-state colour transition on result
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import type { TrustState } from '../../../theme/colors';

interface ScanOverlayProps {
  size?:       number;
  trustState?: TrustState | null;
  scanning?:   boolean;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  size       = 260,
  trustState = null,
  scanning   = true,
}) => {
  const beam         = useRef(new Animated.Value(0)).current;
  const cornerPulse  = useRef(new Animated.Value(0.7)).current;

  const accentColor = trustState
    ? colors.trust[trustState]?.solid ?? colors.brand.primary
    : colors.brand.primary;

  useEffect(() => {
    if (!scanning) return;
    const beamLoop = Animated.loop(
      Animated.timing(beam, { toValue: 1, duration: 1800, useNativeDriver: true }),
    );
    const cornerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 0.55, duration: 900, useNativeDriver: true }),
      ]),
    );
    beamLoop.start();
    cornerLoop.start();
    return () => { beamLoop.stop(); cornerLoop.stop(); };
  }, [scanning, beam, cornerPulse]);

  const beamY = beam.interpolate({
    inputRange: [0, 1], outputRange: [0, size - 4],
  });

  const corner = (pos: object) => (
    <Animated.View style={[styles.corner, pos, { borderColor: accentColor, opacity: cornerPulse }]} />
  );

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      {/* Corner brackets */}
      {corner(styles.tl)}
      {corner(styles.tr)}
      {corner(styles.bl)}
      {corner(styles.br)}

      {/* Scan beam */}
      {scanning && (
        <Animated.View
          style={[styles.beam, { backgroundColor: accentColor, transform: [{ translateY: beamY }] }]}
        />
      )}
    </View>
  );
};

const CORNER = 22;
const styles = StyleSheet.create({
  box: {
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position:     'absolute',
    width:        CORNER,
    height:       CORNER,
    borderWidth:  3,
    borderRadius: 3,
  },
  tl: { top: 0,     left: 0,     borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0,     right: 0,    borderLeftWidth: 0,  borderBottomWidth: 0 },
  bl: { bottom: 0,  left: 0,     borderRightWidth: 0, borderTopWidth: 0    },
  br: { bottom: 0,  right: 0,    borderLeftWidth: 0,  borderTopWidth: 0    },
  beam: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    opacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});