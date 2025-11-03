import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import StudentService, { CourseRecommendation } from '../../services/StudentService';

export default function Recommendations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      console.log('Recommendations - User data:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        console.log('Recommendations - User ID:', id);
        setUserId(id);
        
        const result = await StudentService.getRecommendations(id);
        console.log('Recommendations - API result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          setRecommendations(result.recommendations);
          console.log('Recommendations loaded:', result.recommendations.length);
        } else {
          console.log('Recommendations - Error:', (result as any).message);
          Alert.alert('Info', (result as any).message || 'Please set up your student profile first');
          router.push('/student/education-setup');
        }
      } else {
        console.log('Recommendations - No user data in storage');
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load course recommendations');
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (url: string) => {
    Linking.openURL(url);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'nptel':
        return '🎓';
      case 'udemy':
        return '🎯';
      case 'coursera':
        return '📚';
      default:
        return '🌐';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading recommendations...</Text>
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
          backgroundColor: '#16a34a',
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#fff',
          marginBottom: 8,
        }}>
          Course Recommendations
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#fff',
          opacity: 0.9,
        }}>
          Personalized courses for your subjects
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {recommendations.length === 0 ? (
          <View style={{
            backgroundColor: '#fff',
            padding: 32,
            borderRadius: 16,
            alignItems: 'center',
          }}>
            <Ionicons name="library-outline" size={64} color="#d1d5db" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Recommendations Yet
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Complete your student profile to get personalized course recommendations
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/student/education-setup')}
              style={{
                backgroundColor: '#16a34a',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Set Up Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recommendations.map((recommendation, index) => (
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
              {/* Subject Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#f0fdf4',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="book-outline" size={24} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: 4,
                  }}>
                    {recommendation.subject.name}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280',
                  }}>
                    {recommendation.subject.code} • {recommendation.subject.credits} Credits • {recommendation.subject.studyHours}h/week
                  </Text>
                </View>
              </View>

              {/* Courses */}
              {recommendation.courses.map((course, courseIndex) => (
                <TouchableOpacity
                  key={courseIndex}
                  onPress={() => openCourse(course.url)}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: courseIndex < recommendation.courses.length - 1 ? 12 : 0,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                  activeOpacity={0.7}
                >
                  {/* Platform Badge */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>
                      {getPlatformIcon(course.platform)}
                    </Text>
                    <View style={{
                      backgroundColor: '#fff',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      marginRight: 8,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#16a34a',
                      }}>
                        {course.platform}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: getDifficultyColor(course.difficulty),
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#fff',
                      }}>
                        {course.difficulty}
                      </Text>
                    </View>
                  </View>

                  {/* Course Title */}
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: 8,
                  }}>
                    {course.title}
                  </Text>

                  {/* Instructor & Duration */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginLeft: 6,
                      marginRight: 16,
                    }}>
                      {course.instructor}
                    </Text>
                    {course.duration && (
                      <>
                        <Ionicons name="time-outline" size={16} color="#6b7280" />
                        <Text style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginLeft: 6,
                        }}>
                          {course.duration}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Open Link Button */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#16a34a',
                      marginRight: 6,
                    }}>
                      Open Course
                    </Text>
                    <Ionicons name="open-outline" size={16} color="#16a34a" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </>
  );
}
