/**
 * CredentialFilterBar
 *
 * Horizontal scrollable row of filter chips for the credential list.
 * Chips: All · Active · Verified · Pending · Expired
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }     from '../../../theme/colors';
import { radius }     from '../../../theme/radius';
import { spacing }    from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import type { CredentialStatus } from '../../../models/credential';

export type CredentialFilter = 'all' | CredentialStatus;

interface FilterChip {
  key:   CredentialFilter;
  label: string;
  color: string;
}

const FILTERS: FilterChip[] = [
  { key: 'all',      label: 'All',      color: colors.brand.primary },
  { key: 'active',   label: 'Active',   color: colors.trust.verified.solid },
  { key: 'pending',  label: 'Pending',  color: colors.trust.pending.solid },
  { key: 'revoked',  label: 'Revoked',  color: colors.trust.revoked.solid },
  { key: 'expired',  label: 'Expired',  color: colors.trust.suspicious.solid },
  { key: 'suspended',label: 'Suspended',color: colors.text.tertiary },
];

interface CredentialFilterBarProps {
  active:   CredentialFilter;
  onChange: (filter: CredentialFilter) => void;
}

export const CredentialFilterBar: React.FC<CredentialFilterBarProps> = ({
  active,
  onChange,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scroll}
    style={styles.container}
  >
    {FILTERS.map(filter => {
      const isActive = active === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.chip,
            isActive && {
              backgroundColor: filter.color + '1A',  // ~10% opacity
              borderColor:     filter.color,
            },
          ]}
          onPress={() => onChange(filter.key)}
          activeOpacity={0.7}
        >
          {isActive && (
            <View style={[styles.activeDot, { backgroundColor: filter.color }]} />
          )}
          <Text
            style={[
              styles.chipLabel,
              { color: isActive ? filter.color : colors.text.tertiary },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scroll: {
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[2],
    gap:               spacing[2],
  },
  chip: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[1] + 2,
    borderRadius:     radius.full,
    borderWidth:      1,
    borderColor:      colors.border.subtle,
    backgroundColor:  colors.glass.light,
    gap:              5,
  },
  activeDot: {
    width:        5,
    height:       5,
    borderRadius: radius.full,
  },
  chipLabel: {
    ...typography.buttonSm,
    fontSize: 12,
  },
});
