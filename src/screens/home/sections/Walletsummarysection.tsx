/**
 * WalletSummarySection
 *
 * Premium hero card on the Home screen — DID, trust score, credential count.
 * Uses the liquid GlassCard component with enhanced stat boxes.
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
    <GlassCard glowState="trusted" animateGlow padding="lg" style={styles.card}>
      {/* Top row: greeting + status badge */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
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

      {/* Stats row — glass stat boxes */}
      <View style={styles.statsRow}>
        <StatBox
          value={trustScore}
          label={trustScoreLabel(trustScore)}
          color={scoreColor}
        />
        <StatBox
          value={identity.credentialCount}
          label="Credentials"
          color={colors.brand.primary}
        />
        <StatBox
          value={identity.issuerCount}
          label="Issuers"
          color={colors.trust.trusted.solid}
        />
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
}> = ({ value, label, color }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   14,
  },
  topLeft: {
    flex: 1,
  },
  greeting: {
    ...typo.caption,
    color:         colors.text.quaternary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alias: {
    ...typo.title3,
    color:     colors.text.primary,
    marginTop: 3,
  },
  didLabel: {
    ...typo.label,
    color:         colors.text.quaternary,
    marginBottom:  4,
    letterSpacing: 0.8,
  },
  did: {
    ...typo.mono,
    color:     colors.text.tertiary,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap:           10,
    marginBottom:  14,
  },
  statBox: {
    flex:            1,
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     colors.border.subtle,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  statValue: {
    ...typo.title2,
    lineHeight: 28,
  },
  statLabel: {
    ...typo.label,
    color:     colors.text.quaternary,
    marginTop: 2,
  },
  viewAllBtn: {
    alignSelf: 'flex-end',
  },
  viewAllText: {
    ...typo.button,
    color: colors.brand.primary,
  },
});
