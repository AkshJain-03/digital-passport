/**
 * Sovereign Trust — Shadow System
 *
 * iOS uses native shadows; Android uses elevation.
 * Glow shadows use trust-state hues with zero offset
 * to produce omnidirectional neon bloom.
 */

import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

const iosShadow = (
  color: string,
  offsetY: number,
  radius: number,
  opacity: number,
): ShadowStyle =>
  Platform.OS === 'ios'
    ? { shadowColor: color, shadowOffset: { width: 0, height: offsetY }, shadowOpacity: opacity, shadowRadius: radius }
    : { elevation: Math.max(1, Math.round(radius / 3)) };

const iosGlow = (color: string, radius: number, opacity: number): ShadowStyle =>
  Platform.OS === 'ios'
    ? { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: opacity, shadowRadius: radius }
    : { elevation: Math.max(2, Math.round(radius / 4)) };

// ─── Depth shadows ────────────────────────────────────────────────────────────

export const shadows = {
  // Standard depth
  xs:  iosShadow('#000000', 1,  4,  0.20),
  sm:  iosShadow('#000000', 2,  8,  0.28),
  md:  iosShadow('#000000', 4,  16, 0.36),
  lg:  iosShadow('#000000', 8,  24, 0.42),
  xl:  iosShadow('#000000', 12, 36, 0.48),
  '2xl': iosShadow('#000000', 20, 48, 0.55),

  // ── Trust glow (neon bloom) ───────────────────────────────────────────────
  glowVerified:   iosGlow('#00FF88', 20, 0.45),
  glowTrusted:    iosGlow('#0A84FF', 20, 0.45),
  glowSuspicious: iosGlow('#FF8C00', 20, 0.45),
  glowRevoked:    iosGlow('#FF3355', 20, 0.45),
  glowPending:    iosGlow('#FFD60A', 22, 0.40),
  glowUnknown:    iosGlow('#8E8E93', 14, 0.25),

  // ── Brand glow ────────────────────────────────────────────────────────────
  glowPrimary:    iosGlow('#00D4FF', 18, 0.40),
  glowViolet:     iosGlow('#7B61FF', 18, 0.40),

  // ── Subtle card lift (depth + slight glow) ────────────────────────────────
  card: iosShadow('#000000', 4, 20, 0.32),
} as const;

// ─── Trust → shadow map ───────────────────────────────────────────────────────

import type { GlowState } from './colors';

export const GLOW_SHADOW: Record<GlowState, ShadowStyle> = {
  verified:   shadows.glowVerified,
  trusted:    shadows.glowTrusted,
  suspicious: shadows.glowSuspicious,
  revoked:    shadows.glowRevoked,
  pending:    shadows.glowPending,
  unknown:    shadows.glowUnknown,
  primary:    shadows.glowPrimary,
  none:       {},
};

export type ShadowKey = keyof typeof shadows;
