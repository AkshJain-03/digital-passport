/**
 * AppProviders
 *
 * Composes all root-level React context providers in one place.
 * Wrap AppNavigator with this so every screen has access to
 * shared contexts without prop-drilling.
 *
 * Current providers:
 *   - SafeAreaProvider  (react-native-safe-area-context)
 *   - GestureHandlerRootView (react-native-gesture-handler)
 *   - ThemeContext      (dark/light mode — future)
 *
 * Add new providers here as the app grows — order matters:
 * providers that depend on other providers must be nested inside them.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default AppProviders;