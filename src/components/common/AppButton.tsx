import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; border: string; text: string }> = {
  primary: {
    bg: colors.brand.primaryDim,
    border: colors.brand.primary,
    text: colors.brand.primary,
  },
  secondary: {
    bg: colors.glass.medium,
    border: colors.border.medium,
    text: colors.text.primary,
  },
  ghost: {
    bg: colors.transparent,
    border: colors.border.subtle,
    text: colors.text.secondary,
  },
  danger: {
    bg: colors.trust.revoked.dim,
    border: colors.trust.revoked.solid,
    text: colors.trust.revoked.solid,
  },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingH: number; borderRadius: number }> = {
  sm: { height: 36, paddingH: 14, borderRadius: radius.lg },
  md: { height: 48, paddingH: 20, borderRadius: radius.xl },
  lg: { height: 56, paddingH: 28, borderRadius: radius['2xl'] },
};

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const textStyle =
    size === 'sm' ? typography.buttonSmall : typography.button;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          {
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.paddingH,
            borderRadius: sizeStyle.borderRadius,
            backgroundColor: variantStyle.bg,
            borderColor: variantStyle.border,
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.4 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
          variant === 'primary' && shadows.glowPrimary,
          style,
        ]}
      >
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text style={[textStyle, { color: variantStyle.text }]}>
          {loading ? '···' : label}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AppButton;