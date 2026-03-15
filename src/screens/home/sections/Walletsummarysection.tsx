/**
 * WalletSummarySection
 *
 * Hero card on the Home screen — shows DID, trust score, credential count.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard }     from '../../../components/common/GlassCard';
import { AppBadge }      from '../../../components/common/AppBadge';
import { colors }        from '../../../theme/colors';
import { radius }        from '../../../theme/radius';
import { spacing }       from '../../../theme/spacing';
import { typography }    from '../../../theme/typography';
import { abbreviateDid } from '../../../utils/formatters';
import { trustScoreLabel } from '../../../constants/appConstants';
import type { Identity } from '../../../models/identity';

interface WalletSummarySectionProps {
  identity:    Identity;
  trustScore:  number;
  onViewAll:   () => void;
}

export const WalletSummarySection: React.FC<WalletSummarySectionProps> = ({
  identity, trustScore, onViewAll,
}) => {
  const scoreColor =
    trustScore >= 80 ? colors.trust.verified.solid :
    trustScore >= 50 ? colors.trust.pending.solid  :
    colors.trust.suspicious.solid;

  return (
    <GlassCard glowState="trusted" animateGlow padding="md" style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.alias}>{identity.alias}</Text>
        </View>
        <AppBadge label={identity.status === 'active' ? 'Active' : 'Inactive'}
          variant={identity.status === 'active' ? 'verified' : 'suspicious'} dot />
      </View>

      <Text style={styles.didLabel}>DID</Text>
      <Text style={styles.did}>{abbreviateDid(identity.did)}</Text>

      <View style={styles.statsRow}>
        <StatBox value={trustScore} label="Trust Score" color={scoreColor} suffix="/100" />
        <StatBox value={identity.credentialCount} label="Credentials" color={colors.brand.primary} />
        <StatBox value={identity.issuerCount} label="Issuers" color={colors.trust.trusted.solid} />
      </View>

      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View Passport →</Text>
      </TouchableOpacity>
    </GlassCard>
  );
};

const StatBox: React.FC<{ value: number; label: string; color: string; suffix?: string }> = ({
  value, label, color, suffix = '',
}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}{suffix}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card:      { marginHorizontal: spacing[4] },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[3] },
  greeting:  { ...typography.captionSm, color: colors.text.quaternary },
  alias:     { ...typography.title3, color: colors.text.primary, marginTop: 2 },
  didLabel:  { ...typography.label, color: colors.text.quaternary, marginBottom: 3 },
  did:       { ...typography.mono, color: colors.text.tertiary, marginBottom: spacing[4] },
  statsRow:  { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3] },
  statBox:   { flex: 1, alignItems: 'center' },
  statValue: { ...typography.title2, lineHeight: 28 },
  statLabel: { ...typography.label, color: colors.text.quaternary },
  viewAllBtn: { alignSelf: 'flex-end' },
  viewAllText: { ...typography.buttonXs, color: colors.brand.primary },
});