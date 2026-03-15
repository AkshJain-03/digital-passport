/**
 * RecentVerificationsSection
 *
 * Horizontal scroll of compact verification history cards.
 * Each card: issuer logo · credential name · trust glow · time ago.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { AppBadge } from '../../../components/common/AppBadge';
import { formatRelative } from '../../../utils/formatters';
import { CREDENTIAL_TYPE_META } from '../../../models/credential';
import type { CredentialWithIssuer } from '../../../models/credential';
import type { TrustState } from '../../../theme/colors';

// typography fallback safety
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;

const typo = {
  headline: t?.headlineSm ?? t?.headline ?? {},
  caption: t?.captionSm ?? t?.caption ?? {},
};

interface RecentVerificationsSectionProps {
  credentials: CredentialWithIssuer[];
  onPress: (cred: CredentialWithIssuer) => void;
}

export const RecentVerificationsSection: React.FC<
  RecentVerificationsSectionProps
> = ({ credentials = [], onPress }) => {
  if (!credentials || credentials.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {credentials.map((cred) => (
        <RecentCard
          key={cred?.id ?? Math.random().toString()}
          credential={cred}
          onPress={() => onPress?.(cred)}
        />
      ))}
    </ScrollView>
  );
};

// ── Sub-component ─────────────────────────────────────────

const RecentCard: React.FC<{
  credential: CredentialWithIssuer;
  onPress: () => void;
}> = ({ credential, onPress }) => {
  // Safe metadata lookup
  const meta =
    CREDENTIAL_TYPE_META?.[credential?.type] ?? {
      accentColor: '#888',
    };

  const accentColor = meta?.accentColor ?? '#888';

  // Safe issuer data
  const issuerEmoji = credential?.issuer?.logoEmoji ?? '🏛️';
  const issuerName = credential?.issuer?.shortName ?? 'Unknown Issuer';

  const title = credential?.title ?? 'Untitled Credential';

  const trustState = (credential?.trustState ?? 'unknown') as TrustState;

  const timeLabel = credential?.updatedAt
    ? formatRelative(credential.updatedAt)
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: `${accentColor}40` }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Accent stripe */}
      <View style={[styles.stripe, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Issuer emoji */}
        <View style={[styles.emojiWrap, { borderColor: `${accentColor}50` }]}>
          <Text style={styles.emoji}>{issuerEmoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.credTitle} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.issuerName} numberOfLines={1}>
          {issuerName}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <AppBadge
            label={trustState}
            variant={trustState}
            size="sm"
            dot
          />

          <Text style={styles.time}>{timeLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────

const CARD_W = 148;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },

  card: {
    width: CARD_W,
    backgroundColor: colors?.glass?.light ?? '#ffffff10',
    borderRadius: radius?.['2xl'] ?? 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  stripe: {
    height: 3,
  },

  body: {
    padding: 12,
  },

  emojiWrap: {
    width: 36,
    height: 36,
    borderRadius: radius?.lg ?? 10,
    borderWidth: 1,
    backgroundColor: colors?.glass?.medium ?? '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  emoji: {
    fontSize: 18,
  },

  credTitle: {
    ...typo.headline,
    color: colors?.text?.primary ?? '#fff',
    marginBottom: 2,
  },

  issuerName: {
    ...typo.caption,
    color: colors?.text?.tertiary ?? '#aaa',
    marginBottom: 12,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  time: {
    ...typo.caption,
    color: colors?.text?.quaternary ?? '#888',
    fontSize: 9,
  },
});