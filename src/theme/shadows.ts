/**
 * Sovereign Trust — Liquid Glass Shadow System
 *
 * Deep neon bloom shadows for the liquid glass material system.
 * iOS: native shadows at zero offset = omnidirectional neon glow.
 * Android: elevation fallback.
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

// ─── Depth shadows — deeper than before for space depth ──────────────────────

export const shadows = {
  xs:    iosShadow('#000000', 1,  6,  0.40),
  sm:    iosShadow('#000000', 2,  12, 0.52),
  md:    iosShadow('#000000', 4,  22, 0.60),
  lg:    iosShadow('#000000', 8,  36, 0.68),
  xl:    iosShadow('#000000', 12, 52, 0.74),
  '2xl': iosShadow('#000000', 20, 70, 0.82),

  // ── Trust glow — vivid neon bloom ────────────────────────────────────────
  glowVerified:   iosGlow('#00FF88', 28, 0.60),
  glowTrusted:    iosGlow('#0A84FF', 28, 0.60),
  glowSuspicious: iosGlow('#FF8C00', 28, 0.60),
  glowRevoked:    iosGlow('#FF3355', 28, 0.60),
  glowPending:    iosGlow('#FFD60A', 32, 0.55),
  glowUnknown:    iosGlow('#8E8E93', 18, 0.30),

  // ── Brand glow — electric cyan + neon purple ──────────────────────────────
  glowPrimary: iosGlow('#00E5FF', 36, 0.58),
  glowViolet:  iosGlow('#7C3AED', 36, 0.58),

  // ── Liquid glass card shadow — deep with cyan tint ────────────────────────
  card: iosShadow('#00E5FF', 8, 28, 0.18),
} as const;

// ─── Trust → glow map ────────────────────────────────────────────────────────

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
