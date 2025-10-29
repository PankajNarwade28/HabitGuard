import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={{flex: 1, backgroundColor: '#f0fdf4'}}>
      {/* Header */}
      <View style={{backgroundColor: '#16a34a', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 16}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginRight: 16}}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{fontSize: 24, fontWeight: 'bold', color: '#ffffff'}}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView style={{flex: 1, paddingHorizontal: 16, paddingVertical: 24}}>
        <View style={{backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#16a34a', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 13, color: '#64748b', marginBottom: 8}}>Last Updated: October 29, 2025</Text>
          <Text style={{fontSize: 15, color: '#475569', lineHeight: 24}}>
            Welcome to HabitGuard. We respect your privacy and are committed to protecting your personal data.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={{backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#16a34a', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#14532d', marginBottom: 12}}>📊 Information We Collect</Text>
          
          <Text style={{fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8}}>Account Information:</Text>
          <Text style={{fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 12}}>
            • Name, email address, age, education level{'\n'}
            • Mobile number (optional){'\n'}
            • Password (encrypted with bcrypt)
          </Text>

          <Text style={{fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8}}>Usage Data:</Text>
          <Text style={{fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 12}}>
            • App usage statistics (time spent on apps){'\n'}
            • Screen time data{'\n'}
            • App categories and daily patterns{'\n'}
            • Goal progress and achievements
          </Text>

          <Text style={{fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8}}>Device Information:</Text>
          <Text style={{fontSize: 15, color: '#475569', lineHeight: 24}}>
            • Device model and operating system{'\n'}
            • App version{'\n'}
            • Notification preferences
          </Text>
        </View>

        {/* How We Use Your Information */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>🔐 How We Use Your Information</Text>
          
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Provide Services:</Text> Track screen time, analyze usage patterns, and generate insights
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Personalization:</Text> Customize recommendations based on your usage
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Goal Tracking:</Text> Monitor progress towards daily and weekly goals
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Reports:</Text> Generate weekly reports and analytics
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Improvements:</Text> Enhance app features and user experience
          </Text>
        </View>

        {/* Data Storage */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>💾 Data Storage & Security</Text>
          
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Local Storage:</Text> Usage data is stored locally on your device using AsyncStorage
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Server Storage:</Text> Account information is stored on secure servers with MySQL database
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Encryption:</Text> All passwords are hashed using bcrypt (10 salt rounds)
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>JWT Tokens:</Text> Secure authentication with 30-day expiry
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>HTTPS:</Text> All API communications use secure protocols
          </Text>
        </View>

        {/* Data Sharing */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>🤝 Data Sharing</Text>
          
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 12}}>
            <Text style={{fontWeight: "600", color: "#1e293b"}}>We DO NOT:</Text>
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            ❌ Sell your personal data to third parties{'\n'}
            ❌ Share usage data with advertisers{'\n'}
            ❌ Track you across other apps{'\n'}
            ❌ Access app content or messages
          </Text>

          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginTop: 12, marginBottom: 8}}>
            <Text style={{fontWeight: "600", color: "#1e293b"}}>We MAY share data:</Text>
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            ✅ When legally required (court orders, law enforcement){'\n'}
            ✅ With your explicit consent{'\n'}
            ✅ Anonymized data for research (no personal identifiers)
          </Text>
        </View>

        {/* Your Rights */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>⚖️ Your Rights</Text>
          
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Access:</Text> View all your stored data
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Correction:</Text> Update incorrect information
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Deletion:</Text> Delete your account and all associated data
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Export:</Text> Download your data in standard formats
          </Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            • <Text style={{fontWeight: "600", color: "#1e293b"}}>Opt-out:</Text> Disable notifications and data collection features
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>👶 Children's Privacy</Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            HabitGuard is designed for users 13 years and older. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us to have it removed.
          </Text>
        </View>

        {/* Changes to Privacy Policy */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>📝 Changes to This Policy</Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
        </View>

        {/* Contact Us */}
        <View style={{backgroundColor: "#dcfce7", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#86efac"}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#166534", marginBottom: 12}}>📧 Contact Us</Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginBottom: 8}}>
            If you have questions about this Privacy Policy or want to exercise your rights:
          </Text>
          <Text style={{fontSize: 16, fontWeight: "600", color: "#16a34a", marginTop: 8}}>
            Email: support@habitguard.com
          </Text>
        </View>

        {/* Data Retention */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#14532d", marginBottom: 12}}>⏰ Data Retention</Text>
          <Text style={{fontSize: 15, color: "#475569", lineHeight: 24}}>
            • Account data: Retained until you delete your account{'\n'}
            • Usage statistics: Kept for 90 days by default{'\n'}
            • Backup data: Deleted 30 days after account deletion{'\n'}
            • Logs: Retained for 14 days for security purposes
          </Text>
        </View>

        <View style={{backgroundColor: "#e2e8f0", borderRadius: 16, padding: 16, marginBottom: 24}}>
          <Text style={{fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22}}>
            By using HabitGuard, you agree to this Privacy Policy.{'\n'}
            Read our Terms of Service for more information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

