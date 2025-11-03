import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import StudentService from '../../services/StudentService';

export default function EducationSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [courseType, setCourseType] = useState<'undergraduate' | 'postgraduate' | 'diploma'>('undergraduate');
  const [degreeName, setDegreeName] = useState('');
  const [currentSemester, setCurrentSemester] = useState('1');
  const [specialization, setSpecialization] = useState('');
  const [studyHours, setStudyHours] = useState('4');

  useEffect(() => {
    loadUserData();
    loadCourses();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.userId || user.u_id;
        setUserId(id);
        console.log('User ID loaded:', id);
        
        // Check if profile already exists
        await checkExistingProfile(id);
      } else {
        console.log('No user data found in storage');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkExistingProfile = async (id: number) => {
    try {
      const result = await StudentService.getProfile(id);
      if (result.success && result.profile) {
        const profile = result.profile;
        setExistingProfile(profile);
        
        // Pre-fill form with existing data
        setCourseType(profile.course_type);
        setDegreeName(profile.degree_name);
        setCurrentSemester(profile.current_semester.toString());
        setSpecialization(profile.specialization || '');
        setStudyHours(profile.study_hours_per_day.toString());
        console.log('Loaded existing profile:', profile);
      }
    } catch (error) {
      // Profile doesn't exist, which is fine for creation screen
      console.log('No existing profile found');
    }
  };

  const loadCourses = async () => {
    try {
      const result = await StudentService.getCourses();
      console.log('Courses API result:', JSON.stringify(result, null, 2));
      if (result.success) {
        setCourses(result.courses);
        console.log('Courses loaded:', Object.keys(result.courses));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    if (!degreeName) {
      Alert.alert('Error', 'Please select a degree program');
      return;
    }

    setLoading(true);
    try {
      // If profile exists, update it; otherwise create new
      const result = existingProfile 
        ? await StudentService.updateProfile(userId, {
            currentSemester: parseInt(currentSemester),
            specialization: specialization || undefined,
            studyHoursPerDay: parseInt(studyHours),
          })
        : await StudentService.createProfile(userId, {
            courseType,
            degreeName,
            currentSemester: parseInt(currentSemester),
            specialization: specialization || undefined,
            studyHoursPerDay: parseInt(studyHours),
          });

      if (result.success) {
        Alert.alert(
          'Success', 
          existingProfile ? 'Profile updated successfully!' : 'Student profile created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsEditMode(false);
                // Reload profile data
                if (userId) checkExistingProfile(userId);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || `Failed to ${existingProfile ? 'update' : 'create'} profile`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', `Failed to ${existingProfile ? 'update' : 'create'} student profile`);
    } finally {
      setLoading(false);
    }
  };

  const getDegreeList = () => {
    if (!courses || !courses[courseType]) {
      console.log('No courses found for:', courseType, 'Available:', courses ? Object.keys(courses) : 'null');
      return [];
    }
    const degrees = Object.keys(courses[courseType]);
    console.log('Degrees for', courseType, ':', degrees);
    return degrees;
  };

  const getMaxSemesters = () => {
    if (!courses || !courses[courseType] || !degreeName) return 8;
    return courses[courseType][degreeName]?.totalSemesters || 8;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
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
            Student Profile Setup
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#fff',
            opacity: 0.9,
          }}>
            Tell us about your education to get personalized recommendations
          </Text>
        </View>

      {/* Existing Profile Display */}
      {existingProfile && !isEditMode && (
        <View style={{
          margin: 20,
          padding: 20,
          backgroundColor: '#fff',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1f2937',
            }}>
              Your Student Profile
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditMode(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#16a34a',
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Details */}
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Course Type</Text>
              <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500', textTransform: 'capitalize' }}>
                {existingProfile.course_type}
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Degree Program</Text>
              <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500' }}>
                {existingProfile.degree_name}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Current Semester</Text>
                <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500' }}>
                  Semester {existingProfile.current_semester}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Study Hours/Day</Text>
                <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500' }}>
                  {existingProfile.study_hours_per_day} hours
                </Text>
              </View>
            </View>

            {existingProfile.specialization && (
              <View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Specialization</Text>
                <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500' }}>
                  {existingProfile.specialization}
                </Text>
              </View>
            )}

            {existingProfile.subjects && existingProfile.subjects.length > 0 && (
              <View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  Enrolled Subjects ({existingProfile.subjects.length})
                </Text>
                <View style={{ gap: 8 }}>
                  {existingProfile.subjects.slice(0, 3).map((subject: any, index: number) => (
                    <View key={index} style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 6,
                    }}>
                      <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>
                        {subject.subject_code} - {subject.subject_name}
                      </Text>
                    </View>
                  ))}
                  {existingProfile.subjects.length > 3 && (
                    <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                      +{existingProfile.subjects.length - 3} more subjects
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/student/recommendations')}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                View Recommendations
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/student/quiz-list')}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: '#8b5cf6',
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                View Quizzes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit/Create Form */}
      {(!existingProfile || isEditMode) && (
      <View style={{ padding: 20 }}>
        {isEditMode && (
          <TouchableOpacity
            onPress={() => {
              setIsEditMode(false);
              // Reset to existing profile data
              if (existingProfile) {
                setCourseType(existingProfile.course_type);
                setDegreeName(existingProfile.degree_name);
                setCurrentSemester(existingProfile.current_semester.toString());
                setSpecialization(existingProfile.specialization || '');
                setStudyHours(existingProfile.study_hours_per_day.toString());
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              gap: 8,
            }}
          >
            <Ionicons name="close-circle" size={24} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '600' }}>
              Cancel Edit
            </Text>
          </TouchableOpacity>
        )}

        {/* Course Type */}
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 12,
        }}>
          Course Type *
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          {['undergraduate', 'postgraduate', 'diploma'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                // Disable course type change if profile exists (can only update semester/specialization)
                if (!existingProfile) {
                  setCourseType(type as any);
                  setDegreeName(''); // Reset degree when type changes
                }
              }}
              disabled={!!existingProfile}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: courseType === type ? '#16a34a' : '#e5e7eb',
                backgroundColor: courseType === type ? '#f0fdf4' : existingProfile ? '#f9fafb' : '#fff',
                opacity: existingProfile ? 0.6 : 1,
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: courseType === type ? '#16a34a' : '#6b7280',
                fontSize: 13,
              }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Degree Selection */}
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 12,
        }}>
          Degree Program * {existingProfile && '(Cannot be changed)'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
        >
          {getDegreeList().map((degree) => (
            <TouchableOpacity
              key={degree}
              onPress={() => !existingProfile && setDegreeName(degree)}
              disabled={!!existingProfile}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: degreeName === degree ? '#16a34a' : '#e5e7eb',
                backgroundColor: degreeName === degree ? '#f0fdf4' : existingProfile ? '#f9fafb' : '#fff',
                marginRight: 12,
                opacity: existingProfile ? 0.6 : 1,
              }}
            >
              <Text style={{
                fontWeight: '600',
                color: degreeName === degree ? '#16a34a' : '#6b7280',
                fontSize: 14,
              }}>
                {degree}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current Semester */}
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 12,
        }}>
          Current Semester *
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {Array.from({ length: getMaxSemesters() }, (_, i) => i + 1).map((sem) => (
            <TouchableOpacity
              key={sem}
              onPress={() => setCurrentSemester(sem.toString())}
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: currentSemester === sem.toString() ? '#16a34a' : '#e5e7eb',
                backgroundColor: currentSemester === sem.toString() ? '#f0fdf4' : '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontWeight: '700',
                fontSize: 18,
                color: currentSemester === sem.toString() ? '#16a34a' : '#6b7280',
              }}>
                {sem}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Specialization (Optional) */}
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 12,
        }}>
          Specialization (Optional)
        </Text>
        <TextInput
          value={specialization}
          onChangeText={setSpecialization}
          placeholder="e.g., Artificial Intelligence, Data Science"
          placeholderTextColor="#9ca3af"
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: '#1f2937',
            backgroundColor: '#fff',
            marginBottom: 24,
          }}
        />

        {/* Study Hours Per Day */}
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 12,
        }}>
          Study Hours Per Day: {studyHours} hours
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          {['2', '3', '4', '5', '6', '7', '8'].map((hours) => (
            <TouchableOpacity
              key={hours}
              onPress={() => setStudyHours(hours)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: studyHours === hours ? '#16a34a' : '#e5e7eb',
                backgroundColor: studyHours === hours ? '#f0fdf4' : '#fff',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: studyHours === hours ? '#16a34a' : '#6b7280',
                fontSize: 16,
              }}>
                {hours}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !degreeName}
          style={{
            backgroundColor: !degreeName ? '#9ca3af' : '#16a34a',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: '600',
            }}>
              {existingProfile ? 'Update Profile' : 'Create Student Profile'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      )}
    </ScrollView>
    </>
  );
}
