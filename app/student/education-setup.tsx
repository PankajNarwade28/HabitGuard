import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import StudentService from '../../services/StudentService';

export default function EducationSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any>(null);
  
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
        setUserId(user.userId || user.u_id);
        console.log('User ID loaded:', user.userId || user.u_id);
      } else {
        console.log('No user data found in storage');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await StudentService.getCourses();
      if (result.success) {
        setCourses(result.courses);
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
      const result = await StudentService.createProfile(userId, {
        courseType,
        degreeName,
        currentSemester: parseInt(currentSemester),
        specialization: specialization || undefined,
        studyHoursPerDay: parseInt(studyHours),
      });

      if (result.success) {
        Alert.alert('Success', 'Student profile created successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create student profile');
    } finally {
      setLoading(false);
    }
  };

  const getDegreeList = () => {
    if (!courses || !courses[courseType]) return [];
    return Object.keys(courses[courseType]);
  };

  const getMaxSemesters = () => {
    if (!courses || !courses[courseType] || !degreeName) return 8;
    return courses[courseType][degreeName]?.totalSemesters || 8;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#16a34a',
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}>
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
                setDegreeName(''); // Reset degree when type changes
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
              Create Student Profile
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
