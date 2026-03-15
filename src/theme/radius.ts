/**
 * Sovereign Trust — Border Radius Scale
 *
 * Larger radii dominate the UI, giving the glass-card aesthetic
 * its smooth, premium feel. Tight radii are reserved for inline chips.
 */

export const radius = {
  none:   0,
  xs:     4,
  sm:     8,
  md:     12,
  lg:     16,
  xl:     20,
  '2xl':  24,
  '3xl':  28,
  '4xl':  32,
  '5xl':  40,
  full:   9999,
} as const;

export type RadiusKey = keyof typeof radius;
