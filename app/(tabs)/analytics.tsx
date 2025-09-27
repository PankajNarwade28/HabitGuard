import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Detailed usage insights</Text>
      </View>

      {/* Weekly Overview */}
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Weekly Overview</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart" size={32} color="#6366f1" />
          <Text style={styles.chartLabel}>Weekly usage chart</Text>
        </View>
      </View>

      {/* App Usage Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Top Apps</Text>
        <View style={styles.appItem}>
          <View style={styles.appInfo}>
            <Ionicons name="logo-instagram" size={24} color="#e91e63" />
            <View style={styles.appDetails}>
              <Text style={styles.appName}>Instagram</Text>
              <Text style={styles.appTime}>2h 30m today</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, styles.badgeHigh]}>
            <Text style={styles.badgeText}>High</Text>
          </View>
        </View>
        
        <View style={styles.appItem}>
          <View style={styles.appInfo}>
            <Ionicons name="logo-youtube" size={24} color="#ff0000" />
            <View style={styles.appDetails}>
              <Text style={styles.appName}>YouTube</Text>
              <Text style={styles.appTime}>1h 45m today</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, styles.badgeMedium]}>
            <Text style={styles.badgeText}>Medium</Text>
          </View>
        </View>

        <View style={styles.appItem}>
          <View style={styles.appInfo}>
            <Ionicons name="chatbubbles" size={24} color="#25d366" />
            <View style={styles.appDetails}>
              <Text style={styles.appName}>WhatsApp</Text>
              <Text style={styles.appTime}>45m today</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, styles.badgeLow]}>
            <Text style={styles.badgeText}>Healthy</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Insights</Text>
        <View style={styles.insightItem}>
          <Ionicons name="trending-down" size={20} color="#10b981" />
          <Text style={styles.insightText}>Screen time decreased by 15% this week</Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="time" size={20} color="#f59e0b" />
          <Text style={styles.insightText}>Peak usage: 7-9 PM</Text>
        </View>
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
    backgroundColor: '#0ea5e9',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
  },
  overviewCard: {
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
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  chartLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appDetails: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  appTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHigh: {
    backgroundColor: '#fef2f2',
  },
  badgeMedium: {
    backgroundColor: '#fffbeb',
  },
  badgeLow: {
    backgroundColor: '#f0fdf4',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
});