/**
 * Sovereign Trust — Typography System
 *
 * Uses native system typefaces on each platform.
 * Scale is inspired by Apple HIG with custom tracking for the
 * "intelligent, premium" aesthetic demanded by the product.
 *
 * Convention:
 *   display   — hero numbers, trust scores
 *   title1-3  — screen/section headings
 *   headline  — card titles, list items
 *   body      — paragraph copy
 *   caption   — supporting details, timestamps
 *   label     — ALL CAPS micro labels
 *   mono      — DIDs, hashes, technical strings
 *   button    — interactive labels
 */

import { Platform } from 'react-native';

const FONT = Platform.select({
  ios: {
    ultraLight: 'System',
    thin:       'System',
    light:      'System',
    regular:    'System',
    medium:     'System',
    semibold:   'System',
    bold:       'System',
    heavy:      'System',
    black:      'System',
    mono:       'Menlo',
  },
  android: {
    ultraLight: 'sans-serif-thin',
    thin:       'sans-serif-thin',
    light:      'sans-serif-light',
    regular:    'sans-serif',
    medium:     'sans-serif-medium',
    semibold:   'sans-serif-medium',
    bold:       'sans-serif',
    heavy:      'sans-serif',
    black:      'sans-serif',
    mono:       'monospace',
  },
  default: {
    ultraLight: undefined,
    thin:       undefined,
    light:      undefined,
    regular:    undefined,
    medium:     undefined,
    semibold:   undefined,
    bold:       undefined,
    heavy:      undefined,
    black:      undefined,
    mono:       undefined,
  },
});

type TextWeight = '100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900';

interface TextStyle {
  fontFamily:    string | undefined;
  fontSize:      number;
  lineHeight:    number;
  letterSpacing: number;
  fontWeight:    TextWeight;
}

const make = (
  family: string | undefined,
  size: number,
  lh: number,
  tracking: number,
  weight: TextWeight,
): TextStyle => ({
  fontFamily:    family,
  fontSize:      size,
  lineHeight:    lh,
  letterSpacing: tracking,
  fontWeight:    weight,
});

export const typography = {
  // ── Display: hero metrics, trust scores ──────────────────────────────────
  display:  make(FONT?.black,    48, 52, -2.0, '900'),
  displaySm:make(FONT?.heavy,    36, 42, -1.4, '800'),

  // ── Titles ────────────────────────────────────────────────────────────────
  title1:   make(FONT?.bold,     28, 36, -0.8, '700'),
  title2:   make(FONT?.semibold, 22, 30, -0.5, '600'),
  title3:   make(FONT?.semibold, 18, 25, -0.3, '600'),

  // ── Headline ─────────────────────────────────────────────────────────────
  headline: make(FONT?.semibold, 15, 21,  0.05, '600'),
  headlineSm: make(FONT?.medium, 14, 20,  0.03, '500'),

  // ── Body ──────────────────────────────────────────────────────────────────
  body:     make(FONT?.regular,  15, 23,  0.02, '400'),
  bodyMd:   make(FONT?.regular,  14, 21,  0.02, '400'),
  bodySm:   make(FONT?.regular,  13, 19,  0.02, '400'),

  // ── Caption ───────────────────────────────────────────────────────────────
  caption:  make(FONT?.regular,  12, 17,  0.2, '400'),
  captionSm:make(FONT?.regular,  11, 16,  0.3, '400'),

  // ── Labels — ALL CAPS micro text ─────────────────────────────────────────
  label:    make(FONT?.semibold, 10, 14,  1.2, '600'),
  labelMd:  make(FONT?.semibold, 11, 15,  0.8, '600'),
  labelLg:  make(FONT?.semibold, 12, 16,  0.6, '600'),

  // ── Mono — DIDs, hashes, addresses ───────────────────────────────────────
  mono:     make(FONT?.mono,     11, 16,  0.5, '400'),
  monoMd:   make(FONT?.mono,     13, 18,  0.3, '400'),

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttonLg: make(FONT?.semibold, 17, 22, -0.2, '600'),
  button:   make(FONT?.semibold, 15, 20, -0.1, '600'),
  buttonSm: make(FONT?.semibold, 13, 18,  0.0, '600'),
  buttonXs: make(FONT?.semibold, 12, 16,  0.1, '600'),

  // ── Navigation ────────────────────────────────────────────────────────────
  tabLabel: make(FONT?.semibold,  9, 12,  0.3, '600'),
} as const;

// ── Semantic aliases (Task 6) ─────────────────────────────────────────────────

export const semanticTypography = {
  headlineLarge:  typography.title1,
  headlineMedium: typography.title2,
  title:          typography.title3,
  body:           typography.body,
  caption:        typography.caption,
  mono:           typography.mono,
} as const;

export type TypographyKey = keyof typeof typography;
export type SemanticTypographyKey = keyof typeof semanticTypography;
