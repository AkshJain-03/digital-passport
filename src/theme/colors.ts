/**
 * Sovereign Trust — Color System
 *
 * Deep-space dark base (default) + clean light variant.
 * Every trust state owns a distinct hue so users read verification
 * outcomes before processing text.
 *
 *   verified   → #00FF88  emerald   (safe, authentic)
 *   trusted    → #0A84FF  sapphire  (known issuer)
 *   suspicious → #FF8C00  amber     (caution)
 *   revoked    → #FF3355  crimson   (invalid)
 *   pending    → #FFD60A  gold      (in-progress)
 *   unknown    → #8E8E93  ash       (no data)
 */

// ─── Raw palette ──────────────────────────────────────────────────────────────

const RAW = {
  space0:      '#020810',
  space1:      '#060E1C',
  space2:      '#0A1628',
  space3:      '#0F1F3D',
  space4:      '#152849',

  emerald:     '#00FF88',
  emeraldMid:  '#00CC6E',
  sapphire:    '#0A84FF',
  sapphireMid: '#0070E0',
  amber:       '#FF8C00',
  amberMid:    '#E07A00',
  crimson:     '#FF3355',
  crimsonMid:  '#E0294A',
  gold:        '#FFD60A',
  goldMid:     '#E0BC00',
  ash:         '#8E8E93',
  ashMid:      '#6A6A70',

  cyan:        '#00D4FF',
  cyanMid:     '#00B8E0',
  violet:      '#7B61FF',
  violetMid:   '#6248E0',

  white:       '#FFFFFF',
  black:       '#000000',
} as const;

// ─── Trust state ──────────────────────────────────────────────────────────────

export type TrustState =
  | 'verified'
  | 'trusted'
  | 'suspicious'
  | 'revoked'
  | 'pending'
  | 'unknown';

export type GlowState = TrustState | 'primary' | 'none';

// ─── Trust color tokens ───────────────────────────────────────────────────────

export interface TrustTokens {
  solid:      string;
  mid:        string;
  dim:        string;
  glow:       string;
  subtleGlow: string;
}

export const TRUST_COLORS: Record<TrustState, TrustTokens> = {
  verified: {
    solid:      RAW.emerald,
    mid:        RAW.emeraldMid,
    dim:        'rgba(0,255,136,0.10)',
    glow:       'rgba(0,255,136,0.40)',
    subtleGlow: 'rgba(0,255,136,0.18)',
  },
  trusted: {
    solid:      RAW.sapphire,
    mid:        RAW.sapphireMid,
    dim:        'rgba(10,132,255,0.10)',
    glow:       'rgba(10,132,255,0.40)',
    subtleGlow: 'rgba(10,132,255,0.18)',
  },
  suspicious: {
    solid:      RAW.amber,
    mid:        RAW.amberMid,
    dim:        'rgba(255,140,0,0.10)',
    glow:       'rgba(255,140,0,0.40)',
    subtleGlow: 'rgba(255,140,0,0.18)',
  },
  revoked: {
    solid:      RAW.crimson,
    mid:        RAW.crimsonMid,
    dim:        'rgba(255,51,85,0.10)',
    glow:       'rgba(255,51,85,0.40)',
    subtleGlow: 'rgba(255,51,85,0.18)',
  },
  pending: {
    solid:      RAW.gold,
    mid:        RAW.goldMid,
    dim:        'rgba(255,214,10,0.10)',
    glow:       'rgba(255,214,10,0.40)',
    subtleGlow: 'rgba(255,214,10,0.18)',
  },
  unknown: {
    solid:      RAW.ash,
    mid:        RAW.ashMid,
    dim:        'rgba(142,142,147,0.10)',
    glow:       'rgba(142,142,147,0.25)',
    subtleGlow: 'rgba(142,142,147,0.12)',
  },
};

// ─── Theme shape ──────────────────────────────────────────────────────────────

export interface ColorThemeShape {
  bg: {
    base: string; deep: string; surface: string;
    elevated: string; float: string; overlay: string; scrim: string;
  };
  glass: {
    ultra: string; subtle: string; light: string;
    medium: string; heavy: string; opaque: string;
  };
  border: {
    hairline: string; subtle: string; light: string;
    medium: string; strong: string; focus: string;
  };
  text: {
    primary: string; secondary: string; tertiary: string;
    quaternary: string; disabled: string; inverse: string;
    accent: string; link: string;
  };
  brand: {
    primary: string; primaryMid: string; primaryDim: string; primaryGlow: string;
    secondary: string; secondaryMid: string; secondaryDim: string;
  };
  trust: Record<TrustState, TrustTokens>;
  interactive: {
    pressed: string; hover: string; selected: string; focus: string;
  };
  status: {
    error: string; errorDim: string; warning: string; warningDim: string;
    success: string; successDim: string; info: string; infoDim: string;
  };
  gradient: {
    bgMesh: string[];
    cyanSweep: string[];
    shimmer: string[];
    trust: Record<TrustState, string[]>;
  };
  raw: typeof RAW;
  transparent: 'transparent';
  white: string;
  black: string;
}

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkTheme: ColorThemeShape = {
  bg: {
    base:     RAW.space1,
    deep:     RAW.space0,
    surface:  RAW.space2,
    elevated: RAW.space3,
    float:    RAW.space4,
    overlay:  'rgba(6,14,28,0.94)',
    scrim:    'rgba(2,8,16,0.85)',
  },
  glass: {
    ultra:   'rgba(255,255,255,0.02)',
    subtle:  'rgba(255,255,255,0.04)',
    light:   'rgba(255,255,255,0.06)',
    medium:  'rgba(255,255,255,0.09)',
    heavy:   'rgba(255,255,255,0.13)',
    opaque:  'rgba(255,255,255,0.18)',
  },
  border: {
    hairline: 'rgba(255,255,255,0.05)',
    subtle:   'rgba(255,255,255,0.08)',
    light:    'rgba(255,255,255,0.12)',
    medium:   'rgba(255,255,255,0.18)',
    strong:   'rgba(255,255,255,0.28)',
    focus:    RAW.cyan,
  },
  text: {
    primary:    '#FFFFFF',
    secondary:  'rgba(255,255,255,0.65)',
    tertiary:   'rgba(255,255,255,0.40)',
    quaternary: 'rgba(255,255,255,0.22)',
    disabled:   'rgba(255,255,255,0.14)',
    inverse:    RAW.space1,
    accent:     RAW.cyan,
    link:       RAW.sapphire,
  },
  brand: {
    primary:      RAW.cyan,
    primaryMid:   RAW.cyanMid,
    primaryDim:   'rgba(0,212,255,0.12)',
    primaryGlow:  'rgba(0,212,255,0.35)',
    secondary:    RAW.violet,
    secondaryMid: RAW.violetMid,
    secondaryDim: 'rgba(123,97,255,0.12)',
  },
  trust: TRUST_COLORS,
  interactive: {
    pressed:  'rgba(255,255,255,0.08)',
    hover:    'rgba(255,255,255,0.05)',
    selected: 'rgba(0,212,255,0.12)',
    focus:    'rgba(0,212,255,0.20)',
  },
  status: {
    error:       RAW.crimson,    errorDim:   'rgba(255,51,85,0.10)',
    warning:     RAW.amber,      warningDim: 'rgba(255,140,0,0.10)',
    success:     RAW.emerald,    successDim: 'rgba(0,255,136,0.10)',
    info:        RAW.sapphire,   infoDim:    'rgba(10,132,255,0.10)',
  },
  gradient: {
    bgMesh:    [RAW.space1, RAW.space0],
    cyanSweep: ['rgba(0,212,255,0.0)', 'rgba(0,212,255,0.12)', 'rgba(0,212,255,0.0)'],
    shimmer:   ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.0)'],
    trust: {
      verified:   ['rgba(0,255,136,0.20)',  'rgba(0,255,136,0.0)'],
      trusted:    ['rgba(10,132,255,0.20)', 'rgba(10,132,255,0.0)'],
      suspicious: ['rgba(255,140,0,0.20)',  'rgba(255,140,0,0.0)'],
      revoked:    ['rgba(255,51,85,0.20)',  'rgba(255,51,85,0.0)'],
      pending:    ['rgba(255,214,10,0.20)', 'rgba(255,214,10,0.0)'],
      unknown:    ['rgba(142,142,147,0.12)','rgba(142,142,147,0.0)'],
    },
  },
  raw: RAW,
  transparent: 'transparent',
  white:        RAW.white,
  black:        RAW.black,
};

// ─── Light theme ──────────────────────────────────────────────────────────────

export const lightTheme: ColorThemeShape = {
  bg: {
    base:     '#F0F4FF',
    deep:     '#E4EAF8',
    surface:  '#FFFFFF',
    elevated: '#FFFFFF',
    float:    '#FFFFFF',
    overlay:  'rgba(240,244,255,0.96)',
    scrim:    'rgba(10,20,50,0.50)',
  },
  glass: {
    ultra:   'rgba(0,0,0,0.01)',
    subtle:  'rgba(0,0,0,0.02)',
    light:   'rgba(0,0,0,0.04)',
    medium:  'rgba(0,0,0,0.06)',
    heavy:   'rgba(0,0,0,0.09)',
    opaque:  'rgba(0,0,0,0.14)',
  },
  border: {
    hairline: 'rgba(0,0,0,0.05)',
    subtle:   'rgba(0,0,0,0.08)',
    light:    'rgba(0,0,0,0.12)',
    medium:   'rgba(0,0,0,0.18)',
    strong:   'rgba(0,0,0,0.28)',
    focus:    RAW.cyanMid,
  },
  text: {
    primary:    '#0A0F1E',
    secondary:  'rgba(10,15,30,0.65)',
    tertiary:   'rgba(10,15,30,0.40)',
    quaternary: 'rgba(10,15,30,0.22)',
    disabled:   'rgba(10,15,30,0.14)',
    inverse:    '#FFFFFF',
    accent:     RAW.cyanMid,
    link:       RAW.sapphireMid,
  },
  brand: {
    primary:      RAW.cyanMid,
    primaryMid:   RAW.cyan,
    primaryDim:   'rgba(0,184,224,0.10)',
    primaryGlow:  'rgba(0,184,224,0.25)',
    secondary:    RAW.violetMid,
    secondaryMid: RAW.violet,
    secondaryDim: 'rgba(98,72,224,0.10)',
  },
  trust: TRUST_COLORS,
  interactive: {
    pressed:  'rgba(0,0,0,0.06)',
    hover:    'rgba(0,0,0,0.03)',
    selected: 'rgba(0,184,224,0.10)',
    focus:    'rgba(0,184,224,0.18)',
  },
  status: {
    error:       RAW.crimsonMid,  errorDim:   'rgba(224,41,74,0.08)',
    warning:     RAW.amberMid,    warningDim: 'rgba(224,122,0,0.08)',
    success:     RAW.emeraldMid,  successDim: 'rgba(0,204,110,0.08)',
    info:        RAW.sapphireMid, infoDim:    'rgba(0,112,224,0.08)',
  },
  gradient: {
    bgMesh:    ['#F0F4FF', '#E4EAF8'],
    cyanSweep: ['rgba(0,184,224,0.0)', 'rgba(0,184,224,0.08)', 'rgba(0,184,224,0.0)'],
    shimmer:   ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.60)', 'rgba(255,255,255,0.0)'],
    trust: {
      verified:   ['rgba(0,204,110,0.12)',  'rgba(0,204,110,0.0)'],
      trusted:    ['rgba(0,112,224,0.12)',  'rgba(0,112,224,0.0)'],
      suspicious: ['rgba(224,122,0,0.12)',  'rgba(224,122,0,0.0)'],
      revoked:    ['rgba(224,41,74,0.12)',  'rgba(224,41,74,0.0)'],
      pending:    ['rgba(224,188,0,0.12)',  'rgba(224,188,0,0.0)'],
      unknown:    ['rgba(106,106,112,0.08)','rgba(106,106,112,0.0)'],
    },
  },
  raw: RAW,
  transparent: 'transparent',
  white:        RAW.white,
  black:        RAW.black,
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export type Theme = ColorThemeShape;
export type ColorThemeVariant = 'dark' | 'light';

/** Default active theme — dark. Swap to lightTheme for light mode. */
export const colors: Theme = darkTheme;

// ─── Utility helpers ──────────────────────────────────────────────────────────

export const getTrustToken = (state: TrustState): TrustTokens =>
  TRUST_COLORS[state];

export const resolveGlowBorder = (
  state: GlowState,
  theme: Theme = darkTheme,
): string => {
  if (state === 'none')    return theme.border.light;
  if (state === 'primary') return theme.brand.primary;
  return TRUST_COLORS[state].solid;
};

export const resolveGlowBg = (
  state: GlowState,
  theme: Theme = darkTheme,
): string => {
  if (state === 'none')    return theme.glass.light;
  if (state === 'primary') return theme.brand.primaryDim;
  return TRUST_COLORS[state].dim;
};

export const resolveGlowShadowColor = (
  state: GlowState,
  theme: Theme = darkTheme,
): string => {
  if (state === 'none')    return 'transparent';
  if (state === 'primary') return theme.brand.primaryGlow;
  return TRUST_COLORS[state].glow;
};

export const TRUST_STATE_LABELS: Record<TrustState, string> = {
  verified:   'Verified',
  trusted:    'Trusted',
  suspicious: 'Suspicious',
  revoked:    'Revoked',
  pending:    'Pending',
  unknown:    'Unknown',
};
