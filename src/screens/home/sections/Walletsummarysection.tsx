/**
 * WalletSummarySection
 *
 * Hero card on the Home screen — DID, trust score, credential count.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard }       from '../../../components/common/GlassCard';
import { AppBadge }        from '../../../components/common/AppBadge';
import { colors }          from '../../../theme/colors';
import { radius }          from '../../../theme/radius';
import { abbreviateDid }   from '../../../utils/formatters';
import { trustScoreLabel } from '../../../constants/appConstants';
import type { Identity }   from '../../../models/identity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  title3:   t.title3   ?? {},
  title2:   t.title2   ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  label:    t.label    ?? {},
  mono:     t.mono     ?? {},
  button:   t.buttonXs ?? t.button   ?? {},
};

interface WalletSummarySectionProps {
  identity:   Identity;
  trustScore: number;
  onViewAll:  () => void;
}

export const WalletSummarySection: React.FC<WalletSummarySectionProps> = ({
  identity, trustScore, onViewAll,
}) => {
  const scoreColor =
    trustScore >= 80 ? colors.trust.verified.solid   :
    trustScore >= 50 ? colors.trust.pending.solid    :
    colors.trust.suspicious.solid;

  return (
    <GlassCard glowState="trusted" animateGlow padding="md" style={styles.card}>
      {/* Top row: greeting + status badge */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.alias}>{identity.alias}</Text>
        </View>
        <AppBadge
          label={identity.status === 'active' ? 'Active' : 'Inactive'}
          variant={identity.status === 'active' ? 'verified' : 'suspicious'}
          dot
        />
      </View>

      {/* DID */}
      <Text style={styles.didLabel}>DID</Text>
      <Text style={styles.did}>{abbreviateDid(identity.did)}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox value={trustScore}            label={trustScoreLabel(trustScore)} color={scoreColor}                suffix="" />
        <StatBox value={identity.credentialCount} label="Credentials"              color={colors.brand.primary}     />
        <StatBox value={identity.issuerCount}     label="Issuers"                  color={colors.trust.trusted.solid} />
      </View>

      {/* CTA */}
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View Passport →</Text>
      </TouchableOpacity>
    </GlassCard>
  );
};

// ── Sub-component ─────────────────────────────────────────────────────────────

const StatBox: React.FC<{
  value:   number;
  label:   string;
  color:   string;
  suffix?: string;
}> = ({ value, label, color, suffix = '' }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}{suffix}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card:    { marginHorizontal: 16 },
  topRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting:{ ...typo.caption, color: colors.text.quaternary },
  alias:   { ...typo.title3,  color: colors.text.primary, marginTop: 2 },
  didLabel:{ ...typo.label,   color: colors.text.quaternary, marginBottom: 3 },
  did:     { ...typo.mono,    color: colors.text.tertiary, marginBottom: 16 },
  statsRow:{ flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue:{ ...typo.title2, lineHeight: 28 },
  statLabel:{ ...typo.label,  color: colors.text.quaternary },
  viewAllBtn:  { alignSelf: 'flex-end' },
  viewAllText: { ...typo.button, color: colors.brand.primary },
});
