import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StudentService, { StudyTimeSuggestion } from '../../services/StudentService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StudyTime() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<StudyTimeSuggestion[]>([]);
  const [totalAvailableHours, setTotalAvailableHours] = useState(0);
  const [totalRecommendedHours, setTotalRecommendedHours] = useState(0);

  useEffect(() => {
    loadStudyTime();
  }, []);

  const loadStudyTime = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        
        const result = await StudentService.getStudyTimeSuggestions(id);
        if (result.success) {
          setSuggestions(result.suggestions);
          setTotalAvailableHours(result.totalAvailableHours);
          setTotalRecommendedHours(result.totalRecommendedHours);
        } else {
          Alert.alert('Info', 'Please set up your student profile first');
          router.push('/student/education-setup');
        }
      }
    } catch (error) {
      console.error('Error loading study time:', error);
      Alert.alert('Error', 'Failed to load study time suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading study plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#f59e0b',
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 8,
        }}>
          Study Time Plan
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#fff',
          opacity: 0.9,
        }}>
          Personalized study schedule
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#f59e0b',
          }}>
            <Ionicons name="time-outline" size={24} color="#f59e0b" />
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginTop: 8,
            }}>
              {totalAvailableHours}h
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#6b7280',
              marginTop: 4,
            }}>
              Daily Available
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#8b5cf6',
          }}>
            <Ionicons name="book-outline" size={24} color="#8b5cf6" />
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginTop: 8,
            }}>
              {totalRecommendedHours}h
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#6b7280',
              marginTop: 4,
            }}>
              Weekly Needed
            </Text>
          </View>
        </View>

        {/* Subjects */}
        {suggestions.length === 0 ? (
          <View style={{
            backgroundColor: '#fff',
            padding: 32,
            borderRadius: 16,
            alignItems: 'center',
          }}>
            <Ionicons name="time-outline" size={64} color="#d1d5db" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Study Plan Yet
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Complete your student profile to get a personalized study plan
            </Text>
          </View>
        ) : (
          <>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 16,
            }}>
              Daily Study Schedule
            </Text>
            {suggestions.map((suggestion, index) => (
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
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: 4,
                    }}>
                      {suggestion.subjectName}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: '#6b7280',
                    }}>
                      {suggestion.subjectCode} • {suggestion.credits} Credits
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: getPriorityColor(suggestion.priority),
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#fff',
                    }}>
                      {suggestion.priority}
                    </Text>
                  </View>
                </View>

                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#f9fafb',
                  padding: 16,
                  borderRadius: 12,
                  gap: 16,
                }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginLeft: 6,
                      }}>
                        Weekly
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#1f2937',
                    }}>
                      {suggestion.recommendedWeeklyHours}h
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="today-outline" size={16} color="#f59e0b" />
                      <Text style={{
                        fontSize: 12,
                        color: '#f59e0b',
                        marginLeft: 6,
                      }}>
                        Daily
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#f59e0b',
                    }}>
                      {suggestion.dailyHours}h
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
