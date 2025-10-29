import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Privacy Policy</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-sm text-gray-500 mb-2">Last Updated: October 29, 2025</Text>
          <Text className="text-base text-gray-700 leading-6">
            Welcome to HabitGuard. We respect your privacy and are committed to protecting your personal data.
          </Text>
        </View>

        {/* Information We Collect */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">📊 Information We Collect</Text>
          
          <Text className="text-base font-semibold text-gray-800 mb-2">Account Information:</Text>
          <Text className="text-base text-gray-700 mb-3 leading-6">
            • Name, email address, age, education level{'\n'}
            • Mobile number (optional){'\n'}
            • Password (encrypted with bcrypt)
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Usage Data:</Text>
          <Text className="text-base text-gray-700 mb-3 leading-6">
            • App usage statistics (time spent on apps){'\n'}
            • Screen time data{'\n'}
            • App categories and daily patterns{'\n'}
            • Goal progress and achievements
          </Text>

          <Text className="text-base font-semibold text-gray-800 mb-2">Device Information:</Text>
          <Text className="text-base text-gray-700 leading-6">
            • Device model and operating system{'\n'}
            • App version{'\n'}
            • Notification preferences
          </Text>
        </View>

        {/* How We Use Your Information */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">🔐 How We Use Your Information</Text>
          
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Provide Services:</Text> Track screen time, analyze usage patterns, and generate insights
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Personalization:</Text> Customize recommendations based on your usage
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Goal Tracking:</Text> Monitor progress towards daily and weekly goals
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Reports:</Text> Generate weekly reports and analytics
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            • <Text className="font-semibold">Improvements:</Text> Enhance app features and user experience
          </Text>
        </View>

        {/* Data Storage */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">💾 Data Storage & Security</Text>
          
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Local Storage:</Text> Usage data is stored locally on your device using AsyncStorage
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Server Storage:</Text> Account information is stored on secure servers with MySQL database
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Encryption:</Text> All passwords are hashed using bcrypt (10 salt rounds)
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">JWT Tokens:</Text> Secure authentication with 30-day expiry
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            • <Text className="font-semibold">HTTPS:</Text> All API communications use secure protocols
          </Text>
        </View>

        {/* Data Sharing */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">🤝 Data Sharing</Text>
          
          <Text className="text-base text-gray-700 mb-3 leading-6">
            <Text className="font-semibold">We DO NOT:</Text>
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            ❌ Sell your personal data to third parties{'\n'}
            ❌ Share usage data with advertisers{'\n'}
            ❌ Track you across other apps{'\n'}
            ❌ Access app content or messages
          </Text>

          <Text className="text-base text-gray-700 mt-3 mb-2 leading-6">
            <Text className="font-semibold">We MAY share data:</Text>
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            ✅ When legally required (court orders, law enforcement){'\n'}
            ✅ With your explicit consent{'\n'}
            ✅ Anonymized data for research (no personal identifiers)
          </Text>
        </View>

        {/* Your Rights */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">⚖️ Your Rights</Text>
          
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Access:</Text> View all your stored data
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Correction:</Text> Update incorrect information
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Deletion:</Text> Delete your account and all associated data
          </Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            • <Text className="font-semibold">Export:</Text> Download your data in standard formats
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            • <Text className="font-semibold">Opt-out:</Text> Disable notifications and data collection features
          </Text>
        </View>

        {/* Children's Privacy */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">👶 Children's Privacy</Text>
          <Text className="text-base text-gray-700 leading-6">
            HabitGuard is designed for users 13 years and older. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us to have it removed.
          </Text>
        </View>

        {/* Changes to Privacy Policy */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">📝 Changes to This Policy</Text>
          <Text className="text-base text-gray-700 leading-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
        </View>

        {/* Contact Us */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <Text className="text-lg font-bold text-blue-800 mb-3">📧 Contact Us</Text>
          <Text className="text-base text-gray-700 mb-2 leading-6">
            If you have questions about this Privacy Policy or want to exercise your rights:
          </Text>
          <Text className="text-base text-blue-600 font-semibold">
            Email: support@habitguard.com
          </Text>
        </View>

        {/* Data Retention */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">⏰ Data Retention</Text>
          <Text className="text-base text-gray-700 leading-6">
            • Account data: Retained until you delete your account{'\n'}
            • Usage statistics: Kept for 90 days by default{'\n'}
            • Backup data: Deleted 30 days after account deletion{'\n'}
            • Logs: Retained for 14 days for security purposes
          </Text>
        </View>

        <View className="bg-gray-100 rounded-lg p-4 mb-6">
          <Text className="text-sm text-gray-600 text-center leading-5">
            By using HabitGuard, you agree to this Privacy Policy.{'\n'}
            Read our Terms of Service for more information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
