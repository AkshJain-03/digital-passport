/**
 * AppSectionTitle
 *
 * Section heading row with:
 *   • ALL-CAPS micro label (left)
 *   • Optional inline count badge
 *   • Optional "See all / action" link (right)
 *
 * Used above every content section on Home, Passport, TruthFeed, etc.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors }     from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { spacing }    from '../../theme/spacing';
import { typography } from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppSectionTitleProps {
  /** Section heading text */
  title: string;

  /** Optional numeric count shown next to the title */
  count?: number;

  /** Right-side action label (e.g. "See all") */
  actionLabel?: string;

  /** Called when action label is tapped */
  onAction?: () => void;

  /** Extra top/bottom margin variant */
  spacing?: 'tight' | 'normal' | 'loose';

  style?: StyleProp<ViewStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AppSectionTitle: React.FC<AppSectionTitleProps> = ({
  title,
  count,
  actionLabel,
  onAction,
  spacing: spacingVariant = 'normal',
  style,
}) => {
  const verticalPadding = SPACING_MAP[spacingVariant];

  return (
    <View style={[styles.row, { paddingVertical: verticalPadding }, style]}>
      {/* Left: title + optional count */}
      <View style={styles.left}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>

        {count !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>

      {/* Right: optional action */}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.65}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Spacing map ──────────────────────────────────────────────────────────────

const SPACING_MAP: Record<'tight' | 'normal' | 'loose', number> = {
  tight:  4,
  normal: 8,
  loose:  12,
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  title: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  countBadge: {
    minWidth:         18,
    height:           18,
    borderRadius:     radius.full,
    backgroundColor:  colors.glass.heavy,
    borderWidth:      1,
    borderColor:      colors.border.subtle,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 4,
  },
  countText: {
    ...typography.label,
    fontSize: 9,
    color:    colors.text.quaternary,
  },
  action: {
    ...typography.captionSm,
    color: colors.brand.primary,
  },
});

export default AppSectionTitle;
