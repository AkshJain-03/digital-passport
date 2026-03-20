/**
 * TrustHighlightsSection
 *
 * Vertical list of trust network alerts in liquid glass rows.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

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

// ── Glass Row ─────────────────────────────────────────────────────────────────

const GlassRow: React.FC<{
  item: TrustHighlight;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const accentColor = colors.trust[item.trustState]?.solid ?? colors.brand.primary;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 10,
    }).start();
  }, [scale]);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.row,
          {
            borderLeftColor: accentColor,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Real blur background */}
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={8}
            reducedTransparencyFallbackColor="transparent"
          />
        )}

        {/* Translucent tint */}
        <View style={styles.tint} pointerEvents="none" />

        {/* Inner reflection */}
        <View style={styles.innerReflection} pointerEvents="none" />

        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}14` }]}>
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
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ── Section ───────────────────────────────────────────────────────────────────

export const TrustHighlightsSection: React.FC<TrustHighlightsSectionProps> = ({
  highlights,
  onPress,
}) => {
  if (highlights.length === 0) return null;

  return (
    <View style={styles.list}>
      {highlights.map(item => (
        <GlassRow
          key={item.id}
          item={item}
          onPress={() => onPress?.(item)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    gap:               10,
  },
  row: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Platform.OS === 'ios'
      ? 'rgba(13,18,34,0.24)'
      : colors.glass.medium,
    borderRadius:     radius['2xl'],
    borderWidth:      1,
    borderColor:      colors.border.subtle,
    borderLeftWidth:  3,
    padding:          14,
    gap:              12,
    overflow:         'hidden',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    } : { elevation: 3 }),
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.006)',
  },
  innerReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.005)',
  },
  iconWrap: {
    width:           40,
    height:          40,
    borderRadius:    radius.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  iconText: { fontSize: 18 },
  body:     { flex: 1, minWidth: 0, gap: 3 },
  title:    { ...typo.headline, color: colors.text.primary },
  detail:   { ...typo.caption,  color: colors.text.tertiary },
  time:     { ...typo.caption,  color: colors.text.quaternary, fontSize: 9, marginTop: 2 },
});
