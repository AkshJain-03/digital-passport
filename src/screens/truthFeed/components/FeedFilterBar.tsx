/**
 * FeedFilterBar
 *
 * Horizontally scrollable filter pills for the Truth Feed.
 * Active pill uses the trust state colour of the filter.
 * Shows a post count badge on each active filter.
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
import type { FeedFilter } from '../../../hooks/useTruthFeed';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  button:  t.buttonSm ?? t.button  ?? {},
  caption: t.captionSm ?? t.caption ?? {},
};

interface FilterConfig {
  key:         FeedFilter;
  label:       string;
  emoji:       string;
  activeColor: string;
}

const FILTERS: FilterConfig[] = [
  { key: 'all',        label: 'All',        emoji: '◎', activeColor: colors.brand.primary },
  { key: 'verified',   label: 'Verified',   emoji: '✓', activeColor: colors.trust.verified.solid },
  { key: 'suspicious', label: 'Suspicious', emoji: '⚠', activeColor: colors.trust.suspicious.solid },
  { key: 'unverified', label: 'Unverified', emoji: '○', activeColor: colors.trust.unknown.solid },
];

interface FeedFilterBarProps {
  active:     FeedFilter;
  postCounts: Partial<Record<FeedFilter, number>>;
  onSelect:   (f: FeedFilter) => void;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  active,
  postCounts,
  onSelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
    style={styles.scroll}
  >
    {FILTERS.map(f => {
      const isActive = f.key === active;
      const count    = postCounts[f.key];
      return (
        <TouchableOpacity
          key={f.key}
          style={[
            styles.chip,
            isActive && {
              borderColor:     f.activeColor,
              backgroundColor: `${f.activeColor}16`,
              shadowColor:     f.activeColor,
              shadowOffset:    { width: 0, height: 0 },
              shadowOpacity:   0.4,
              shadowRadius:    8,
            },
          ]}
          onPress={() => onSelect(f.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.emoji, isActive && { opacity: 1 }]}>{f.emoji}</Text>
          <Text style={[
            styles.label,
            isActive && { color: f.activeColor, fontWeight: '600' },
          ]}>
            {f.label}
          </Text>
          {count !== undefined && count > 0 && (
            <View style={[
              styles.countBadge,
              { backgroundColor: isActive ? f.activeColor : colors.glass.heavy },
            ]}>
              <Text style={[
                styles.countText,
                { color: isActive ? '#000' : colors.text.quaternary },
              ]}>
                {count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: {
    paddingHorizontal: 16,
    gap:               8,
    paddingVertical:   2,
  },
  chip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
    backgroundColor:   colors.glass.light,
  },
  emoji:      { fontSize: 12, opacity: 0.7 },
  label:      { ...typo.button, color: colors.text.tertiary, fontSize: 12 },
  countBadge: {
    minWidth:          16,
    height:            16,
    borderRadius:      8,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 3,
  },
  countText:  { ...typo.caption, fontSize: 9, fontWeight: '700' },
});
