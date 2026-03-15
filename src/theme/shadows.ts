import { Platform } from 'react-native';

const shadow = (
  color: string,
  offset: { width: number; height: number },
  radius: number,
  opacity: number,
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.round(radius / 2),
    },
    default: {},
  });

export const shadows = {
  // Standard depth
  sm: shadow('#000000', { width: 0, height: 2 }, 8, 0.3),
  md: shadow('#000000', { width: 0, height: 4 }, 16, 0.4),
  lg: shadow('#000000', { width: 0, height: 8 }, 32, 0.5),
  xl: shadow('#000000', { width: 0, height: 16 }, 48, 0.6),

  // Trust glow shadows — used on GlassCard
  glowVerified: shadow('#00FF88', { width: 0, height: 0 }, 24, 0.4),
  glowTrusted: shadow('#0A84FF', { width: 0, height: 0 }, 24, 0.4),
  glowSuspicious: shadow('#FF8C00', { width: 0, height: 0 }, 24, 0.4),
  glowRevoked: shadow('#FF3355', { width: 0, height: 0 }, 24, 0.4),
  glowPending: shadow('#FFD60A', { width: 0, height: 0 }, 24, 0.4),
  glowPrimary: shadow('#00D4FF', { width: 0, height: 0 }, 20, 0.35),
} as const;