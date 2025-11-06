import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import StudentService, { StudyTimeSuggestion } from '../../services/StudentService';
import StudySessionService, { StudySession } from '../../services/StudySessionService';

export default function StudyPlan() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<StudyTimeSuggestion[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Timer states
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<StudyTimeSuggestion | null>(null);
  const [customDuration, setCustomDuration] = useState('60');
  const [showStopModal, setShowStopModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseStartTime = useRef<number>(0);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        setUserId(id);
        
        // Load study time suggestions
        const result = await StudentService.getStudyTimeSuggestions(id);
        if (result.success) {
          setSuggestions(result.suggestions);
        }
        
        // Check for active session
        const activeResult = await StudySessionService.getActiveSession(id);
        if (activeResult.success && activeResult.hasActiveSession && activeResult.session) {
          setActiveSession(activeResult.session);
          
          // Calculate elapsed time if session is in progress
          if (activeResult.session.status === 'in_progress' && activeResult.session.start_time) {
            const startTime = new Date(activeResult.session.start_time).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000) - activeResult.session.total_paused_seconds;
            setElapsedSeconds(Math.max(0, elapsed));
            setTimerRunning(true);
            startTimer();
          } else if (activeResult.session.status === 'paused') {
            setElapsedSeconds(activeResult.session.actual_duration_seconds);
            setTimerRunning(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load study plan data');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStartSession = (subject: StudyTimeSuggestion) => {
    setSelectedSubject(subject);
    const defaultMinutes = Math.round(subject.dailyHours * 60);
    setCustomDuration(defaultMinutes.toString());
    setShowStartModal(true);
  };

  const confirmStartSession = async () => {
    if (!userId || !selectedSubject) return;
    
    const durationMinutes = parseInt(customDuration) || 60;
    
    try {
      setShowStartModal(false);
      setLoading(true);
      
      // Create a new session
      const createResult = await StudySessionService.createStudySession(userId, {
        subjectId: 0, // Will be resolved by backend
        subjectCode: selectedSubject.subjectCode,
        subjectName: selectedSubject.subjectName,
        plannedDurationMinutes: durationMinutes,
      });
      
      if (createResult.success && createResult.sessionId) {
        // Start the session
        const startResult = await StudySessionService.startSession(createResult.sessionId);
        
        if (startResult.success && startResult.session) {
          setActiveSession(startResult.session);
          setElapsedSeconds(0);
          setTimerRunning(true);
          startTimer();
          Alert.alert('Success', `Study session started for ${selectedSubject.subjectName}`);
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start study session');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      const result = await StudySessionService.pauseSession(activeSession.session_id, elapsedSeconds);
      
      if (result.success && result.session) {
        setActiveSession(result.session);
        setTimerRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        Alert.alert('Paused', 'Study session paused');
      }
    } catch (error) {
      console.error('Error pausing session:', error);
      Alert.alert('Error', 'Failed to pause session');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      const result = await StudySessionService.resumeSession(activeSession.session_id);
      
      if (result.success && result.session) {
        setActiveSession(result.session);
        setTimerRunning(true);
        startTimer();
        Alert.alert('Resumed', 'Study session resumed');
      }
    } catch (error) {
      console.error('Error resuming session:', error);
      Alert.alert('Error', 'Failed to resume session');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = () => {
    setShowStopModal(true);
  };

  const confirmStopSession = async () => {
    if (!activeSession) return;
    
    try {
      setShowStopModal(false);
      setLoading(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const result = await StudySessionService.stopSession(
        activeSession.session_id,
        elapsedSeconds,
        sessionNotes
      );
      
      if (result.success) {
        Alert.alert(
          'Completed!',
          `Study session completed!\n\nTime studied: ${result.studyMinutes} minutes\nCompletion: ${result.completionPercentage}%`,
          [
            {
              text: 'OK',
              onPress: () => {
                setActiveSession(null);
                setTimerRunning(false);
                setElapsedSeconds(0);
                setSessionNotes('');
                loadData();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error stopping session:', error);
      Alert.alert('Error', 'Failed to stop session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!activeSession) return 0;
    const plannedSeconds = activeSession.planned_duration_minutes * 60;
    return Math.min(100, (elapsedSeconds / plannedSeconds) * 100);
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
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>Loading study plan...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{ backgroundColor: '#f59e0b', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/student/profile')}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>Profile</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            Study Plan
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            Track your study sessions with timer
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Active Session Timer */}
          {activeSession && (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 2,
                borderColor: timerRunning ? '#10b981' : '#f59e0b',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: timerRunning ? '#10b981' : '#f59e0b',
                    marginRight: 8,
                  }}
                />
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', flex: 1 }}>
                  {activeSession.subject_name}
                </Text>
                <Ionicons name="book" size={24} color="#8b5cf6" />
              </View>

              {/* Timer Display */}
              <View style={{ alignItems: 'center', marginVertical: 24 }}>
                <Text style={{ fontSize: 48, fontWeight: '700', color: '#1f2937', letterSpacing: 2 }}>
                  {formatTime(elapsedSeconds)}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
                  Target: {activeSession.planned_duration_minutes} minutes
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={{ backgroundColor: '#e5e7eb', height: 8, borderRadius: 4, marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: getProgressPercentage() >= 100 ? '#10b981' : '#8b5cf6',
                    height: 8,
                    borderRadius: 4,
                    width: `${Math.min(100, getProgressPercentage())}%`,
                  }}
                />
              </View>

              {/* Control Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {timerRunning ? (
                  <TouchableOpacity
                    onPress={handlePauseSession}
                    style={{
                      flex: 1,
                      backgroundColor: '#f59e0b',
                      paddingVertical: 16,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="pause" size={24} color="#fff" />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 }}>
                      Pause
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleResumeSession}
                    style={{
                      flex: 1,
                      backgroundColor: '#10b981',
                      paddingVertical: 16,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="play" size={24} color="#fff" />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 }}>
                      Resume
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleStopSession}
                  style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    paddingVertical: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="stop" size={24} color="#fff" />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 }}>
                    Stop
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pause Count */}
              {activeSession.pause_count > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>
                    Paused {activeSession.pause_count} time{activeSession.pause_count !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Subjects List */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
            {activeSession ? 'Other Subjects' : 'Start Study Session'}
          </Text>

          {suggestions.length === 0 ? (
            <View
              style={{
                backgroundColor: '#fff',
                padding: 32,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Ionicons name="book-outline" size={64} color="#d1d5db" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1f2937',
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                No Subjects Found
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                Complete your student profile to see subjects
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion, index) => (
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
                      {suggestion.subjectName}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>
                      {suggestion.subjectCode} • {suggestion.credits} Credits
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: getPriorityColor(suggestion.priority),
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
                      {suggestion.priority}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#f9fafb',
                    padding: 16,
                    borderRadius: 12,
                    gap: 16,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Weekly Target</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>
                      {suggestion.recommendedWeeklyHours}h
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4 }}>Daily Target</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#f59e0b' }}>
                      {suggestion.dailyHours}h
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleStartSession(suggestion)}
                  disabled={!!activeSession}
                  style={{
                    backgroundColor: activeSession ? '#d1d5db' : '#8b5cf6',
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 }}>
                    Start Session
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Start Session Modal */}
      <Modal visible={showStartModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
              Start Study Session
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>
              {selectedSubject?.subjectName}
            </Text>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Duration (minutes)
            </Text>
            <TextInput
              value={customDuration}
              onChangeText={setCustomDuration}
              keyboardType="number-pad"
              style={{
                backgroundColor: '#f9fafb',
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: '#e5e7eb',
              }}
              placeholder="Enter duration in minutes"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowStartModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmStartSession}
                style={{
                  flex: 1,
                  backgroundColor: '#8b5cf6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stop Session Modal */}
      <Modal visible={showStopModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
              Complete Session
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>
              Time studied: {formatTime(elapsedSeconds)}
            </Text>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Notes (optional)
            </Text>
            <TextInput
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: '#f9fafb',
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: '#e5e7eb',
                textAlignVertical: 'top',
              }}
              placeholder="What did you learn today?"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowStopModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmStopSession}
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
