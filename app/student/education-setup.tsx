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

  useEffect(() => {
    if (existingProfile) {
      // Pre-fill form with existing profile data
      setCourseType(existingProfile.course_type);
      setDegreeName(existingProfile.degree_name);
      setCurrentSemester(existingProfile.current_semester.toString());
      setSpecialization(existingProfile.specialization || '');
      setStudyHours(existingProfile.study_hours_per_day.toString());
    }
  }, [existingProfile]);

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
        setExistingProfile(result.profile);
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
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await StudentService.updateProfile(userId, {
          currentSemester: parseInt(currentSemester),
          specialization: specialization || undefined,
          studyHoursPerDay: parseInt(studyHours),
        });
      } else {
        // Create new profile
        result = await StudentService.createProfile(userId, {
          courseType,
          degreeName,
          currentSemester: parseInt(currentSemester),
          specialization: specialization || undefined,
          studyHoursPerDay: parseInt(studyHours),
        });
      }

      if (result.success) {
        Alert.alert(
          'Success', 
          existingProfile ? 'Profile updated successfully!' : 'Student profile created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.push('/student/profile'),
            },
          ]
        );
      } else {
        if (result.message === 'Student profile already exists' && !existingProfile) {
          Alert.alert(
            'Profile Exists', 
            'You already have a student profile. Would you like to view it?',
            [
              {
                text: 'View Profile',
                onPress: () => router.push('/student/profile'),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Error', result.message || `Failed to ${existingProfile ? 'update' : 'create'} profile`);
        }
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
            {existingProfile ? 'Edit Student Profile' : 'Student Profile Setup'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#fff',
            opacity: 0.9,
          }}>
            {existingProfile ? 'Update your education details' : 'Tell us about your education to get personalized recommendations'}
          </Text>
        </View>

      {/* Existing Profile Notice */}
      {existingProfile && (
        <View style={{
          margin: 20,
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#3b82f6',
          borderRadius: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1e40af',
              marginLeft: 8,
            }}>
              Editing Existing Profile
            </Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: '#1e3a8a',
            marginBottom: 4,
          }}>
            Course: {existingProfile.course_type} - {existingProfile.degree_name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#1e3a8a',
            marginBottom: 12,
          }}>
            Current Semester: {existingProfile.current_semester}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/student/profile')}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: '#16a34a',
                borderRadius: 6,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="person" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                View Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/student/recommendations')}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: '#3b82f6',
                borderRadius: 6,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="library" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ padding: 20 }}>
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
                setCourseType(type as any);
                if (!existingProfile) setDegreeName(''); // Only reset if creating new
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: courseType === type ? '#16a34a' : '#e5e7eb',
                backgroundColor: courseType === type ? '#f0fdf4' : '#fff',
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
          Degree Program *
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
        >
          {getDegreeList().map((degree) => (
            <TouchableOpacity
              key={degree}
              onPress={() => setDegreeName(degree)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: degreeName === degree ? '#16a34a' : '#e5e7eb',
                backgroundColor: degreeName === degree ? '#f0fdf4' : '#fff',
                marginRight: 12,
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
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={existingProfile ? "checkmark-circle" : "add-circle"} size={24} color="#fff" />
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                {existingProfile ? 'Update Profile' : 'Create Student Profile'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  );
}
