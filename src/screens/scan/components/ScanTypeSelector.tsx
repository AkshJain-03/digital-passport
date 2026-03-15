/**
 * ScanTypeSelector
 *
 * Horizontal pill tabs for choosing scan type.
 * Active pill:  brand-primary glow border + dim bg
 * Shows type description below the row for the selected type.
 * Each pill springs in on first render (staggered).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors }         from '../../../theme/colors';
import { radius }         from '../../../theme/radius';
import {
  SCAN_TYPE_META,
  type VerificationSubjectType,
}                         from '../../../domain/verification/verificationTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  label:   t.labelMd ?? t.label  ?? {},
  caption: t.captionSm ?? t.caption ?? {},
};

const SCAN_TYPES: VerificationSubjectType[] = [
  'credential', 'product', 'document', 'login', 'did',
];

interface ScanTypeSelectorProps {
  selected:  VerificationSubjectType;
  onSelect:  (type: VerificationSubjectType) => void;
}

export const ScanTypeSelector: React.FC<ScanTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const descAnim = useRef(new Animated.Value(0)).current;
  const prevSelected = useRef(selected);

  // Animate description on change
  useEffect(() => {
    if (prevSelected.current === selected) return;
    prevSelected.current = selected;
    descAnim.setValue(0);
    Animated.timing(descAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [selected, descAnim]);

  const meta = SCAN_TYPE_META[selected];
  const accentColor = meta.accentColor;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {SCAN_TYPES.map((type, index) => (
          <Pill
            key={type}
            scanType={type}
            isActive={type === selected}
            index={index}
            onPress={() => onSelect(type)}
          />
        ))}
      </ScrollView>

      {/* Description strip */}
      <Animated.View
        style={[
          styles.descRow,
          { borderColor: `${accentColor}40`, opacity: descAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
        ]}
      >
        <Text style={styles.descEmoji}>{meta.emoji}</Text>
        <Text style={styles.descText}>{meta.description}</Text>
      </Animated.View>
    </View>
  );
};

// ── Pill ──────────────────────────────────────────────────────────────────────

const Pill: React.FC<{
  scanType: VerificationSubjectType;
  isActive: boolean;
  index:    number;
  onPress:  () => void;
}> = ({ scanType, isActive, index, onPress }) => {
  const entryAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const meta      = SCAN_TYPE_META[scanType];

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1, speed: 18, bounciness: 6,
      delay: index * 50, useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.90, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, speed: 20, bounciness: 8, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const accentColor = meta.accentColor;

  return (
    <Animated.View
      style={{
        opacity:   entryAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.pill,
          isActive && {
            borderColor:     accentColor,
            backgroundColor: `${accentColor}16`,
            shadowColor:     accentColor,
            shadowOffset:    { width: 0, height: 0 },
            shadowOpacity:   0.55,
            shadowRadius:    10,
            elevation:       4,
          },
        ]}
      >
        <Text style={styles.pillEmoji}>{meta.emoji}</Text>
        <Text style={[
          styles.pillLabel,
          isActive && { color: accentColor, fontWeight: '600' },
        ]}>
          {meta.label}
        </Text>

        {/* Active indicator dot */}
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: accentColor }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap:   { gap: 10 },
  scroll: { flexGrow: 0 },
  row:    { paddingHorizontal: 2, gap: 8, paddingVertical: 3 },

  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 14,
    paddingVertical:   9,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
    backgroundColor:   colors.glass.subtle,
    position:          'relative',
  },
  pillEmoji: { fontSize: 14 },
  pillLabel: {
    ...typo.label,
    color:    colors.text.tertiary,
    fontSize: 12,
  },
  activeDot: {
    position:     'absolute',
    bottom:       -1,
    left:         '50%',
    marginLeft:   -2,
    width:        4,
    height:       4,
    borderRadius: 2,
  },

  // Description strip
  descRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:      radius.xl,
    borderWidth:       1,
    backgroundColor:   colors.glass.subtle,
  },
  descEmoji: { fontSize: 13 },
  descText:  { ...typo.caption, color: colors.text.tertiary, flex: 1 },
});
