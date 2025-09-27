import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OptionsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Options</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <Text style={styles.placeholder}>App settings will appear here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7ff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#581c87',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7c3aed',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#7c3aed',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});
