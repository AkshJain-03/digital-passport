/**
 * LiquidBackButton
 *
 * Glass back button with:
 *   • Semi-transparent glass pill
 *   • Cyan edge glow on border
 *   • Spring press animation
 *   • Left arrow + optional label
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = { body: t.bodySm ?? t.body ?? {}, label: t.label ?? {} };

interface LiquidBackButtonProps {
  label?: string;
  onPress?: () => void;
}

export const LiquidBackButton: React.FC<LiquidBackButtonProps> = ({
  label,
  onPress,
}) => {
  const nav   = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn  = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.90, useNativeDriver: true, speed: 80, bounciness: 2,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    if (onPress) { onPress(); } else { nav.goBack(); }
  }, [onPress, nav]);

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.pill, { transform: [{ scale }] }]}>
        {/* Glass layers */}
        <View style={styles.glassTint} />
        <View style={styles.topEdge} />

        {/* Content */}
        <View style={styles.row}>
          <Text style={styles.arrow}>←</Text>
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'flex-start',
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     colors.border.medium,
    overflow:        'hidden',
    position:        'relative',
    shadowColor:     colors.brand.primary,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.30,
    shadowRadius:    10,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,9,25,0.65)',
  },
  topEdge: {
    position:        'absolute',
    top:             0,
    left:            8,
    right:           8,
    height:          1,
    backgroundColor: colors.border.light,
    opacity:         0.7,
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  arrow: {
    ...typo.body,
    color:    colors.brand.primary,
    fontSize: 18,
  },
  label: {
    ...typo.label,
    color: colors.brand.primary,
  },
});

export default LiquidBackButton;
