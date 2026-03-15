/**
 * TrustHighlightsSection
 *
 * Vertical list of trust network alerts:
 *   verified credential · suspicious post · expiring cert
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }     from '../../../theme/colors';
import { radius }     from '../../../theme/radius';
import { AppBadge }   from '../../../components/common/AppBadge';
import { formatRelative } from '../../../utils/formatters';
import type { TrustState } from '../../../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  caption:  t.captionSm  ?? t.caption  ?? {},
};

export interface TrustHighlight {
  id:         string;
  title:      string;
  detail:     string;
  trustState: TrustState;
  timestamp:  string;
  icon:       string;
}

interface TrustHighlightsSectionProps {
  highlights: TrustHighlight[];
  onPress?:   (highlight: TrustHighlight) => void;
}

export const TrustHighlightsSection: React.FC<TrustHighlightsSectionProps> = ({
  highlights,
  onPress,
}) => {
  if (highlights.length === 0) return null;

  return (
    <View style={styles.list}>
      {highlights.map(item => {
        const accentColor = colors.trust[item.trustState]?.solid ?? colors.brand.primary;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, { borderLeftColor: accentColor }]}
            onPress={() => onPress?.(item)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}12` }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>

            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.detail} numberOfLines={2}>{item.detail}</Text>
              <Text style={styles.time}>{formatRelative(item.timestamp)}</Text>
            </View>

            <AppBadge
              label={item.trustState}
              variant={item.trustState}
              size="sm"
              dot
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    gap:               8,
  },
  row: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.glass.light,
    borderRadius:     radius['2xl'],
    borderWidth:      1,
    borderColor:      colors.border.subtle,
    borderLeftWidth:  3,
    padding:          12,
    gap:              12,
  },
  iconWrap: {
    width:           38,
    height:          38,
    borderRadius:    radius.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  iconText: { fontSize: 18 },
  body:     { flex: 1, minWidth: 0, gap: 2 },
  title:    { ...typo.headline, color: colors.text.primary },
  detail:   { ...typo.caption,  color: colors.text.tertiary },
  time:     { ...typo.caption,  color: colors.text.quaternary, fontSize: 9, marginTop: 2 },
});
