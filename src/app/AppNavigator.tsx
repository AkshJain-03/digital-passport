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

import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator }                 from '@react-navigation/native-stack';
import { createNativeBottomTabNavigator }             from '@react-navigation/bottom-tabs/unstable';
import { BlurView }                                   from '@react-native-community/blur';
import { useSafeAreaInsets }                          from 'react-native-safe-area-context';
import type { SFSymbol }                              from 'sf-symbols-typescript';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

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
import { CredentialListScreen }      from '../screens/credentials/CredentialListScreen';
import { ProductDetailScreen }       from '../screens/product/ProductDetailScreen';
import { TrustEngineScreen }         from '../screens/settings/TrustEngineScreen';
import { CameraScanScreen }          from '../screens/scan/CameraScanScreen';
import { QRVerificationResultScreen } from '../screens/scan/QRVerificationResultScreen';

import { ROUTES, type TabParamList, type RootStackParamList } from './routes';

const Tab   = createNativeBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand.primary,
    background: 'transparent',
    card: 'transparent',
    border: 'transparent',
    text: colors.text.primary,
  },
};

const IOS_TAB_ICONS: Record<keyof TabParamList, SFSymbol> = {
  [ROUTES.HOME]: 'house.fill',
  [ROUTES.VERIFY]: 'checkmark.shield.fill',
  [ROUTES.SCAN]: 'viewfinder.circle.fill',
  [ROUTES.PASSPORT]: 'person.text.rectangle.fill',
  [ROUTES.TRUTH_FEED]: 'text.bubble.fill',
};

const LiquidTabButton: React.FC<BottomTabBarButtonProps> = ({
  accessibilityState,
  children,
  onLongPress,
  onPress,
  style,
}) => {
  const focused = Boolean(accessibilityState?.selected);
  const active = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    active.value = focused
      ? withSpring(1, { damping: 16, stiffness: 220, mass: 0.8 })
      : withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [active, focused]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(active.value, [0, 1], [1, 1.08]) },
      { translateY: interpolate(active.value, [0, 1], [0, -2]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0, 0.9]),
    transform: [{ scale: interpolate(active.value, [0, 1], [0.92, 1.08]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={style as StyleProp<ViewStyle>}
      android_ripple={{ color: 'transparent' }}
    >
      <Animated.View style={[styles.tabButtonInner, animatedButtonStyle]}>
        <Animated.View pointerEvents="none" style={[styles.activeGlow, glowStyle]}>
          <LinearGradient
            colors={['rgba(0,212,255,0.12)', 'rgba(123,97,255,0.04)', 'rgba(0,212,255,0.00)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const TabBarGlassBackground: React.FC = () => (
  <View style={styles.tabBarBackground} pointerEvents="none">
    {Platform.OS === 'ios' ? (
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="ultraThinMaterialDark"
        blurAmount={28}
        reducedTransparencyFallbackColor="rgba(6,9,18,0.44)"
      />
    ) : null}

    <LinearGradient
      colors={['rgba(0,0,0,0.24)', 'rgba(0,0,0,0.00)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.tabBarTopShadow}
    />

    <LinearGradient
      colors={[
        'rgba(255,255,255,0.05)',
        'rgba(255,255,255,0.03)',
        'rgba(255,255,255,0.01)',
      ]}
      start={{ x: 0.08, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />

    <LinearGradient
      colors={['rgba(0,212,255,0.08)', 'rgba(123,97,255,0.04)', 'rgba(0,212,255,0.00)']}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 0.9 }}
      style={styles.tabBarGlow}
    />

    <View style={styles.tabBarHighlight} />
  </View>
);


// ─── Main tabs ─────────────────────────────────────────────────────────────────

const MainTabs: React.FC = () => {
  const nav = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mainTabsWrap}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarActiveTintColor: colors.brand.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: styles.nativeTabBar,
          tabBarLabelStyle: typography.tabLabel,
          tabBarItemStyle: styles.nativeTabItem,
          tabBarButton: LiquidTabButton,
          tabBarBackground: TabBarGlassBackground,
          tabBarBlurEffect: Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : undefined,
          tabBarIcon: () => ({ type: 'sfSymbol', name: IOS_TAB_ICONS[route.name as keyof TabParamList] }),
        })}
      >
        <Tab.Screen name={ROUTES.HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name={ROUTES.VERIFY} component={VerifyScreen} options={{ tabBarLabel: 'Verify' }} />
        <Tab.Screen name={ROUTES.SCAN} component={ScanScreen} options={{ tabBarLabel: 'Scan' }} />
        <Tab.Screen name={ROUTES.PASSPORT} component={PassportScreen} options={{ tabBarLabel: 'Passport' }} />
        <Tab.Screen name={ROUTES.TRUTH_FEED} component={TruthFeedScreen} options={{ tabBarLabel: 'Feed' }} />
      </Tab.Navigator>

      <Pressable
        style={[styles.globalSettingsBtn, { top: (insets.top || 10) + 8 }]}
        onPress={() => nav.navigate(ROUTES.SETTINGS)}
        android_ripple={{ color: 'transparent' }}
      >
        {({ pressed }) => (
          <View style={styles.globalSettingsInner}>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType={pressed ? 'prominent' : 'chromeMaterial'}
                blurAmount={pressed ? 20 : 16}
                reducedTransparencyFallbackColor="transparent"
              />
            ) : null}
            <View style={[styles.pressSheen, pressed && styles.pressSheenOn]} />
            <Text style={styles.globalSettingsIcon}>⚙</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

// ─── Root navigator ────────────────────────────────────────────────────────────

export const AppNavigator: React.FC = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="MainTabs"              component={MainTabs} />
      <Stack.Screen
        name={ROUTES.HANDSHAKE}
        component={HandshakeScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name={ROUTES.SETTINGS}         component={SettingsScreen} />
      <Stack.Screen name={ROUTES.CREDENTIAL_LIST}  component={CredentialListScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAIL}   component={ProductDetailScreen} />
      <Stack.Screen name={ROUTES.TRUST_ENGINE}     component={TrustEngineScreen} />
      <Stack.Screen name={ROUTES.CAMERA_SCAN}      component={CameraScanScreen} />
      <Stack.Screen name={ROUTES.QR_VERIFICATION_RESULT} component={QRVerificationResultScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

const styles = StyleSheet.create({
  mainTabsWrap: {
    flex: 1,
  },
  nativeTabBar: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    bottom: Platform.OS === 'ios' ? 14 : 10,
    borderRadius: radius['2xl'],
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    backgroundColor: Platform.OS === 'ios'
      ? 'transparent'
      : 'rgba(7,10,20,0.32)',
    elevation: 0,
    height: Platform.OS === 'ios' ? 78 : 64,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingTop: 7,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
    } : {}),
  },
  nativeTabItem: {
    borderRadius: 18,
    marginHorizontal: 4,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(8,12,24,0.14)' : 'rgba(12,17,30,0.32)',
  },
  tabBarTopShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -14,
    height: 18,
  },
  tabBarGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.34,
  },
  tabBarHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tabButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  globalSettingsBtn: {
    position: 'absolute',
    right: spacing[4],
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.lg,
  },
  globalSettingsInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
  },
  pressSheenOn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  globalSettingsIcon: {
    fontSize: 18,
    color: colors.brand.primary,
    lineHeight: 20,
  },
});
