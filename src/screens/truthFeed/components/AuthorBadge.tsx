/**
 * AuthorBadge
 *
 * Author avatar + name + handle + institution + trust state badge.
 * Used inside PostCard as the author row.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import { AppBadge } from '../../../components/common/AppBadge';
import type { PostAuthor } from '../../../models/post';
import type { TrustState } from '../../../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  caption:  t.captionSm  ?? t.caption  ?? {},
  label:    t.label      ?? {},
  mono:     t.mono       ?? {},
};

interface AuthorBadgeProps {
  author:     PostAuthor;
  showDid?:   boolean;   // Layer 1: show full DID
}

export const AuthorBadge: React.FC<AuthorBadgeProps> = ({ author, showDid = false }) => {
  const trustColor = colors.trust[author.trustState as TrustState]?.solid ?? colors.brand.primary;
  const isVerified = author.isVerified;

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={[
        styles.avatar,
        {
          borderColor:     `${trustColor}60`,
          backgroundColor: `${trustColor}10`,
          shadowColor:     trustColor,
        },
      ]}>
        <Text style={styles.avatarEmoji}>{author.avatarEmoji}</Text>
        {/* Verified checkmark overlay */}
        {isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: trustColor }]}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
      </View>

      {/* Identity */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{author.displayName}</Text>
          {isVerified && (
            <View style={[styles.verifiedPill, { borderColor: `${trustColor}50`, backgroundColor: `${trustColor}14` }]}>
              <Text style={[styles.verifiedPillText, { color: trustColor }]}>verified</Text>
            </View>
          )}
        </View>
        <Text style={styles.handle}>{author.handle}</Text>
        {author.institution && (
          <Text style={styles.institution} numberOfLines={1}>{author.institution}</Text>
        )}
        {showDid && (
          <Text style={styles.did} numberOfLines={1}>
            {author.did.length > 30 ? `${author.did.slice(0, 28)}…` : author.did}
          </Text>
        )}
      </View>

      {/* Trust badge */}
      <AppBadge
        label={author.trustState}
        variant={author.trustState as TrustState}
        dot
        size="sm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
  },

  // Avatar
  avatar: {
    width:          42,
    height:         42,
    borderRadius:   radius.full,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    position:       'relative',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.3,
    shadowRadius:   8,
  },
  avatarEmoji: { fontSize: 20 },
  verifiedBadge: {
    position:       'absolute',
    bottom:         -1,
    right:          -1,
    width:          14,
    height:         14,
    borderRadius:   7,
    alignItems:     'center',
    justifyContent: 'center',
  },
  verifiedIcon: { fontSize: 8, color: '#000', fontWeight: '900' },

  // Info
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  name: { ...typo.headline, color: colors.text.primary, flexShrink: 1 },
  verifiedPill: {
    paddingHorizontal: 5,
    paddingVertical:   1,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  verifiedPillText: { ...typo.caption, fontSize: 8, fontWeight: '700' },
  handle:      { ...typo.caption, color: colors.text.tertiary },
  institution: { ...typo.caption, color: colors.text.quaternary, marginTop: 1, fontSize: 10 },
  did:         { ...typo.mono, color: colors.text.quaternary, fontSize: 9, marginTop: 2 },
});
