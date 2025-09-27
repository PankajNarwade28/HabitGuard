import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your digital wellness journey</Text>
      </View>

      <View style={styles.streakCard}>
        <Ionicons name="flame" size={32} color="#ef4444" />
        <View style={styles.streakContent}>
          <Text style={styles.streakNumber}>7</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.cardTitle}>Daily Goal</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.goalText}>2h 15m / 3h goal</Text>
      </View>

      <View style={styles.weeklyCard}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            <Text style={styles.chartLabel}>Weekly screen time chart</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>Achievements</Text>
        <View style={styles.achievementItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <View style={styles.achievementDetails}>
            <Text style={styles.achievementName}>First Week</Text>
            <Text style={styles.achievementDesc}>Complete 7 days streak</Text>
          </View>
        </View>
        <View style={styles.achievementItem}>
          <Ionicons name="medal" size={24} color="#10b981" />
          <View style={styles.achievementDetails}>
            <Text style={styles.achievementName}>Goal Crusher</Text>
            <Text style={styles.achievementDesc}>Meet daily goal 5 times</Text>
          </View>
        </View>
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
    backgroundColor: '#a855f7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#f3e8ff',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  streakContent: {
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  streakLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#10b981',
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
  progressBar: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: 12,
    width: '75%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  goalText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  weeklyCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  chartContainer: {
    marginTop: 12,
  },
  chart: {
    height: 120,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  chartLabel: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsCard: {
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
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  achievementDetails: {
    marginLeft: 16,
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581c87',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});