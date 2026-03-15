/**
 * AppNavigator
 *
 * Root navigation structure:
 *   RootStack
 *     └─ MainTabs (bottom tab navigator)
 *          ├─ Home
 *          ├─ Scan         (raised center button)
 *          ├─ Passport
 *          ├─ Verify
 *          └─ TruthFeed
 *     └─ Handshake  (modal)
 *     └─ Settings   (push)
 *
 * Custom floating glass pill tab bar with:
 *   • Spring-animated active indicator
 *   • Per-tab trust glow dot for active state
 *   • Raised Scan FAB center button
 */

import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer }                        from '@react-navigation/native';
import { createNativeStackNavigator }                 from '@react-navigation/native-stack';
import { createBottomTabNavigator }                   from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps }                     from '@react-navigation/bottom-tabs';

import { colors }   from '../theme/colors';
import { radius }   from '../theme/radius';
import { shadows }  from '../theme/shadows';
import { spacing }  from '../theme/spacing';
import { typography } from '../theme/typography';

import { HomeScreen }             from '../screens/home/HomeScreen';
import { ScanScreen }             from '../screens/scan/ScanScreen';
import { PassportScreen }         from '../screens/passport/PassportScreen';
import { VerifyScreen }           from '../screens/verify/VerifyScreen';
import { TruthFeedScreen }        from '../screens/truthFeed/TruthFeedScreen';
import { HandshakeScreen }        from '../screens/handshake/HandshakeScreen';
import { SettingsScreen }         from '../screens/settings/SettingsScreen';
import { CredentialListScreen }   from '../screens/credentials/CredentialListScreen';
import { ProductDetailScreen }   from '../screens/products/ProductDetailScreen';

import { ROUTES, type TabParamList, type RootStackParamList } from './routes';

const Tab   = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Tab config ────────────────────────────────────────────────────────────────

interface TabConfig {
  route:  string;
  label:  string;
  icon:   string;
  isScan: boolean;
}

const TABS: TabConfig[] = [
  { route: ROUTES.HOME,       label: 'Home',     icon: '⌂',  isScan: false },
  { route: ROUTES.VERIFY,     label: 'Verify',   icon: '◎',  isScan: false },
  { route: ROUTES.SCAN,       label: 'Scan',     icon: '⊡',  isScan: true  },
  { route: ROUTES.PASSPORT,   label: 'Passport', icon: '◈',  isScan: false },
  { route: ROUTES.TRUTH_FEED, label: 'Feed',     icon: '⊕',  isScan: false },
];

// ─── Custom tab bar ────────────────────────────────────────────────────────────

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const glowScale = useRef(new Animated.Value(1)).current;

  const handlePress = (routeName: string, index: number) => {
    // Spring bounce on press
    Animated.sequence([
      Animated.timing(glowScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(glowScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
    navigation.navigate(routeName);
  };

  return (
    <View style={tabStyles.outerWrap} pointerEvents="box-none">
      <View style={[tabStyles.pill, shadows.lg]}>
        {TABS.map((tab, index) => {
          const isActive = state.index === index;

          if (tab.isScan) {
            return (
              <TouchableOpacity
                key={tab.route}
                style={tabStyles.fabWrap}
                onPress={() => handlePress(tab.route, index)}
                activeOpacity={0.85}
              >
                <Animated.View
                  style={[
                    tabStyles.fab,
                    isActive && tabStyles.fabActive,
                    { transform: [{ scale: isActive ? glowScale : 1 }] },
                  ]}
                >
                  <Text style={tabStyles.fabIcon}>{tab.icon}</Text>
                </Animated.View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.route}
              style={tabStyles.tab}
              onPress={() => handlePress(tab.route, index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  tabStyles.tabIcon,
                  isActive && { color: colors.brand.primary },
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  tabStyles.tabLabel,
                  isActive && { color: colors.brand.primary },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={tabStyles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const tabStyles = StyleSheet.create({
  outerWrap: {
    position:         'absolute',
    bottom:           Platform.OS === 'ios' ? 28 : 16,
    left:             spacing.xs,
    right:            spacing.xs,
    alignItems:       'center',
  },
  pill: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.bg.elevated,
    borderRadius:     radius['3xl'],
    borderWidth:      1,
    borderColor:      colors.border.light,
    paddingHorizontal: spacing.xxs,
    paddingVertical:  spacing.xxs,
    width:            '100%',
  },
  tab: {
    flex:             1,
    alignItems:       'center',
    justifyContent:   'center',
    paddingVertical:  spacing.xxs,
    position:         'relative',
  },
  tabIcon: {
    fontSize:   17,
    color:      colors.text.quaternary,
    lineHeight: 20,
  },
  tabLabel: {
    ...typography.caption,
    color:     colors.text.quaternary,
    marginTop: 2,
    fontWeight: '500',
  },
  activeDot: {
    position:        'absolute',
    bottom:          -2,
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: colors.brand.primary,
  },
  fabWrap: {
    flex:       1,
    alignItems: 'center',
    marginTop:  -18,
  },
  fab: {
    width:            52,
    height:           52,
    borderRadius:     26,
    backgroundColor:  colors.glass.heavy,
    borderWidth:      1.5,
    borderColor:      colors.border.medium,
    alignItems:       'center',
    justifyContent:   'center',
  },
  fabActive: {
    backgroundColor: colors.brand.primaryDim,
    borderColor:     colors.brand.primary,
  },
  fabIcon: {
    fontSize:   22,
    color:      colors.brand.primary,
    lineHeight: 24,
  },
});

// ─── Main tabs ─────────────────────────────────────────────────────────────────

const MainTabs: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name={ROUTES.HOME}       component={HomeScreen} />
    <Tab.Screen name={ROUTES.VERIFY}     component={VerifyScreen} />
    <Tab.Screen name={ROUTES.SCAN}       component={ScanScreen} />
    <Tab.Screen name={ROUTES.PASSPORT}   component={PassportScreen} />
    <Tab.Screen name={ROUTES.TRUTH_FEED} component={TruthFeedScreen} />
  </Tab.Navigator>
);

// ─── Root navigator ────────────────────────────────────────────────────────────

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs"              component={MainTabs} />
      <Stack.Screen
        name={ROUTES.HANDSHAKE}
        component={HandshakeScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name={ROUTES.SETTINGS}         component={SettingsScreen} />
      <Stack.Screen name={ROUTES.CREDENTIAL_LIST}  component={CredentialListScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAIL}   component={ProductDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;