/**
 * App.tsx — Root entry point
 *
 * Sequence:
 *   1. AppProviders wraps everything with gesture + safe-area context
 *   2. useAppInit opens SQLite, runs migrations, seeds dev data
 *   3. Splash screen is held until DB is ready
 *   4. AppNavigator renders the full navigation tree
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppProviders } from './src/app/providers/AppProviders';
import { AppNavigator } from './src/app/AppNavigator';
import { useAppInit }   from './src/hooks/useAppInit';

// Inline splash so we don't need a separate file
const SplashGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready } = useAppInit();
  if (!ready) {
    return (
      <View style={splash.root}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }
  return <>{children}</>;
};

const splash = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060E1C', alignItems: 'center', justifyContent: 'center' },
});

const App: React.FC = () => (
  <AppProviders>
    <SplashGate>
      <AppNavigator />
    </SplashGate>
  </AppProviders>
);

export default App;
