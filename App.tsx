/**
 * App.tsx — Root entry point
 *
 * Sequence:
 *   1. AppProviders — gesture + safe area context
 *   2. LiquidAmbientBackground — deep space base layer
 *   3. useAppInit — opens SQLite, runs migrations, seeds dev data
 *   4. AppNavigator — full navigation tree
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppProviders }             from './src/app/providers/AppProviders';
import { AppNavigator }             from './src/app/AppNavigator';
import { LiquidAmbientBackground }  from './src/components/common/LiquidAmbientBackground';
import { useAppInit }               from './src/hooks/useAppInit';

const SplashGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready } = useAppInit();
  if (!ready) {
    return (
      <View style={splash.root}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }
  return <>{children}</>;
};

const splash = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#05070F',
    alignItems:      'center',
    justifyContent:  'center',
  },
});

const App: React.FC = () => (
  <AppProviders>
    <LiquidAmbientBackground>
      <SplashGate>
        <AppNavigator />
      </SplashGate>
    </LiquidAmbientBackground>
  </AppProviders>
);

export default App;
