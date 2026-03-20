/**
 * CameraScanScreen — Real camera-based QR scanner
 *
 * Uses react-native-vision-camera v4 built-in code scanner.
 * On QR detection: parse JSON → validate → navigate to verification result.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import { colors }    from '../../theme/colors';
import { radius }    from '../../theme/radius';
import { typography } from '../../theme/typography';
import { AppButton } from '../../components/common/AppButton';
import { LiquidBackButton } from '../../components/common/LiquidBackButton';
import { ROUTES, type RootStackParamList } from '../../app/routes';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Component ────────────────────────────────────────────────────────────────

export const CameraScanScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [scanned, setScanned] = useState(false);

  // Scan line animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const cornerAnim   = useRef(new Animated.Value(0.5)).current;

  // Scan line sweep
  useEffect(() => {
    if (scanned) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0,   useNativeDriver: true }),
        Animated.delay(300),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanned, scanLineAnim]);

  // Pulse effect on frame
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Corner bracket opacity pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(cornerAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cornerAnim]);

  // Code scanner callback
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: useCallback((codes) => {
      if (scanned || codes.length === 0) return;
      const value = codes[0]?.value;
      if (!value) return;

      setScanned(true);
      Vibration.vibrate(50);

      // Validate JSON payload
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          nav.navigate(ROUTES.QR_VERIFICATION_RESULT, { payload: value });
        }
      } catch {
        // Not valid JSON — still navigate with raw value
        nav.navigate(ROUTES.QR_VERIFICATION_RESULT, { payload: value });
      }
    }, [scanned, nav]),
  });

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Reset scanned state when screen comes back into focus
  useEffect(() => {
    const unsubscribe = nav.addListener('focus', () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [nav]);

  const FRAME_SIZE = 260;
  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 2],
  });

  // ── No permission state ───────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <LiquidBackButton onPress={() => nav.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permBody}>
            Grant camera permission to scan QR codes.
          </Text>
          <AppButton
            label="Grant Permission"
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  // ── No camera device ──────────────────────────────────────────────────────
  if (!device) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <LiquidBackButton onPress={() => nav.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.permTitle}>No Camera Found</Text>
          <Text style={styles.permBody}>
            This device does not have an available camera.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Camera preview */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!scanned}
        codeScanner={codeScanner}
      />

      {/* Dark overlay with cutout */}
      <View style={styles.overlay}>
        <LiquidBackButton onPress={() => nav.goBack()} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan QR Code</Text>
          <Text style={styles.subtitle}>
            Point your camera at a credential QR code
          </Text>
        </View>

        {/* Scan frame */}
        <Animated.View
          style={[
            styles.frameContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
            {/* Corner brackets */}
            {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
              <Animated.View
                key={pos}
                style={[
                  styles.corner,
                  styles[pos],
                  { opacity: cornerAnim },
                ]}
              />
            ))}

            {/* Scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineY }] },
                ]}
              />
            )}
          </View>
        </Animated.View>

        {/* Bottom hint */}
        <View style={styles.bottomArea}>
          {scanned ? (
            <View style={styles.detectedPill}>
              <Text style={styles.detectedText}>✓ QR Detected</Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              Align QR code within the frame
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default CameraScanScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const CORNER_SIZE = 30;
const BORDER_W    = 3;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  permTitle: {
    ...typography.title2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  permBody: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.title1,
    color: '#FFFFFF',
  },
  subtitle: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.60)',
    marginTop: 6,
  },

  frameContainer: {
    alignSelf: 'center',
  },
  frame: {
    borderRadius: radius.xl,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.brand.primary,
    borderWidth: BORDER_W,
    borderRadius: 6,
  },
  tl: { top: 0, left: 0,  borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0,  borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0 },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },

  bottomArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  hint: {
    ...typography.bodySm,
    color: 'rgba(255,255,255,0.50)',
  },
  detectedPill: {
    backgroundColor: `${colors.trust.verified.solid}20`,
    borderColor: `${colors.trust.verified.solid}60`,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detectedText: {
    ...typography.headline,
    color: colors.trust.verified.solid,
  },
});
