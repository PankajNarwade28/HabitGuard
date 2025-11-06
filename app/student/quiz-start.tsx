import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QuizService, { QuizAnswer, QuizQuestion, QuizResult, QuizScore } from '../../services/QuizService';

type QuizStage = 'loading' | 'ready' | 'in-progress' | 'completed';

export default function QuizStart() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { subjectCode, subjectName } = params;

  // State
  const [stage, setStage] = useState<QuizStage>('loading');
  const [userId, setUserId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Results
  const [score, setScore] = useState<QuizScore | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);

  // Load quiz data
  useEffect(() => {
    loadQuiz();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const loadQuiz = async () => {
    try {
      setStage('loading');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        setUserId(id);
        
        const result = await QuizService.getQuizQuestions(subjectCode as string, 5);
        
        if (result.success && result.questions.length > 0) {
          setQuestions(result.questions);
          // Initialize answers array
          setAnswers(result.questions.map((_, idx) => ({
            questionId: idx + 1,
            answer: '' as 'A' | 'B' | 'C' | 'D'
          })));
          setStage('ready');
        } else {
          Alert.alert('Info', 'No questions available for this subject yet');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz questions');
      router.back();
    }
  };

  const startQuiz = () => {
    setStage('in-progress');
    // Start timer
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const selectAnswer = (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      questionId: questionIndex + 1,
      answer
    };
    setAnswers(newAnswers);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const submitQuiz = async () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => !a.answer).length;
    if (unanswered > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => processSubmission() }
        ]
      );
    } else {
      processSubmission();
    }
  };

  const processSubmission = async () => {
    try {
      if (!userId) return;

      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      setStage('loading');

      const result = await QuizService.submitQuiz(
        userId,
        subjectCode as string,
        answers,
        timeElapsed
      );

      if (result.success) {
        setScore(result.score);
        setResults(result.results);
        setStage('completed');
      } else {
        Alert.alert('Error', 'Failed to submit quiz');
        setStage('in-progress');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
      setStage('in-progress');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (stage === 'loading') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
            {stage === 'loading' && questions.length === 0 ? 'Loading quiz...' : 'Submitting...'}
          </Text>
        </View>
      </>
    );
  }

  // Ready to start
  if (stage === 'ready') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          {/* Header */}
          <View style={{
            backgroundColor: '#8b5cf6',
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
              <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
              {subjectName}
            </Text>
            <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
              {subjectCode}
            </Text>
          </View>

          {/* Quiz Info */}
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#f5f3ff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="school" size={40} color="#8b5cf6" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
                  Ready to Start?
                </Text>
                <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
                  Test your knowledge on {subjectName}
                </Text>
              </View>

              {/* Quiz Details */}
              <View style={{ marginBottom: 24 }}>
                <InfoRow icon="help-circle" label="Total Questions" value={questions.length.toString()} />
                <InfoRow icon="time" label="Time Limit" value="No limit" />
                <InfoRow icon="checkmark-circle" label="Passing Score" value="60%" />
              </View>

              {/* Instructions */}
              <View style={{
                backgroundColor: '#f0fdf4',
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#16a34a', marginBottom: 8 }}>
                  Instructions
                </Text>
                <Text style={{ fontSize: 14, color: '#15803d', marginBottom: 4 }}>
                  • Select one answer for each question
                </Text>
                <Text style={{ fontSize: 14, color: '#15803d', marginBottom: 4 }}>
                  • You can navigate between questions
                </Text>
                <Text style={{ fontSize: 14, color: '#15803d', marginBottom: 4 }}>
                  • Submit when you're ready
                </Text>
                <Text style={{ fontSize: 14, color: '#15803d' }}>
                  • Your score will be calculated automatically
                </Text>
              </View>

              {/* Start Button */}
              <TouchableOpacity
                onPress={startQuiz}
                style={{
                  backgroundColor: '#8b5cf6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                  Start Quiz
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Quiz in progress
  if (stage === 'in-progress') {
    const currentQ = questions[currentQuestion];
    const currentAnswer = answers[currentQuestion]?.answer;
    const answeredCount = answers.filter(a => a.answer).length;

    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          {/* Header with timer */}
          <View style={{
            backgroundColor: '#8b5cf6',
            paddingTop: 48,
            paddingBottom: 16,
            paddingHorizontal: 20,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                Question {currentQuestion + 1}/{questions.length}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={20} color="#fff" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 6 }}>
                  {formatTime(timeElapsed)}
                </Text>
              </View>
            </View>
            
            {/* Progress bar */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{
                backgroundColor: '#fff',
                height: '100%',
                width: `${(answeredCount / questions.length) * 100}%`,
              }} />
            </View>
            <Text style={{ fontSize: 12, color: '#fff', marginTop: 4, opacity: 0.9 }}>
              {answeredCount} of {questions.length} answered
            </Text>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Question Card */}
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
              {/* Difficulty badge */}
              <View style={{
                backgroundColor: currentQ.difficulty === 'Easy' ? '#f0fdf4' : currentQ.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: currentQ.difficulty === 'Easy' ? '#16a34a' : currentQ.difficulty === 'Medium' ? '#ca8a04' : '#dc2626',
                }}>
                  {currentQ.difficulty}
                </Text>
              </View>

              {/* Question */}
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 20, lineHeight: 26 }}>
                {currentQ.question}
              </Text>

              {/* Options */}
              {(['A', 'B', 'C', 'D'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => selectAnswer(currentQuestion, option)}
                  style={{
                    backgroundColor: currentAnswer === option ? '#f5f3ff' : '#f9fafb',
                    borderWidth: 2,
                    borderColor: currentAnswer === option ? '#8b5cf6' : '#e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: currentAnswer === option ? '#8b5cf6' : '#fff',
                    borderWidth: 2,
                    borderColor: currentAnswer === option ? '#8b5cf6' : '#d1d5db',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    {currentAnswer === option && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: 16,
                    color: currentAnswer === option ? '#8b5cf6' : '#1f2937',
                    fontWeight: currentAnswer === option ? '600' : '400',
                  }}>
                    {currentQ.options[option]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Question Navigator */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 }}>
                Question Navigator
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {questions.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => goToQuestion(idx)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      backgroundColor: answers[idx]?.answer 
                        ? '#8b5cf6' 
                        : idx === currentQuestion 
                          ? '#f5f3ff' 
                          : '#f3f4f6',
                      borderWidth: idx === currentQuestion ? 2 : 0,
                      borderColor: '#8b5cf6',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: answers[idx]?.answer ? '#fff' : idx === currentQuestion ? '#8b5cf6' : '#6b7280',
                    }}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {currentQuestion > 0 && (
                <TouchableOpacity
                  onPress={() => setCurrentQuestion(currentQuestion - 1)}
                  style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    borderWidth: 2,
                    borderColor: '#8b5cf6',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#8b5cf6" />
                  <Text style={{ color: '#8b5cf6', fontSize: 16, fontWeight: '600', marginLeft: 4 }}>
                    Previous
                  </Text>
                </TouchableOpacity>
              )}
              
              {currentQuestion < questions.length - 1 ? (
                <TouchableOpacity
                  onPress={() => setCurrentQuestion(currentQuestion + 1)}
                  style={{
                    flex: 1,
                    backgroundColor: '#8b5cf6',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 4 }}>
                    Next
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={submitQuiz}
                  style={{
                    flex: 1,
                    backgroundColor: '#16a34a',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>
                    Submit Quiz
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Quiz completed - Results
  if (stage === 'completed' && score && results.length > 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          {/* Header */}
          <View style={{
            backgroundColor: score.passed ? '#16a34a' : '#dc2626',
            paddingTop: 48,
            paddingBottom: 24,
            paddingHorizontal: 20,
          }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
              Quiz Completed!
            </Text>
            <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
              {subjectName} • {subjectCode}
            </Text>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Score Card */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              alignItems: 'center',
            }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: score.passed ? '#f0fdf4' : '#fee2e2',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: score.passed ? '#16a34a' : '#dc2626' }}>
                  {Math.round(score.scorePercentage)}%
                </Text>
              </View>
              
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
                {score.passed ? 'Passed!' : 'Keep Practicing'}
              </Text>
              
              <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24, textAlign: 'center' }}>
                You scored {score.correctAnswers} out of {score.totalQuestions} questions correctly
              </Text>

              {/* Stats */}
              <View style={{ width: '100%' }}>
                <StatRow icon="checkmark-circle" label="Correct" value={score.correctAnswers} color="#16a34a" />
                <StatRow icon="close-circle" label="Wrong" value={score.wrongAnswers} color="#dc2626" />
                <StatRow icon="time" label="Time Taken" value={formatTime(score.timeSpent)} color="#8b5cf6" />
              </View>
            </View>

            {/* Answer Review */}
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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
                Answer Review
              </Text>

              {results.map((result, idx) => (
                <View key={idx} style={{
                  backgroundColor: result.isCorrect ? '#f0fdf4' : '#fee2e2',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: result.isCorrect ? '#16a34a' : '#dc2626',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons
                      name={result.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={result.isCorrect ? '#16a34a' : '#dc2626'}
                    />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: result.isCorrect ? '#15803d' : '#b91c1c',
                      marginLeft: 8,
                    }}>
                      Question {idx + 1}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 14, color: '#1f2937', marginBottom: 8, lineHeight: 20 }}>
                    {result.question}
                  </Text>

                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>
                      Your answer: <Text style={{ fontWeight: '600', color: result.isCorrect ? '#15803d' : '#b91c1c' }}>
                        {result.userAnswer}
                      </Text>
                    </Text>
                    {!result.isCorrect && (
                      <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                        Correct answer: <Text style={{ fontWeight: '600', color: '#16a34a' }}>
                          {result.correctAnswer}
                        </Text>
                      </Text>
                    )}
                  </View>

                  {result.explanation && (
                    <View style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: result.isCorrect ? '#bbf7d0' : '#fecaca',
                    }}>
                      <Text style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                        {result.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => router.push('/student/quiz-history' as any)}
                style={{
                  backgroundColor: '#8b5cf6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="time-outline" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                  View Quiz History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/student/quiz-list' as any)}
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#8b5cf6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="list" size={20} color="#8b5cf6" />
                <Text style={{ color: '#8b5cf6', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                  Back to Quiz List
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return null;
}

// Helper Components
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={20} color="#8b5cf6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>{value}</Text>
      </View>
    </View>
  );
}

function StatRow({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    }}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={{ flex: 1, fontSize: 16, color: '#1f2937', marginLeft: 12 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>
        {value}
      </Text>
    </View>
  );
}
