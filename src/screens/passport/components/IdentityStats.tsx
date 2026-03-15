/**
 * IdentityStats
 *
 * Horizontal row of three animated glass stat pills:
 *   Credentials | Issuers | Verified
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import type { Identity } from '../../../models/identity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2: t.title2 ?? {},
  label:  t.label  ?? {},
};

interface IdentityStatsProps {
  identity:      Identity;
  verifiedCount: number;
}

export const IdentityStats: React.FC<IdentityStatsProps> = ({
  identity,
  verifiedCount,
}) => (
  <View style={styles.row}>
    <StatPill value={identity.credentialCount} label="Credentials" accent={colors.brand.primary}        delay={0}   />
    <StatPill value={identity.issuerCount}     label="Issuers"     accent={colors.trust.trusted.solid}  delay={80}  />
    <StatPill value={verifiedCount}            label="Verified"    accent={colors.trust.verified.solid} delay={160} />
  </View>
);

// ── Sub-component ──────────────────────────────────────────────────────────────

const StatPill: React.FC<{
  value:  number;
  label:  string;
  accent: string;
  delay:  number;
}> = ({ value, label, accent, delay }) => {
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue:     1,
      useNativeDriver: true,
      speed:       14,
      bounciness:  4,
      delay,
    }).start();
  }, [entryAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.pill,
        { borderColor: `${accent}40` },
        {
          opacity:   entryAnim,
          transform: [
            {
              translateY: entryAnim.interpolate({
                inputRange: [0, 1], outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    paddingHorizontal: 16,
    gap:               8,
    marginTop:         12,
  },
  pill: {
    flex:            1,
    backgroundColor: colors.glass.light,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    paddingVertical: 12,
    alignItems:      'center',
  },
  value: {
    ...typo.title2,
    lineHeight: 26,
  },
  label: {
    ...typo.label,
    color:     colors.text.quaternary,
    marginTop: 2,
  },
});
