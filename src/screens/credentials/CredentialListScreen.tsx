import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const CredentialListScreen: React.FC = () => {
  return (
    <ScrollView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Credentials</Text>
        <Text style={styles.placeholder}>Credential list content coming soon</Text>
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
  },
});
