import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const COMPANY_EMAIL = 'support@habitguard.com';
const FEEDBACK_EMAIL = 'feedback@habitguard.com';
const BUSINESS_EMAIL = 'business@habitguard.com';

export default function ContactUsScreen() {
  const router = useRouter();

  const sendEmail = (emailType: 'support' | 'feedback' | 'business') => {
    let email = COMPANY_EMAIL;
    let subject = 'HabitGuard Support Request';
    
    switch (emailType) {
      case 'feedback':
        email = FEEDBACK_EMAIL;
        subject = 'HabitGuard Feedback';
        break;
      case 'business':
        email = BUSINESS_EMAIL;
        subject = 'HabitGuard Business Inquiry';
        break;
      default:
        email = COMPANY_EMAIL;
        subject = 'HabitGuard Support Request';
    }

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please send an email to: ${email}`,
            [
              {
                text: 'Copy Email',
                onPress: () => {
                  // Note: Expo Clipboard would be needed for this
                  Alert.alert('Email', email);
                }
              },
              { text: 'OK' }
            ]
          );
        }
      })
      .catch((error) => {
        console.error('Error opening email:', error);
        Alert.alert(
          'Error',
          `Could not open email client. Please send an email to: ${email}`
        );
      });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Contact Us</Text>
        </View>
        <Text className="text-blue-100 text-base">We're here to help you!</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Main Contact Card */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow">
          <View className="items-center mb-4">
            <View className="bg-blue-100 rounded-full p-4 mb-4">
              <Ionicons name="mail" size={40} color="#3B82F6" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">Get in Touch</Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Have questions, feedback, or need support? We'd love to hear from you!
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 flex-row items-center justify-center"
            onPress={() => sendEmail('support')}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Email Support Team
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Options */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-4">Contact Options</Text>

          {/* General Support */}
          <TouchableOpacity
            className="flex-row items-start p-4 bg-gray-50 rounded-lg mb-3"
            onPress={() => sendEmail('support')}
          >
            <View className="bg-blue-100 rounded-full p-3 mr-4">
              <Ionicons name="help-circle" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                General Support
              </Text>
              <Text className="text-sm text-gray-600 mb-2 leading-5">
                Questions, technical issues, or need help?
              </Text>
              <Text className="text-sm text-blue-600 font-medium">
                {COMPANY_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Feedback */}
          <TouchableOpacity
            className="flex-row items-start p-4 bg-gray-50 rounded-lg mb-3"
            onPress={() => sendEmail('feedback')}
          >
            <View className="bg-green-100 rounded-full p-3 mr-4">
              <Ionicons name="chatbox-ellipses" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                Feedback & Suggestions
              </Text>
              <Text className="text-sm text-gray-600 mb-2 leading-5">
                Share your ideas to improve HabitGuard
              </Text>
              <Text className="text-sm text-green-600 font-medium">
                {FEEDBACK_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Business Inquiries */}
          <TouchableOpacity
            className="flex-row items-start p-4 bg-gray-50 rounded-lg"
            onPress={() => sendEmail('business')}
          >
            <View className="bg-purple-100 rounded-full p-3 mr-4">
              <Ionicons name="briefcase" size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                Business Inquiries
              </Text>
              <Text className="text-sm text-gray-600 mb-2 leading-5">
                Partnerships, enterprise, or media inquiries
              </Text>
              <Text className="text-sm text-purple-600 font-medium">
                {BUSINESS_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Response Time */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text className="text-base font-semibold text-blue-800 ml-2">
              Response Time
            </Text>
          </View>
          <Text className="text-sm text-gray-700 leading-5">
            We typically respond within 24-48 hours during business days. For urgent issues, please mention "URGENT" in your subject line.
          </Text>
        </View>

        {/* FAQ */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              Quick Help
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-3 leading-5">
            Before contacting us, check if your question is answered in our FAQ section.
          </Text>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg py-3 flex-row items-center justify-center"
            onPress={() => router.push('/help-faq')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold text-base ml-2">
              View FAQ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Common Issues */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            🔧 Common Issues
          </Text>
          
          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-800 mb-1">
              • App not tracking usage?
            </Text>
            <Text className="text-sm text-gray-600 ml-4 leading-5">
              Make sure Usage Access permission is enabled in Settings
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-800 mb-1">
              • Login issues?
            </Text>
            <Text className="text-sm text-gray-600 ml-4 leading-5">
              Try the demo account: demo@habitguard.com / demo123
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-base font-semibold text-gray-800 mb-1">
              • No notifications?
            </Text>
            <Text className="text-sm text-gray-600 ml-4 leading-5">
              Check notification permissions in Settings {'>'} Apps {'>'} HabitGuard
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-800 mb-1">
              • Data not showing?
            </Text>
            <Text className="text-sm text-gray-600 ml-4 leading-5">
              Force close and reopen the app, then grant permissions if prompted
            </Text>
          </View>
        </View>

        {/* Social Media (Optional - for future) */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            🌐 Connect With Us
          </Text>
          <Text className="text-sm text-gray-600 mb-4 leading-5">
            Follow us on social media for updates, tips, and news
          </Text>
          
          <View className="flex-row justify-around">
            <TouchableOpacity className="items-center">
              <View className="bg-blue-100 rounded-full p-3 mb-2">
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </View>
              <Text className="text-xs text-gray-600">Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="bg-blue-100 rounded-full p-3 mb-2">
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </View>
              <Text className="text-xs text-gray-600">Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="bg-pink-100 rounded-full p-3 mb-2">
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </View>
              <Text className="text-xs text-gray-600">Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center">
              <View className="bg-red-100 rounded-full p-3 mb-2">
                <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              </View>
              <Text className="text-xs text-gray-600">YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Office Hours */}
        <View className="bg-gray-100 rounded-lg p-4 mb-6">
          <Text className="text-sm text-gray-600 text-center leading-5">
            <Text className="font-semibold">Support Hours:{'\n'}</Text>
            Monday - Friday: 9:00 AM - 6:00 PM (IST){'\n'}
            Saturday: 10:00 AM - 4:00 PM (IST){'\n'}
            Sunday: Closed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
