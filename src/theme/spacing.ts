/**
 * Sovereign Trust — Spacing System
 *
 * 4 px base grid. Use semantic aliases wherever possible so future
 * density changes only need one edit here.
 */

export const spacing = {
  // Base scale
  0:    0,
  px:   1,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  11:   44,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
  28:   112,
  32:   128,
} as const;

// ─── Semantic aliases ─────────────────────────────────────────────────────────

/** Component internal padding */
export const inset = {
  xs:   spacing[2],    // 8
  sm:   spacing[3],    // 12
  md:   spacing[4],    // 16
  lg:   spacing[5],    // 20
  xl:   spacing[6],    // 24
  '2xl': spacing[8],   // 32
} as const;

/** Vertical rhythm between stacked elements */
export const stack = {
  xs:   spacing[1],    // 4
  sm:   spacing[2],    // 8
  md:   spacing[3],    // 12
  lg:   spacing[4],    // 16
  xl:   spacing[6],    // 24
  '2xl': spacing[8],   // 32
  '3xl': spacing[12],  // 48
} as const;

/** Horizontal gutter / margin from screen edge */
export const gutter = {
  xs:   spacing[3],    // 12
  sm:   spacing[4],    // 16  ← default screen edge
  md:   spacing[5],    // 20
  lg:   spacing[6],    // 24
} as const;

/** Touch targets */
export const touch = {
  min:    44,
  sm:     36,
  md:     44,
  lg:     52,
  xl:     56,
} as const;

/** Icon sizes */
export const icon = {
  xs:   14,
  sm:   16,
  md:   20,
  lg:   24,
  xl:   28,
  '2xl': 32,
} as const;

export type SpacingKey = keyof typeof spacing;
