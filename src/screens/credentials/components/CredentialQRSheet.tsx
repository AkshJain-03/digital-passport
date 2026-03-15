import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CredentialQRSheet: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>QR Sheet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
  text: { fontSize: 14 }
});

export default CredentialQRSheet;
