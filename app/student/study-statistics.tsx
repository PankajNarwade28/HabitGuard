import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import StudySessionService, { StudyStatistics as StudyStats } from '../../services/StudySessionService';

type Period = 'week' | 'month' | 'all';

export default function StudyStatistics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StudyStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        
        const result = await StudySessionService.getStudyStatistics(id, selectedPeriod);
        if (result.success && result.data) {
          setStatistics(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'Failed to load study statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPeriodLabel = (): string => {
    switch (selectedPeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'all':
        return 'All Time';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading statistics...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{ backgroundColor: '#8b5cf6', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            Study Statistics
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            Track your progress and performance
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Period Selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {(['week', 'month', 'all'] as Period[]).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={{
                  flex: 1,
                  backgroundColor: selectedPeriod === period ? '#8b5cf6' : '#fff',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: selectedPeriod === period ? '#8b5cf6' : '#e5e7eb',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedPeriod === period ? '#fff' : '#6b7280',
                  }}
                >
                  {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overall Statistics */}
          {statistics && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
                {getPeriodLabel()} Overview
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#8b5cf6',
                  }}
                >
                  <Ionicons name="time-outline" size={24} color="#8b5cf6" />
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                    {formatMinutes(statistics.overall.total_minutes)}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Total Time</Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#10b981',
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                    {statistics.overall.completed_sessions}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Sessions</Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#f59e0b',
                  }}
                >
                  <Ionicons name="stats-chart-outline" size={24} color="#f59e0b" />
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                    {Math.round(statistics.overall.avg_session_minutes)}m
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Avg Session</Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#ef4444',
                  }}
                >
                  <Ionicons name="pause-circle-outline" size={24} color="#ef4444" />
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                    {statistics.overall.total_pauses}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Total Pauses</Text>
                </View>
              </View>

              {/* By Subject */}
              {statistics.bySubject.length > 0 && (
                <>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
                    By Subject
                  </Text>
                  {statistics.bySubject.map((subject, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                            {subject.subject_name}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#6b7280' }}>{subject.subject_code}</Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: '#8b5cf6',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                            {formatMinutes(subject.total_minutes)}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Sessions</Text>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                            {subject.completed_sessions}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Avg Time</Text>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                            {Math.round(subject.avg_session_minutes)}m
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* Daily Breakdown */}
              {statistics.daily.length > 0 && (
                <>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
                    Daily Breakdown
                  </Text>
                  {statistics.daily.map((day, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                          {new Date(day.stat_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#6b7280' }}>
                          {day.total_sessions} session{day.total_sessions !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: '#f3f4f6',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                          {formatMinutes(day.total_minutes)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* No Data */}
              {statistics.overall.total_sessions === 0 && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    padding: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#1f2937',
                      marginTop: 16,
                      marginBottom: 8,
                    }}
                  >
                    No Study Data Yet
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                    Start studying to see your statistics here
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
