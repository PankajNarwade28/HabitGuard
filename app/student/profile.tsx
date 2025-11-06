import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_CONFIG } from '../../config/api.config';
import QuizService from '../../services/QuizService';
import StudentService, { StudentProfile as StudentProfileType } from '../../services/StudentService';

export default function StudentProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [isRepopulating, setIsRepopulating] = useState(false); // Prevent duplicate calls
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalCredits: 0,
    totalRecommendations: 0,
    quizzesAvailable: 0,
    quizzesCompleted: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        setUserId(id);
        await fetchProfileData(id);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async (id: number) => {
    try {
      // Fetch quizzes first (available even without profile)
      const quizzesResult = await QuizService.getAvailableQuizzes(id);
      const quizzes = quizzesResult.success ? quizzesResult.quizzes : [];
      const quizzesAvailable = quizzes.length; // All quizzes are available now

      // Fetch quiz history for completed count
      const historyResult = await QuizService.getQuizHistory(id);
      const quizzesCompleted = historyResult.success ? historyResult.attempts.length : 0;

      // Fetch profile with subjects
      const profileResult = await StudentService.getProfile(id);
      if (profileResult.success && profileResult.profile) {
        setProfile(profileResult.profile);

        // Calculate stats
        const subjects = profileResult.profile.subjects || [];
        
        // Automatically repopulate subjects if none found
        if (subjects.length === 0) {
          console.log('No subjects found, automatically loading subjects...');
          await autoRepopulateSubjects(id);
          return; // fetchProfileData will be called again after repopulation
        }
        
        const totalCredits = subjects.reduce((sum: number, subj: any) => sum + (subj.credits || 0), 0);

        // Fetch recommendations count
        const recsResult = await StudentService.getRecommendations(id);
        const recsCount = recsResult.success ? recsResult.recommendations.length : 0;

        setStats({
          totalSubjects: subjects.length,
          totalCredits,
          totalRecommendations: recsCount,
          quizzesAvailable,
          quizzesCompleted,
        });
      } else {
        // No profile found, automatically create and populate
        console.log('No profile found, automatically loading subjects...');
        await autoRepopulateSubjects(id);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchProfileData(userId);
    }
    setRefreshing(false);
  };

  const autoRepopulateSubjects = async (id: number) => {
    // Prevent duplicate calls
    if (isRepopulating) {
      console.log('⏭️ Already repopulating subjects, skipping...');
      return;
    }

    try {
      setIsRepopulating(true);
      console.log('🔄 Automatically loading subjects for user:', id);
      console.log('📡 API URL:', `${API_CONFIG.BASE_URL}/student/profile/${id}/repopulate-subjects`);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/student/profile/${id}/repopulate-subjects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Auto-loaded ${result.subjectsAdded} subjects successfully`);
        await fetchProfileData(id);
      } else {
        console.error('❌ Failed to auto-load subjects:', result.message);
        // Show stats anyway, even without subjects
        setStats(prev => ({
          ...prev,
          totalSubjects: 0,
        }));
      }
    } catch (error) {
      console.error('❌ Error auto-loading subjects:', error);
      console.error('💡 Please check:');
      console.error('   1. Backend server is running');
      console.error('   2. API_URL in .env matches your IP address');
      console.error('   3. Your device is on the same network');
      
      // Show stats anyway, even with error
      setStats(prev => ({
        ...prev,
        totalSubjects: 0,
      }));
    } finally {
      setIsRepopulating(false);
    }
  };

  const repopulateSubjects = async () => {
    if (!userId) return;

    Alert.alert(
      'Repopulate Subjects',
      'This will reload all subjects for your current semester. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Repopulate',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `${API_CONFIG.BASE_URL}/student/profile/${userId}/repopulate-subjects`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              const result = await response.json();
              
              if (result.success) {
                Alert.alert('Success', `${result.subjectsAdded} subjects added successfully!`);
                await fetchProfileData(userId);
              } else {
                Alert.alert('Error', result.message || 'Failed to repopulate subjects');
              }
            } catch (error) {
              console.error('Error repopulating subjects:', error);
              Alert.alert('Error', 'Failed to repopulate subjects');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading profile...</Text>
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="school-outline" size={80} color="#d1d5db" />
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937', marginTop: 20, marginBottom: 8 }}>
            No Profile Found
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
            Set up your student profile to access personalized features
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/student/education-setup')}
            style={{
              backgroundColor: '#16a34a',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
      >
        {/* Header */}
        <View style={{
          backgroundColor: '#16a34a',
          paddingTop: 48,
          paddingBottom: 32,
          paddingHorizontal: 20,
        }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>Home</Text>
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="school" size={36} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
                Student Profile
              </Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>
                {profile.degree_name}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>{stats.totalSubjects}</Text>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.9 }}>Subjects</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>{stats.totalCredits}</Text>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.9 }}>Credits</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>{profile.current_semester}</Text>
              <Text style={{ fontSize: 12, color: '#fff', opacity: 0.9 }}>Semester</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Profile Information Card */}
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
              Profile Details
            </Text>

            <View style={{ gap: 12 }}>
              <InfoRow icon="school-outline" label="Course Type" value={profile.course_type.charAt(0).toUpperCase() + profile.course_type.slice(1)} />
              <InfoRow icon="book-outline" label="Degree Program" value={profile.degree_name} />
              <InfoRow icon="trending-up-outline" label="Current Semester" value={`Semester ${profile.current_semester}`} />
              {profile.specialization && (
                <InfoRow icon="star-outline" label="Specialization" value={profile.specialization} />
              )}
              <InfoRow icon="time-outline" label="Study Hours/Day" value={`${profile.study_hours_per_day} hours`} />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/student/education-setup')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0fdf4',
                paddingVertical: 12,
                borderRadius: 10,
                marginTop: 16,
                borderWidth: 1,
                borderColor: '#16a34a',
              }}
            >
              <Ionicons name="create-outline" size={20} color="#16a34a" />
              <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions Grid */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/student/recommendations')}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#fef3c7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Ionicons name="library" size={24} color="#f59e0b" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                {stats.totalRecommendations}
              </Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Course Recommendations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/student/quiz-list')}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#f5f3ff',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Ionicons name="school" size={24} color="#8b5cf6" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                {stats.quizzesAvailable}
              </Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Quizzes Available</Text>
            </TouchableOpacity>
          </View>

          {/* Study Plan Section - New with Timer */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
              Study Sessions
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/student/study-plan' as any)}
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#fef3c7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <Ionicons name="play-circle" size={28} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Start Session
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Timer & tracking
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/student/study-statistics' as any)}
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#ede9fe',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <Ionicons name="stats-chart" size={28} color="#8b5cf6" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  Statistics
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  View progress
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Study Time Suggestions (Old) */}
          <TouchableOpacity
            onPress={() => router.push('/student/study-time')}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#fef3c7',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="calendar" size={28} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                Study Plan
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                View time recommendations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
          </TouchableOpacity>

          {/* Subjects Section */}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                Your Subjects
              </Text>
            </View>

            {stats.totalSubjects === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 12, textAlign: 'center' }}>
                  Loading subjects...
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {(profile.subjects || []).slice(0, 5).map((subject: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: '#f9fafb',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f0fdf4',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#16a34a' }}>
                        {subject.credits}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 }}>
                        {subject.subject_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {subject.subject_code} • {subject.study_hours_recommended}h/week recommended
                      </Text>
                    </View>
                  </View>
                ))}

                {(profile.subjects || []).length > 5 && (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a' }}>
                      View All {(profile.subjects || []).length} Subjects
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Performance Stats */}
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
              Learning Progress
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>Quizzes Completed</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
                    {stats.quizzesCompleted} / {stats.quizzesAvailable}
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${stats.quizzesAvailable > 0 ? (stats.quizzesCompleted / stats.quizzesAvailable) * 100 : 0}%`,
                      backgroundColor: '#8b5cf6',
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/student/quiz-history' as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f3ff',
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#8b5cf6',
                }}
              >
                <Ionicons name="time-outline" size={20} color="#8b5cf6" />
                <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                  View Quiz History
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={18} color="#16a34a" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>{value}</Text>
      </View>
    </View>
  );
}
