export const colors = {
  // Backgrounds
  bg: {
    base: '#050A14',
    surface: '#0A1628',
    elevated: '#0F1F3D',
    overlay: 'rgba(5, 10, 20, 0.92)',
  },

  // Glass layers
  glass: {
    subtle: 'rgba(255, 255, 255, 0.03)',
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.09)',
    heavy: 'rgba(255, 255, 255, 0.13)',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    light: 'rgba(255, 255, 255, 0.10)',
    medium: 'rgba(255, 255, 255, 0.16)',
    strong: 'rgba(255, 255, 255, 0.24)',
    hairline: 'rgba(255, 255, 255, 0.06)',
  },

  // Brand
  brand: {
    primary: '#00D4FF',
    primaryDim: 'rgba(0, 212, 255, 0.15)',
    secondary: '#7B61FF',
    secondaryDim: 'rgba(123, 97, 255, 0.15)',
  },

  // Trust states — glow colors
  trust: {
    verified: {
      solid: '#00FF88',
      dim: 'rgba(0, 255, 136, 0.12)',
      glow: 'rgba(0, 255, 136, 0.35)',
    },
    trusted: {
      solid: '#0A84FF',
      dim: 'rgba(10, 132, 255, 0.12)',
      glow: 'rgba(10, 132, 255, 0.35)',
    },
    suspicious: {
      solid: '#FF8C00',
      dim: 'rgba(255, 140, 0, 0.12)',
      glow: 'rgba(255, 140, 0, 0.35)',
    },
    revoked: {
      solid: '#FF3355',
      dim: 'rgba(255, 51, 85, 0.12)',
      glow: 'rgba(255, 51, 85, 0.35)',
    },
    pending: {
      solid: '#FFD60A',
      dim: 'rgba(255, 214, 10, 0.12)',
      glow: 'rgba(255, 214, 10, 0.35)',
    },
    unknown: {
      solid: 'rgba(255, 255, 255, 0.3)',
      dim: 'rgba(255, 255, 255, 0.06)',
      glow: 'rgba(255, 255, 255, 0.15)',
    },
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.60)',
    tertiary: 'rgba(255, 255, 255, 0.35)',
    quaternary: 'rgba(255, 255, 255, 0.18)',
    inverse: '#050A14',
    accent: '#00D4FF',
  },

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type TrustState = 'verified' | 'trusted' | 'suspicious' | 'revoked' | 'pending' | 'unknown';
export type GlowState = TrustState | 'primary' | 'none';

export const getTrustColors = (state: TrustState) => ({
  color: colors.trust[state],
  dim: colors.trust[`${state}Dim` as keyof typeof colors.trust],
  glow: colors.trust[`${state}Glow` as keyof typeof colors.trust],
});

// Trust colors mapping for convenient use in components
export const TRUST_COLORS: Record<TrustState, { solid: string; dim: string; glow: string }> = {
  verified: colors.trust.verified,
  trusted: colors.trust.trusted,
  suspicious: colors.trust.suspicious,
  revoked: colors.trust.revoked,
  pending: colors.trust.pending,
  unknown: colors.trust.unknown,
};

// Trust state display labels
export const TRUST_STATE_LABELS: Record<TrustState, string> = {
  verified: 'Verified',
  trusted: 'Trusted',
  suspicious: 'Suspicious',
  revoked: 'Revoked',
  pending: 'Pending',
  unknown: 'Unknown',
};

// Light/dark theme shims (kept minimal for now)
export const darkTheme = colors;
export const lightTheme = colors;
export type ColorThemeShape = typeof colors;