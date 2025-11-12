import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMLNotifications } from '@/hooks/useMLNotifications';
import { MLInsight } from '@/services/MLAnalysisService';

export default function MLInsights() {
  const { insights, loading, refreshInsights, dismissInsight, clearDismissedInsights } = useMLNotifications(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshInsights();
    setRefreshing(false);
  };

  const handleDismiss = async (insightId: string) => {
    await dismissInsight(insightId);
  };

  const handleViewDetails = (insight: MLInsight) => {
    // Navigate to relevant screen based on category
    switch (insight.category) {
      case 'health':
      case 'usage':
        router.push('/(tabs)/progress' as any);
        break;
      case 'trend':
        router.push('/(tabs)' as any);
        break;
      default:
        console.log('View details for:', insight);
    }
  };

  const getInsightIcon = (type: MLInsight['type']): string => {
    switch (type) {
      case 'critical':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getInsightColor = (type: MLInsight['type']): string => {
    switch (type) {
      case 'critical':
        return '#dc2626'; // red-600
      case 'warning':
        return '#f59e0b'; // amber-500
      case 'success':
        return '#10b981'; // green-500
      case 'info':
      default:
        return '#3b82f6'; // blue-500
    }
  };

  const renderInsightCard = (insight: MLInsight) => {
    const color = getInsightColor(insight.type);
    const icon = getInsightIcon(insight.type);

    return (
      <View key={insight.id} style={[styles.insightCard, { borderLeftColor: color }]}>
        <View style={styles.insightHeader}>
          <View style={styles.insightTitleRow}>
            <Ionicons name={icon as any} size={24} color={color} />
            <Text style={styles.insightTitle}>{insight.title}</Text>
          </View>
          <Text style={styles.insightTimestamp}>
            {new Date(insight.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <Text style={styles.insightMessage}>{insight.message}</Text>

        <View style={styles.insightActions}>
          {insight.actionRequired && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: color }]}
              onPress={() => handleViewDetails(insight)}
            >
              <Ionicons name="eye-outline" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleDismiss(insight.id)}
          >
            <Ionicons name="close-outline" size={18} color="#6b7280" />
            <Text style={styles.secondaryButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="analytics-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>No Insights Available</Text>
      <Text style={styles.emptyStateMessage}>
        We're analyzing your usage patterns. Check back soon for personalized recommendations!
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh Now</Text>
      </TouchableOpacity>
    </View>
  );

  const groupedInsights = {
    critical: insights.filter(i => i.type === 'critical'),
    warning: insights.filter(i => i.type === 'warning'),
    info: insights.filter(i => i.type === 'info'),
    success: insights.filter(i => i.type === 'success'),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>ML Insights</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered usage analysis
          </Text>
        </View>
        <TouchableOpacity onPress={clearDismissedInsights} style={styles.clearButton}>
          <Ionicons name="reload-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Analyzing your usage patterns...</Text>
          </View>
        )}

        {!loading && insights.length === 0 && renderEmptyState()}

        {!loading && insights.length > 0 && (
          <>
            {/* Critical Insights */}
            {groupedInsights.critical.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>
                  🚨 Critical Alerts
                </Text>
                {groupedInsights.critical.map(renderInsightCard)}
              </View>
            )}

            {/* Warning Insights */}
            {groupedInsights.warning.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>
                  ⚠️ Warnings
                </Text>
                {groupedInsights.warning.map(renderInsightCard)}
              </View>
            )}

            {/* Info Insights */}
            {groupedInsights.info.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#3b82f6' }]}>
                  ℹ️ Information
                </Text>
                {groupedInsights.info.map(renderInsightCard)}
              </View>
            )}

            {/* Success Insights */}
            {groupedInsights.success.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#10b981' }]}>
                  ✨ Achievements
                </Text>
                {groupedInsights.success.map(renderInsightCard)}
              </View>
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                💡 <Text style={styles.summaryBold}>{insights.length}</Text> total insights
              </Text>
              <Text style={styles.summaryText}>
                🎯 <Text style={styles.summaryBold}>{insights.filter(i => i.actionRequired).length}</Text> require action
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 16,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingLeft: 4,
  },
  insightCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginLeft: 10,
    flex: 1,
  },
  insightTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  insightMessage: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#334155',
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  summaryBold: {
    fontWeight: 'bold',
    color: '#f1f5f9',
    fontSize: 16,
  },
});
