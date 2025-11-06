import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QuizService, { QuizAttempt } from '../../services/QuizService';

export default function QuizHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passedCount: 0,
    failedCount: 0,
    totalTimeSpent: 0,
  });

  useEffect(() => {
    loadQuizHistory();
  }, []);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        setUserId(id);
        
        const result = await QuizService.getQuizHistory(id);
        
        if (result.success) {
          setAttempts(result.attempts);
          setStats(result.stats);
        } else {
          Alert.alert('Error', 'Failed to load quiz history');
        }
      } else {
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
      Alert.alert('Error', 'Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading history...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header with Back Button */}
        <View style={{
          backgroundColor: '#8b5cf6',
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}>
          <TouchableOpacity
            onPress={() => router.push('/student/profile')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>
              Profile
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 8,
          }}>
            Quiz History
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#fff',
            opacity: 0.9,
          }}>
            Your past quiz attempts
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Statistics Cards */}
          {stats.totalAttempts > 0 && (
            <View style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
                Overall Statistics
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {/* Total Attempts */}
                <View style={{ 
                  flex: 1, 
                  minWidth: 150,
                  backgroundColor: '#f5f3ff', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#8b5cf6',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="document-text" size={20} color="#8b5cf6" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Total Attempts</Text>
                  </View>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#8b5cf6' }}>
                    {stats.totalAttempts}
                  </Text>
                </View>

                {/* Average Score */}
                <View style={{ 
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: '#f0fdf4', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#16a34a',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="trophy" size={20} color="#16a34a" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Average Score</Text>
                  </View>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#16a34a' }}>
                    {Number(stats.averageScore || 0).toFixed(1)}%
                  </Text>
                </View>

                {/* Passed */}
                <View style={{ 
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: '#ecfdf5', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#10b981',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Passed</Text>
                  </View>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#10b981' }}>
                    {stats.passedCount}
                  </Text>
                </View>

                {/* Failed */}
                <View style={{ 
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: '#fef2f2', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#ef4444',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Failed</Text>
                  </View>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#ef4444' }}>
                    {stats.failedCount}
                  </Text>
                </View>

                {/* Total Time */}
                <View style={{ 
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: '#fef3c7', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#f59e0b',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="time" size={20} color="#f59e0b" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Total Time</Text>
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>
                    {formatTime(stats.totalTimeSpent)}
                  </Text>
                </View>

                {/* Pass Rate */}
                <View style={{ 
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: '#dbeafe', 
                  borderRadius: 12, 
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#3b82f6',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="stats-chart" size={20} color="#3b82f6" />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>Pass Rate</Text>
                  </View>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#3b82f6' }}>
                    {stats.totalAttempts > 0 ? ((stats.passedCount / stats.totalAttempts) * 100).toFixed(0) : 0}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Quiz Attempts */}
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: 16 
          }}>
            Recent Attempts
          </Text>

          {attempts.length === 0 ? (
            <View style={{
              backgroundColor: '#fff',
              padding: 32,
              borderRadius: 16,
              alignItems: 'center',
            }}>
              <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginTop: 16,
                marginBottom: 8,
              }}>
                No Quiz History
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                You haven't taken any quizzes yet. Start learning!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/student/quiz-list')}
                style={{
                  backgroundColor: '#8b5cf6',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Browse Quizzes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            attempts.map((attempt, index) => (
              <View
                key={attempt.id || index}
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
                {/* Header */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '700', 
                      color: '#1f2937',
                      marginBottom: 4,
                    }}>
                      {(attempt as any).subject_code || (attempt as any).subject_name || 'Unknown Subject'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      {formatDate(attempt.attempted_at)}
                    </Text>
                  </View>

                  {/* Score Badge */}
                  <View style={{ 
                    backgroundColor: (attempt.score_percentage >= 60) ? '#f0fdf4' : '#fef2f2',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: (attempt.score_percentage >= 60) ? '#16a34a' : '#ef4444',
                  }}>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: '700', 
                      color: (attempt.score_percentage >= 60) ? '#16a34a' : '#ef4444',
                    }}>
                      {Number(attempt.score_percentage || 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Stats Row */}
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: '#e5e7eb',
                }}>
                  {/* Questions */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="help-circle-outline" size={18} color="#6b7280" />
                    <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>
                      {attempt.total_questions} questions
                    </Text>
                  </View>

                  {/* Correct Answers */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                    <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>
                      {attempt.correct_answers} correct
                    </Text>
                  </View>

                  {/* Time Taken */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={18} color="#6b7280" />
                    <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>
                      {formatTime(attempt.time_taken_seconds || 0)}
                    </Text>
                  </View>

                  {/* Status */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={(attempt.score_percentage >= 60) ? "trophy" : "close-circle-outline"} 
                      size={18} 
                      color={(attempt.score_percentage >= 60) ? "#16a34a" : "#ef4444"} 
                    />
                    <Text style={{ 
                      fontSize: 13, 
                      color: (attempt.score_percentage >= 60) ? "#16a34a" : "#ef4444",
                      marginLeft: 6,
                      fontWeight: '600',
                    }}>
                      {(attempt.score_percentage >= 60) ? 'Passed' : 'Failed'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={{ marginTop: 12 }}>
                  <View style={{ 
                    height: 6, 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${Number(attempt.score_percentage || 0)}%`,
                        backgroundColor: getScoreColor(Number(attempt.score_percentage || 0)),
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}
