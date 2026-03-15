import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type TrustState } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { AppBadge } from '../../../components/common/AppBadge';
import { GlassCard } from '../../../components/common/GlassCard';

interface VerificationEntry {
  id: string;
  title: string;
  issuer: string;
  type: string;
  trustState: TrustState;
  timeAgo: string;
}

// Mock data — replace with real hook data
const MOCK_VERIFICATIONS: VerificationEntry[] = [
  {
    id: '1',
    title: 'B.Tech Degree',
    issuer: 'IIT Bombay',
    type: 'Education',
    trustState: 'verified',
    timeAgo: '2m ago',
  },
  {
    id: '2',
    title: 'KYC Identity',
    issuer: 'Aadhaar Bridge',
    type: 'Identity',
    trustState: 'trusted',
    timeAgo: '1h ago',
  },
  {
    id: '3',
    title: 'Product Auth',
    issuer: 'Nike Inc.',
    type: 'Product',
    trustState: 'verified',
    timeAgo: '3h ago',
  },
  {
    id: '4',
    title: 'Unknown Doc',
    issuer: 'Unknown',
    type: 'Document',
    trustState: 'suspicious',
    timeAgo: 'Yesterday',
  },
];

export const RecentVerificationsSection: React.FC = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {MOCK_VERIFICATIONS.map(entry => (
        <GlassCard
          key={entry.id}
          glowState={entry.trustState}
          style={styles.card}
          contentStyle={styles.cardContent}
          revealLayers={3}
        >
          <View style={styles.typeRow}>
            <Text style={styles.typeText}>{entry.type.toUpperCase()}</Text>
            <Text style={styles.timeAgo}>{entry.timeAgo}</Text>
          </View>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.issuer}>{entry.issuer}</Text>
          <View style={styles.badgeRow}>
            <AppBadge
              label={entry.trustState}
              variant={entry.trustState}
              dot
            />
          </View>
        </GlassCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
    gap: spacing.md,
  },
  card: {
    width: 180,
  },
  cardContent: {
    padding: spacing.base,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeText: {
    ...typography.label,
    color: colors.text.quaternary,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.text.quaternary,
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
  issuer: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
  },
});