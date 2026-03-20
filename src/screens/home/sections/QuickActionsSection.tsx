/**
 * QuickActionsSection
 *
 * 2×2 grid of liquid glass action tiles with glow accents.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

import { colors }  from '../../../theme/colors';
import { radius }  from '../../../theme/radius';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  caption:  t.captionSm  ?? t.caption  ?? {},
};

interface QuickActionsSectionProps {
  onScan:     () => void;
  onVerify:   () => void;
  onPassport: () => void;
  onProduct:  () => void;
}

interface QuickAction {
  id:      string;
  label:   string;
  sub:     string;
  icon:    string;
  accent:  string;
  onPress: () => void;
}

// ── Glass Tile ────────────────────────────────────────────────────────────────

const GlassTile: React.FC<{
  action: QuickAction;
}> = ({ action }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const sweep = useRef(new Animated.Value(-1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1.02,
      useNativeDriver: true,
      speed: 48,
      bounciness: 5,
    }).start();

    sweep.setValue(-1);
    Animated.timing(sweep, {
      toValue: 1,
      duration: 580,
      useNativeDriver: true,
    }).start();
  }, [scale, sweep]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 10,
    }).start();

  }, [scale]);

  return (
    <TouchableWithoutFeedback
      onPress={action.onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            borderColor: 'rgba(84,220,255,0.30)',
            transform: [{ scale }],
          },
        ]}
      >
        {/* Real blur background */}
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={22}
            reducedTransparencyFallbackColor="transparent"
          />
        )}

        {/* Dark substrate so blur reads as clear glass, not milky fog */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(9,24,54,0.15)', 'rgba(8,16,34,0.10)', 'rgba(6,10,20,0.18)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.06, y: 0 }}
          end={{ x: 0.92, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Translucent base tint */}
        <View
          style={[
            styles.tint,
            { backgroundColor: `${action.accent}05` },
          ]}
          pointerEvents="none"
        />

        {/* Top brighter / bottom darker light flow */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(183,228,255,0.08)', 'rgba(255,255,255,0.00)', 'rgba(2,8,20,0.22)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.16, y: 0 }}
          end={{ x: 0.72, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top reflection band */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(202,239,255,0.18)', 'rgba(202,239,255,0.00)']}
          start={{ x: 0.08, y: 0 }}
          end={{ x: 0.96, y: 1 }}
          style={styles.topLightBand}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.lightSweep,
            {
              transform: [{
                translateX: sweep.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-130, 150],
                }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(0,229,255,0.00)', 'rgba(0,229,255,0.22)', 'rgba(0,229,255,0.00)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Top inner reflection */}
        <View style={styles.innerReflection} pointerEvents="none" />

        {/* Subtle edge specular highlight */}
        <View style={styles.edgeSpecular} pointerEvents="none" />

        {/* Corner glow orb */}
        <View
          style={[
            styles.orb,
            { backgroundColor: `${action.accent}10` },
          ]}
        />

        {/* Icon container */}
        <View style={[styles.iconWrap, {
          borderColor:     `${action.accent}40`,
          backgroundColor: `${action.accent}12`,
        }]}>
          <Text style={[styles.icon, { color: action.accent }]}>{action.icon}</Text>
        </View>

        <Text style={styles.label}>{action.label}</Text>
        <Text style={styles.sub}>{action.sub}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ── Section ───────────────────────────────────────────────────────────────────

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onScan, onVerify, onPassport, onProduct,
}) => {
  const actions: QuickAction[] = [
    { id: 'scan',     label: 'Scan QR',        sub: 'Scan & verify',      icon: '⊡', accent: colors.brand.primary,        onPress: onScan     },
    { id: 'verify',   label: 'Verify',          sub: 'Manual input',       icon: '◎', accent: colors.trust.verified.solid, onPress: onVerify   },
    { id: 'passport', label: 'Passport',        sub: 'Your identity',      icon: '◈', accent: colors.trust.trusted.solid,  onPress: onPassport },
    { id: 'product',  label: 'Check Product',   sub: 'Authenticity scan',  icon: '📦', accent: colors.trust.pending.solid,  onPress: onProduct  },
  ];

  return (
    <View style={styles.grid}>
      {actions.map(action => (
        <GlassTile key={action.id} action={action} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: 16,
    gap:               12,
  },
  tile: {
    width:           '47%',
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(8,12,24,0.10)'
      : colors.glass.medium,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    padding:         16,
    overflow:        'hidden',
    position:        'relative',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#02203A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    } : { elevation: 4 }),
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  innerReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.006)',
  },
  topLightBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  lightSweep: {
    position: 'absolute',
    top: -16,
    width: 86,
    height: '140%',
    transform: [{ rotate: '-18deg' }],
    opacity: 0.38,
  },
  edgeSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(91,226,255,0.30)',
    shadowColor: '#79DFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  orb: {
    position:     'absolute',
    top:          -24,
    right:        -24,
    width:        88,
    height:       88,
    borderRadius: 44,
  },
  iconWrap: {
    width:           42,
    height:          42,
    borderRadius:    radius.lg,
    borderWidth:     1,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
  },
  icon:  { fontSize: 18, lineHeight: 22 },
  label: { ...typo.headline, color: colors.text.primary, marginBottom: 3 },
  sub:   { ...typo.caption,  color: colors.text.quaternary },
});
