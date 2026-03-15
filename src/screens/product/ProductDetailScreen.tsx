import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProductDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Product Detail</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });

export default ProductDetailScreen;
