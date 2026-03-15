import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
const HEADER_HEIGHT = 56;

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        transparent ? styles.transparent : styles.glass,
        { paddingTop: STATUS_BAR_HEIGHT },
        style,
      ]}
    >
      <View style={styles.row}>
        {/* Left slot */}
        <View style={styles.side}>
          {leftAction ? (
            <View style={styles.actionWrap}>{leftAction}</View>
          ) : null}
        </View>

        {/* Center */}
        <View style={styles.center}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right slot */}
        <View style={[styles.side, styles.sideRight]}>
          {rightAction ? (
            <View style={styles.actionWrap}>{rightAction}</View>
          ) : null}
        </View>
      </View>

      {/* Bottom border */}
      {!transparent && <View style={styles.divider} />}
    </View>
  );
};

export const HeaderIconButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => (
  <TouchableOpacity style={styles.iconBtn} onPress={onPress} activeOpacity={0.7}>
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  glass: {
    backgroundColor: colors.bg.overlay,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  transparent: {
    backgroundColor: colors.transparent,
  },
  row: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  side: {
    width: 60,
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
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
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
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
});

export default AppHeader;