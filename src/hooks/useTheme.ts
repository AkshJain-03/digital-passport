/**
 * useTheme
 *
 * Returns the active color theme and a toggle function.
 * Currently hard-coded to dark mode (the app ships dark-only).
 * Wire up to React context and AsyncStorage when light mode is added.
 */

import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type ColorThemeShape } from '../theme/colors';

interface UseThemeReturn {
  theme:    ColorThemeShape;
  isDark:   boolean;
  toggle:   () => void;   // no-op until light mode is implemented
}

export const useTheme = (): UseThemeReturn => {
  // Always use dark theme until light mode is designed
  return {
    theme:  darkTheme,
    isDark: true,
    toggle: () => {},
  };
};