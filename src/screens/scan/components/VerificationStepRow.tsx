/**
 * VerificationStepRow
 *
 * Single animated step in the scan verification pipeline.
 * States: idle → active (pulse) → done → error
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }     from '../../../theme/colors';
import { radius }     from '../../../theme/radius';
import { spacing }    from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { VerificationStepStatus } from '../../../domain/verification/verificationTypes';

interface VerificationStepRowProps {
  label:  string;
  status: VerificationStepStatus;
  index:  number;
}

export const VerificationStepRow: React.FC<VerificationStepRowProps> = ({
  label, status, index,
}) => {
  const entryOp  = useRef(new Animated.Value(0)).current;
  const entryX   = useRef(new Animated.Value(-10)).current;
  const pulse    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOp, { toValue: 1, duration: 280, delay: index * 100, useNativeDriver: true }),
      Animated.timing(entryX,  { toValue: 0, duration: 280, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, [entryOp, entryX, index]);

  useEffect(() => {
    if (status !== 'active') { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const dotColor =
    status === 'done'   ? colors.trust.verified.solid   :
    status === 'error'  ? colors.trust.revoked.solid     :
    status === 'active' ? colors.brand.primary           :
    colors.text.quaternary;

  const icon =
    status === 'done'  ? '✓' :
    status === 'error' ? '✕' :
    status === 'active'? '●' : '○';

  return (
    <Animated.View style={[styles.row, { opacity: entryOp, transform: [{ translateX: entryX }] }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            borderColor:     dotColor,
            backgroundColor: status === 'done'   ? colors.trust.verified.dim :
                             status === 'active' ? colors.brand.primaryDim   : 'transparent',
            transform:       [{ scale: status === 'active' ? pulse : 1 }],
          },
        ]}
      >
        <Text style={[styles.icon, { color: dotColor }]}>{icon}</Text>
      </Animated.View>
      <Text style={[styles.label, status === 'active' && { color: colors.text.primary }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: 5 },
  dot:   {
    width: 28, height: 28, borderRadius: radius.full, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  icon:  { ...typography.label, fontWeight: '700' },
  label: { ...typography.body,  color: colors.text.tertiary, flex: 1 },
});