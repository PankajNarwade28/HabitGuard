import { useUser } from '@/contexts/UserContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditProfileScreen() {
  const { user, updateUserProfile } = useUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    education: user?.education || '',
    mobile_no: user?.mobile_no || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.age) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
        newErrors.age = 'Please enter a valid age (5-120)';
      }
    }

    if (formData.mobile_no) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.mobile_no.replace(/\s/g, ''))) {
        newErrors.mobile_no = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (formData.education && formData.education.length < 2) {
      newErrors.education = 'Education must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        education: formData.education.trim() || undefined,
        mobile_no: formData.mobile_no.replace(/\s/g, '') || undefined,
      };

      const success = await updateUserProfile(updateData);

      if (success) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'Keep Editing',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="checkmark" size={28} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#ffffff" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#16a34a" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <View style={[styles.inputWrapper, errors.age && styles.inputError]}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => {
                  setFormData({ ...formData, age: text.replace(/[^0-9]/g, '') });
                  if (errors.age) {
                    setErrors({ ...errors, age: '' });
                  }
                }}
                placeholder="Enter your age"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Education */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Education</Text>
            <View style={[styles.inputWrapper, errors.education && styles.inputError]}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.education}
                onChangeText={(text) => {
                  setFormData({ ...formData, education: text });
                  if (errors.education) {
                    setErrors({ ...errors, education: '' });
                  }
                }}
                placeholder="e.g., Bachelor's, Master's, High School"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
              />
            </View>
            {errors.education && <Text style={styles.errorText}>{errors.education}</Text>}
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputWrapper, errors.mobile_no && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.mobile_no}
                onChangeText={(text) => {
                  setFormData({ ...formData, mobile_no: text.replace(/[^0-9]/g, '') });
                  if (errors.mobile_no) {
                    setErrors({ ...errors, mobile_no: '' });
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.mobile_no && <Text style={styles.errorText}>{errors.mobile_no}</Text>}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={[styles.input, styles.inputDisabledText]}
                value={user?.email || ''}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor="#cbd5e1"
              />
              <Ionicons name="lock-closed" size={16} color="#94a3b8" />
            </View>
            <Text style={styles.helperText}>Email cannot be changed for security reasons</Text>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16a34a',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#16a34a',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginLeft: 6,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14532d',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  inputDisabledText: {
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
});
