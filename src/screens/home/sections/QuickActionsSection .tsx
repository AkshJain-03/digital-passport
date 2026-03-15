import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { shadows } from '../../../theme/shadows';
import { ROUTES } from '../../../app/routes';

interface QuickAction {
  icon: string;
  label: string;
  sublabel: string;
  route: string;
  color: string;
  glow: string;
  bg: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: '⊙',
    label: 'Scan QR',
    sublabel: 'Any credential',
    route: ROUTES.SCAN,
    color: colors.brand.primary,
    glow: shadows.glowPrimary as any,
    bg: colors.brand.primaryDim,
  },
  {
    icon: '✓',
    label: 'Verify',
    sublabel: 'Credential',
    route: ROUTES.VERIFY,
    color: colors.trust.verified.solid,
    glow: shadows.glowVerified as any,
    bg: colors.trust.verified.dim,
  },
  {
    icon: '◈',
    label: 'Passport',
    sublabel: 'Open wallet',
    route: ROUTES.PASSPORT,
    color: colors.trust.trusted.solid,
    glow: shadows.glowTrusted as any,
    bg: colors.trust.trusted.dim,
  },
  {
    icon: '⬡',
    label: 'Product',
    sublabel: 'Verify item',
    route: ROUTES.VERIFY,
    color: colors.brand.secondary,
    glow: shadows.glowPrimary as any,
    bg: colors.brand.secondaryDim,
  },
];

export const QuickActionsSection: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.grid}>
      {QUICK_ACTIONS.map(action => (
        <TouchableOpacity
          key={action.label}
          style={[styles.tile, { backgroundColor: action.bg, borderColor: action.color }]}
          onPress={() => navigation.navigate(action.route)}
          activeOpacity={0.75}
        >
          <Text style={[styles.icon, { color: action.color }]}>{action.icon}</Text>
          <Text style={[styles.label, { color: action.color }]}>{action.label}</Text>
          <Text style={styles.sub}>{action.sublabel}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  tile: {
    width: '47.5%',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing[4],
    minHeight: 96,
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 26,
  },
  label: {
    ...typography.headline,
    marginTop: spacing[2],
  },
  sub: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});