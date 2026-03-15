import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ROUTES, type RootStackParamList } from '../../app/routes';

type SettingsNav = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNav>();

  return (
    <ScrollView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.placeholder}>Settings content coming soon</Text>

        {/* Vision entry point */}
        <TouchableOpacity
          style={styles.visionBtn}
          onPress={() => navigation.navigate(ROUTES.VISION)}
          activeOpacity={0.75}
        >
          <View style={styles.visionBtnInner}>
            <Text style={styles.visionIcon}>◈</Text>
            <View style={styles.visionText}>
              <Text style={styles.visionTitle}>Global Vision</Text>
              <Text style={styles.visionSub}>20 use-cases · Universal Trust Wallet</Text>
            </View>
            <Text style={styles.visionArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  container: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  visionBtn: {
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    borderColor:     colors.brand.primary,
    backgroundColor: colors.brand.primaryDim,
    overflow:        'hidden',
  },
  visionBtnInner: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        spacing.base,
  },
  visionIcon: {
    fontSize:    24,
    color:       colors.brand.primary,
    marginRight: spacing.md,
  },
  visionText: {
    flex: 1,
  },
  visionTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  visionSub: {
    ...typography.caption,
    color:     colors.text.secondary,
    marginTop: 2,
  },
  visionArrow: {
    fontSize:   22,
    color:      colors.brand.primary,
    marginLeft: spacing.sm,
  },
});
