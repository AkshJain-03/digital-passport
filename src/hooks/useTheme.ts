/**
 * useTheme
 *
 * Returns the active color theme and a toggle function.
 * Currently hard-coded to dark mode (ships dark-only).
 * Wire up to React context + AsyncStorage when light mode is added.
 */

import { darkTheme, lightTheme, type Theme } from '../theme/colors';

interface UseThemeReturn {
  theme:  Theme;
  isDark: boolean;
  toggle: () => void;   // no-op until light mode is designed
}

export const useTheme = (): UseThemeReturn => ({
  theme:  darkTheme,
  isDark: true,
  toggle: () => {},
});
