/**
 * IdentityStats
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors }     from '../../../theme/colors';
import { radius }     from '../../../theme/radius';
import { spacing }    from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { shadows }    from '../../../theme/shadows';
import type { Identity } from '../../../models/identity';

interface IdentityStatsProps {
  identity: Identity;
  verifiedCount: number;
}

export const IdentityStats: React.FC<IdentityStatsProps> = ({
  identity,
  verifiedCount,
}) => (
  <View style={styles.row}>
    <StatPill
      value={identity.credentialCount}
      label="Credentials"
      accent={colors.brand.primary}
    />
    <StatPill
      value={identity.issuerCount}
      label="Issuers"
      accent={colors.trust.trusted.solid}
    />
    <StatPill
      value={verifiedCount}
      label="Verified"
      accent={colors.trust.verified.solid}
    />
  </View>
);

const StatPill: React.FC<{
  value: number;
  label: string;
  accent: string;
}> = ({ value, label, accent }) => (
  <View
    style={[
      styles.pill,
      { borderColor: accent + '40' /* 25% opacity */ },
    ]}
  >
    <Text style={[styles.value, { color: accent }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    paddingHorizontal: spacing.base,
    gap:            spacing.xs,
    marginTop:      spacing.sm,
  },
  pill: {
    flex:            1,
    backgroundColor: colors.glass.light,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    paddingVertical: spacing.sm,
    alignItems:      'center',
  },
  value: {
    ...typography.title2,
    lineHeight: 26,
  },
  label: {
    ...typography.label,
    color:     colors.text.quaternary,
    marginTop: spacing.xxs,
  },
});

export default IdentityStats;
