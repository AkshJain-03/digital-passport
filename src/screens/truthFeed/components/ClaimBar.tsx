/**
 * ClaimBar
 *
 * Animated verification ratio bar for post claims.
 * Shows a colour-coded track fill + label count.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = { caption: t.captionSm ?? t.caption ?? {} };

interface ClaimBarProps {
  claimCount:         number;
  verifiedClaimCount: number;
}

export const ClaimBar: React.FC<ClaimBarProps> = ({
  claimCount,
  verifiedClaimCount,
}) => {
  if (claimCount === 0) return null;

  const ratio     = verifiedClaimCount / claimCount;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue:  ratio,
      duration: 700,
      delay:    200,
      useNativeDriver: false,
    }).start();
  }, [ratio, widthAnim]);

  const barColor =
    ratio >= 0.8 ? colors.trust.verified.solid   :
    ratio >= 0.5 ? colors.trust.pending.solid    :
    colors.trust.suspicious.solid;

  const widthPct = widthAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthPct, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.count, { color: barColor }]}>
          {verifiedClaimCount}/{claimCount}
        </Text>
        <Text style={styles.label}>claims verified</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  track: {
    height:          4,
    borderRadius:    radius.full,
    backgroundColor: colors.glass.heavy,
    overflow:        'hidden',
    marginBottom:    5,
  },
  fill: {
    height:       '100%',
    borderRadius: radius.full,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count:    { ...typo.caption, fontWeight: '700' },
  label:    { ...typo.caption, color: colors.text.quaternary },
});
