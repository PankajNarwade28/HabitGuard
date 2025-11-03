import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QuizService, { AvailableQuiz } from '../../services/QuizService';

export default function QuizList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<AvailableQuiz[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      console.log('Quiz List - User data:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        console.log('Quiz List - User ID:', id);
        setUserId(id);
        
        const result = await QuizService.getAvailableQuizzes(id);
        console.log('Quiz List - API result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
          setQuizzes(result.quizzes);
          console.log('Quizzes loaded:', result.quizzes.length);
        } else {
          console.log('Quiz List - Error:', (result as any).message);
          Alert.alert('Info', (result as any).message || 'Please set up your student profile first');
          router.push('/student/education-setup' as any);
        }
      } else {
        console.log('Quiz List - No user data in storage');
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (subjectCode: string, subjectName: string) => {
    router.push({
      pathname: '/student/quiz-start',
      params: { subjectCode, subjectName },
    } as any);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading quizzes...</Text>
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
            Quizzes
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#fff',
          opacity: 0.9,
        }}>
          Test your knowledge
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Quiz History Button */}
        <TouchableOpacity
          onPress={() => router.push('/student/quiz-history' as any)}
          style={{
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: '#8b5cf6',
          }}
        >
          <Ionicons name="time-outline" size={24} color="#8b5cf6" />
          <Text style={{
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: '#8b5cf6',
            marginLeft: 12,
          }}>
            View Quiz History
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
        </TouchableOpacity>

        {quizzes.length === 0 ? (
          <View style={{
            backgroundColor: '#fff',
            padding: 32,
            borderRadius: 16,
            alignItems: 'center',
          }}>
            <Ionicons name="school-outline" size={64} color="#d1d5db" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Quizzes Available
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Complete your student profile to access quizzes
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/student/education-setup' as any)}
              style={{
                backgroundColor: '#8b5cf6',
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
          quizzes.map((quiz, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => quiz.hasQuiz && startQuiz(quiz.subjectCode, quiz.subjectName)}
              disabled={!quiz.hasQuiz}
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
                opacity: quiz.hasQuiz ? 1 : 0.6,
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: quiz.hasQuiz ? '#f5f3ff' : '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons
                    name={quiz.hasQuiz ? 'school' : 'lock-closed'}
                    size={28}
                    color={quiz.hasQuiz ? '#8b5cf6' : '#9ca3af'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: 4,
                  }}>
                    {quiz.subjectName}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6b7280',
                    marginBottom: 6,
                  }}>
                    {quiz.subjectCode} • Semester {quiz.semester}
                  </Text>
                  {quiz.hasQuiz ? (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <View style={{
                        backgroundColor: '#f0fdf4',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#16a34a',
                        }}>
                          {quiz.questionCount} Questions
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      fontStyle: 'italic',
                    }}>
                      Quiz not available yet
                    </Text>
                  )}
                </View>
                {quiz.hasQuiz && (
                  <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
    </>
  );
}
