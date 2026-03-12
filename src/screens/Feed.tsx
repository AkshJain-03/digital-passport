import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Feed() {
  return (
    <View style={styles.container}>
      <Text style={styles.post}>
        👤 Aksh Jain  
        {"\n"}Verified Software Engineer  
        {"\n"}🟡 Authentic Post (Signed)
      </Text>

      <Text style={styles.unverified}>
        👤 Random User  
        {"\n"}⚠️ Unverified Source
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  post: {
    padding: 15,
    backgroundColor: '#d4f4dd',
    marginBottom: 15,
  },
  unverified: {
    padding: 15,
    backgroundColor: '#f4d4d4',
  },
});
