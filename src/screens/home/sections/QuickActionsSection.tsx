import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const QuickActionsSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Quick Actions</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { padding: 8 } });

export default QuickActionsSection;
