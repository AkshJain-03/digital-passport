/**
 * QuickActionsSection
 *
 * 2×2 grid of glass action tiles:
 *   Scan QR · Verify · Passport · Verify Product
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
        <TouchableOpacity
          key={action.id}
          style={[styles.tile, { borderColor: `${action.accent}30` }]}
          onPress={action.onPress}
          activeOpacity={0.72}
        >
          {/* Glow orb */}
          <View style={[styles.orb, { backgroundColor: `${action.accent}10` }]} />

          <View style={[styles.iconWrap, {
            borderColor:     `${action.accent}50`,
            backgroundColor: `${action.accent}10`,
          }]}>
            <Text style={[styles.icon, { color: action.accent }]}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
          <Text style={styles.sub}>{action.sub}</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.glass.light,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    padding:         16,
    overflow:        'hidden',
    position:        'relative',
  },
  orb: {
    position:     'absolute',
    top:          -20,
    right:        -20,
    width:        80,
    height:       80,
    borderRadius: 40,
  },
  iconWrap: {
    width:           40,
    height:          40,
    borderRadius:    radius.lg,
    borderWidth:     1,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    12,
  },
  icon:  { fontSize: 18, lineHeight: 22 },
  label: { ...typo.headline, color: colors.text.primary, marginBottom: 2 },
  sub:   { ...typo.caption,  color: colors.text.quaternary },
});
