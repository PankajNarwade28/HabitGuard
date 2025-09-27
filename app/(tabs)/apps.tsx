import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AppsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apps</Text>
        <Text style={styles.subtitle}>Manage your app usage</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Used Apps</Text>
        <Text style={styles.placeholder}>App usage statistics will appear here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#0369a1',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});
