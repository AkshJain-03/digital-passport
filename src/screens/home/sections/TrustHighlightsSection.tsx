import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type TrustState } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { GlassCard } from '../../../components/common/GlassCard';
import { AppBadge } from '../../../components/common/AppBadge';

export interface TrustHighlight {
  id: string;
  headline: string;
  detail: string;
  trustState: TrustState;
  category: string;
  source: string;
}

const MOCK_HIGHLIGHTS: TrustHighlight[] = [
  {
    id: '1',
    headline: 'New credential issuer verified',
    detail: 'SEBI has been onboarded as a trusted institutional issuer on the network.',
    trustState: 'trusted',
    category: 'Network',
    source: 'SEBI',
  },
  {
    id: '2',
    headline: 'Counterfeit alert: Luxury goods',
    detail: 'Suspicious QR patterns detected for Gucci Mumbai — 3 flagged this week.',
    trustState: 'suspicious',
    category: 'Alert',
    source: 'Fraud Engine',
  },
  {
    id: '3',
    headline: 'Revocation list updated',
    detail: 'MIT revoked 12 credentials associated with a data breach incident.',
    trustState: 'revoked',
    category: 'Revocation',
    source: 'MIT Registry',
  },
];

export const TrustHighlightsSection: React.FC = () => {
  return (
    <View style={styles.list}>
      {MOCK_HIGHLIGHTS.map((item, index) => (
        <TrustHighlightRow key={item.id} item={item} index={index} />
      ))}
    </View>
  );
};

const TrustHighlightRow: React.FC<{ item: TrustHighlight; index: number }> = ({
  item,
}) => {
  const ICON: Record<TrustState, string> = {
    verified: '✓',
    trusted: '◈',
    suspicious: '⚠',
    revoked: '✕',
    pending: '◌',
    unknown: '?',
  };

  return (
    <GlassCard
      glowState={item.trustState}
      style={styles.card}
      revealLayers={2}
    >
      <View style={styles.row}>
        {/* Left icon */}
        <View
          style={[
            styles.iconCircle,
            { borderColor: getColor(item.trustState), backgroundColor: getDim(item.trustState) },
          ]}
        >
          <Text style={[styles.icon, { color: getColor(item.trustState) }]}>
            {ICON[item.trustState]}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <AppBadge label={item.category} variant={item.trustState} />
            <Text style={styles.source}>{item.source}</Text>
          </View>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.detail} numberOfLines={2}>
            {item.detail}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

// Helpers
import { colors as c } from '../../../theme/colors';
const getColor = (s: TrustState) => c.trust[s].solid;
const getDim = (s: TrustState) => c.trust[s].dim;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  source: {
    ...typography.caption,
    color: colors.text.quaternary,
  },
  headline: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});