/**
 * IssuerVerificationRow
 *
 * Horizontal row showing issuer identity and verification status.
 * Used inside CredentialCard layer-2 and CredentialDetailSheet.
 *
 * Displays:
 *   Logo emoji | Issuer name + category | Trust badge | Verified tick
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors }     from '../../../theme/colors';
import { radius }     from '../../../theme/radius';
import { spacing }    from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { AppBadge }   from '../../../components/common/AppBadge';
import type { Issuer } from '../../../models/credential';

interface IssuerVerificationRowProps {
  issuer: Issuer;
  showDid?: boolean;
  style?:   StyleProp<ViewStyle>;
}

export const IssuerVerificationRow: React.FC<IssuerVerificationRowProps> = ({
  issuer,
  showDid = false,
  style,
}) => (
  <View style={[styles.row, style]}>
    {/* Logo */}
    <View
      style={[
        styles.logo,
        { borderColor: issuer.isVerified
            ? colors.trust[issuer.trustState].solid + '50'
            : colors.border.subtle
        },
      ]}
    >
      <Text style={styles.logoEmoji}>{issuer.logoEmoji}</Text>
    </View>

    {/* Info */}
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{issuer.name}</Text>
      <Text style={styles.category}>
        {issuer.category} · {issuer.country}
      </Text>
      {showDid && (
        <Text style={styles.did} numberOfLines={1}>
          {issuer.did.slice(0, 32)}…
        </Text>
      )}
    </View>

    {/* Badge */}
    <View style={styles.badge}>
      <AppBadge
        label={issuer.isVerified ? issuer.trustState : 'unknown'}
        variant={issuer.isVerified ? issuer.trustState : 'neutral'}
        dot
        size="sm"
      />
      {issuer.isVerified && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  logo: {
    width:           38,
    height:          38,
    borderRadius:    radius.lg,
    borderWidth:     1,
    backgroundColor: colors.glass.medium,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  logoEmoji: { fontSize: 18 },
  info: {
    flex:    1,
    minWidth: 0,
  },
  name:     { ...typography.headlineSm, color: colors.text.primary },
  category: { ...typography.captionSm,  color: colors.text.tertiary, marginTop: 1 },
  did:      { ...typography.mono,       color: colors.text.quaternary, fontSize: 9, marginTop: 2 },
  badge: {
    alignItems: 'flex-end',
    gap:        3,
    flexShrink: 0,
  },
  checkmark: {
    ...typography.label,
    color:    colors.trust.verified.solid,
    fontSize: 10,
  },
});

export default IssuerVerificationRow;