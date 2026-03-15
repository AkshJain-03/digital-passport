import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface CredentialFilter { query?: string }

export const CredentialFilterBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Filter</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
  text: { fontSize: 14 }
});

export default CredentialFilterBar;
