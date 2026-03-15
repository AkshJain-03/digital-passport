/**
 * AppCard
 *
 * A composable list/detail card built on GlassCard.
 *
 * Anatomy:
 *   [leading icon] [body: title / subtitle / caption] [trailing: badge, chevron]
 *   [optional children below the header row]
 *
 * Progressive reveal is delegated to GlassCard. Pass revealLayers={2|3}
 * and provide layered children that are conditionally rendered based on
 * tapLayer state (managed by the parent).
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, type TrustState } from '../../theme/colors';
import { typography }              from '../../theme/typography';
import { spacing }                 from '../../theme/spacing';
import { GlassCard, type GlassCardProps } from './GlassCard';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppCardProps
  extends Pick<
    GlassCardProps,
    'glowState' | 'revealLayers' | 'onTapLayer' | 'disabled' | 'style' | 'animateGlow' | 'padding'
  > {
  /** Main title */
  title?: string;

  /** Supporting subtitle */
  subtitle?: string;

  /** Small caption line below subtitle */
  caption?: string;

  /** Left slot — icon container or avatar */
  leading?: React.ReactNode;

  /** Right slot — badge, chevron, switch */
  trailing?: React.ReactNode;

  /** Extra content rendered below the header row */
  children?: React.ReactNode;

  /** Applies trust colours to title and leading icon border */
  trustState?: TrustState;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  caption,
  leading,
  trailing,
  children,
  trustState,
  glowState,
  revealLayers,
  onTapLayer,
  disabled,
  style,
  animateGlow,
  padding = 'md',
}) => {
  // Prefer explicit glowState; fall back to trustState if provided
  const effectiveGlow = glowState ?? trustState ?? 'none';

  return (
    <GlassCard
      glowState={effectiveGlow}
      revealLayers={revealLayers}
      onTapLayer={onTapLayer}
      disabled={disabled}
      style={style}
      animateGlow={animateGlow}
      padding={padding}
    >
      {/* Header row */}
      <View style={styles.row}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}

        <View style={styles.body}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
          {caption ? (
            <Text style={styles.caption} numberOfLines={1}>{caption}</Text>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      {/* Optional expanded content */}
      {children ? <View style={styles.childrenWrap}>{children}</View> : null}
    </GlassCard>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  leading: {
    marginRight: spacing[3],
    flexShrink:  0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  trailing: {
    marginLeft: spacing[3],
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodySm,
    color:     colors.text.secondary,
    marginTop: 2,
  },
  caption: {
    ...typography.caption,
    color:     colors.text.tertiary,
    marginTop: 4,
  },
  childrenWrap: {
    marginTop: spacing[3],
  },
});

export default AppCard;
