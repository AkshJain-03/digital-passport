import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    thin: 'SF Pro Display',
    light: 'SF Pro Display',
    regular: 'SF Pro Text',
    medium: 'SF Pro Text',
    semibold: 'SF Pro Display',
    bold: 'SF Pro Display',
    heavy: 'SF Pro Display',
    mono: 'SF Mono',
  },
  android: {
    thin: 'sans-serif-thin',
    light: 'sans-serif-light',
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif',
    heavy: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    thin: undefined,
    light: undefined,
    regular: undefined,
    medium: undefined,
    semibold: undefined,
    bold: undefined,
    heavy: undefined,
    mono: undefined,
  },
});

export const typography = {
  // Display — hero text
  display: {
    fontFamily: fontFamily?.heavy,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.2,
    fontWeight: '800' as const,
  },

  // Large title
  title1: {
    fontFamily: fontFamily?.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontWeight: '700' as const,
  },

  title2: {
    fontFamily: fontFamily?.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
    fontWeight: '600' as const,
  },

  title3: {
    fontFamily: fontFamily?.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
    fontWeight: '600' as const,
  },

  // Section headings
  headline: {
    fontFamily: fontFamily?.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },

  // Body text
  body: {
    fontFamily: fontFamily?.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },

  bodySmall: {
    fontFamily: fontFamily?.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },

  // Supporting text
  caption: {
    fontFamily: fontFamily?.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '400' as const,
  },

  // Labels — uppercase tracking
  label: {
    fontFamily: fontFamily?.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
    fontWeight: '600' as const,
  },

  // Mono — hashes, DIDs, technical data
  mono: {
    fontFamily: fontFamily?.mono,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '400' as const,
  },

  // Button labels
  button: {
    fontFamily: fontFamily?.semibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: '600' as const,
  },

  buttonSmall: {
    fontFamily: fontFamily?.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
} as any;

// Backwards-compatibility aliases for older code that used different names
;(typography as any).bodySm = (typography as any).bodySmall;
;(typography as any).captionSm = (typography as any).caption;
;(typography as any).buttonSm = (typography as any).buttonSmall;
;(typography as any).headlineSm = (typography as any).headline;
;(typography as any).labelMd = (typography as any).label;
;(typography as any).buttonXs = (typography as any).buttonSmall;