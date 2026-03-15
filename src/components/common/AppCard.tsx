import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, type TrustState } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard, type GlowState } from './GlassCard';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  caption?: string;
  trustState?: TrustState;
  /** Left slot — icon or avatar */
  leading?: React.ReactNode;
  /** Right slot — badge or chevron */
  trailing?: React.ReactNode;
  /** Extra content below the header row */
  children?: React.ReactNode;
  onPress?: () => void;
  onTapLayer?: (layer: number) => void;
  revealLayers?: 1 | 2 | 3;
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  caption,
  trustState,
  leading,
  trailing,
  children,
  onPress,
  onTapLayer,
  revealLayers = 1,
  style,
}) => {
  const glowState: GlowState = trustState ?? 'none';

  return (
    <GlassCard
      glowState={glowState}
      revealLayers={revealLayers}
      onTapLayer={onTapLayer}
      style={style}
    >
      <View style={styles.row}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}

        <View style={styles.body}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {caption ? (
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      {children ? <View style={styles.childrenWrap}>{children}</View> : null}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leading: {
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
  },
  trailing: {
    marginLeft: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  caption: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  childrenWrap: {
    marginTop: spacing.md,
  },
});

export default AppCard;