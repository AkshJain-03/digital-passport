/**
 * AppHeader
 *
 * Three-slot navigation bar (left | center | right).
 *
 * Variants:
 *   glass       — frosted dark bg, hairline bottom border (default)
 *   transparent — invisible, for screens with their own hero header
 *   solid       — opaque bg for modal sheets
 *
 * Features:
 *   • Animated entry fade on mount
 *   • StatusBar always set to light-content
 *   • HeaderIconButton helper for round icon touch targets
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { colors }     from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { spacing }    from '../../theme/spacing';
import { typography } from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppHeaderVariant = 'glass' | 'transparent' | 'solid';

export interface AppHeaderProps {
  title?:      string;
  subtitle?:   string;
  leftAction?:  React.ReactNode;
  rightAction?: React.ReactNode;
  variant?:    AppHeaderVariant;
  animateIn?:  boolean;
  style?:      StyleProp<ViewStyle>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const HEADER_HEIGHT = 52;

// ─── Component ────────────────────────────────────────────────────────────────

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant   = 'glass',
  animateIn = false,
  style,
}) => {
  const opacity = useRef(new Animated.Value(animateIn ? 0 : 1)).current;

  useEffect(() => {
    if (!animateIn) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [animateIn, opacity]);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View
        style={[
          styles.container,
          { paddingTop: STATUS_BAR_HEIGHT },
          variant === 'glass' && styles.glass,
          variant === 'solid' && styles.solid,
          { opacity },
          style,
        ]}
      >
        {/* Glass blur layer for glass variant */}
        {variant === 'glass' && Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="ultraThinMaterialDark"
            blurAmount={9}
            reducedTransparencyFallbackColor="transparent"
          />
        )}

        <View style={styles.row}>
          {/* Left slot */}
          <View style={styles.side}>
            {leftAction ? <View style={styles.actionWrap}>{leftAction}</View> : null}
          </View>

          {/* Center */}
          <View style={styles.center}>
            {title ? (
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            ) : null}
          </View>

          {/* Right slot */}
          <View style={[styles.side, styles.sideRight]}>
            {rightAction ? <View style={styles.actionWrap}>{rightAction}</View> : null}
          </View>
        </View>

        {variant !== 'transparent' && <View style={styles.divider} />}
      </Animated.View>
    </>
  );
};

// ─── Header icon button ───────────────────────────────────────────────────────

export interface HeaderIconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
}

export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  onPress,
  children,
  accessibilityLabel,
}) => (
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onPress}
    activeOpacity={0.65}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
  >
    {children}
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  glass: {
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(6,8,15,0.28)'
      : colors.bg.overlay,
    overflow: 'hidden' as const,
  },
  solid: {
    backgroundColor: colors.bg.elevated,
  },
  row: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  side: {
    width: 56,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.captionSm,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.hairline,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;
