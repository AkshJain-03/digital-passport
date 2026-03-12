import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './src/screens/Home';
import Verify from './src/screens/Verify';
import Passport from './src/screens/Passport';
import Scan from './src/screens/Scan';
import Handshake from './src/screens/Handshake';
import TruthFeed from './src/feed/TruthFeed';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Sovereign Trust Passport' }}
        />
        <Stack.Screen
          name="Verify"
          component={Verify}
          options={{ title: 'Verify Identity' }}
        />
        <Stack.Screen
          name="Passport"
          component={Passport}
          options={{ title: 'My Passport' }}
        />
        <Stack.Screen
          name="Scan"
          component={Scan}
          options={{ title: 'Scan & Verify' }}
        />
        <Stack.Screen
          name="Handshake"
          component={Handshake}
          options={{ title: 'Trust Handshake' }}
        />
        <Stack.Screen
          name="TruthFeed"
          component={TruthFeed}
          options={{ title: 'Truth Feed' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
