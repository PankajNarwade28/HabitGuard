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
    <View style={{flex: 1, backgroundColor: "#f0fdf4"}}>
      {/* Header */}
      <View style={{backgroundColor: "#16a34a", paddingTop: 48, paddingBottom: 24, paddingHorizontal: 16}}>
        <View style={{flexDirection: "row", alignItems: "center", marginBottom: 16}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginRight: 16}}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{fontSize: 24, fontWeight: "bold", color: "#ffffff"}}>Contact Us</Text>
        </View>
        <Text style={{fontSize: 16, color: "#dcfce7"}}>We're here to help you!</Text>
      </View>

      <ScrollView style={{flex: 1, paddingHorizontal: 16, paddingVertical: 24}}>
        {/* Main Contact Card */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <View style={{alignItems: "center", marginBottom: 16}}>
            <View style={{backgroundColor: "#dcfce7", borderRadius: 999, padding: 16, marginBottom: 16}}>
              <Ionicons name="mail" size={40} color="#16a34a" />
            </View>
            <Text style={{fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 8}}>Get in Touch</Text>
            <Text style={{fontSize: 16, color: "#64748b", textAlign: "center", lineHeight: 24}}>
              Have questions, feedback, or need support? We'd love to hear from you!
            </Text>
          </View>

          <TouchableOpacity
            style={{backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center"}}
            onPress={() => sendEmail('support')}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text style={{color: "#ffffff", fontWeight: "600", fontSize: 16, marginLeft: 8}}>
              Email Support Team
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Options */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 16}}>Contact Options</Text>

          {/* General Support */}
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "flex-start", padding: 16, backgroundColor: "#f9fafb", borderRadius: 16, marginBottom: 12}}
            onPress={() => sendEmail('support')}
          >
            <View style={{backgroundColor: "#dcfce7", borderRadius: 999, padding: 12, marginRight: 16}}>
              <Ionicons name="help-circle" size={24} color="#16a34a" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
                General Support
              </Text>
              <Text style={{fontSize: 14, color: "#64748b", marginBottom: 8, lineHeight: 20}}>
                Questions, technical issues, or need help?
              </Text>
              <Text style={{fontSize: 14, color: "#16a34a", fontWeight: "500"}}>
                {COMPANY_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Feedback */}
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "flex-start", padding: 16, backgroundColor: "#f9fafb", borderRadius: 16, marginBottom: 12}}
            onPress={() => sendEmail('feedback')}
          >
            <View style={{backgroundColor: "#dcfce7", borderRadius: 999, padding: 12, marginRight: 16}}>
              <Ionicons name="chatbox-ellipses" size={24} color="#10B981" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
                Feedback & Suggestions
              </Text>
              <Text style={{fontSize: 14, color: "#64748b", marginBottom: 8, lineHeight: 20}}>
                Share your ideas to improve HabitGuard
              </Text>
              <Text style={{fontSize: 14, color: "#16a34a", fontWeight: "500"}}>
                {FEEDBACK_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Business Inquiries */}
          <TouchableOpacity
            style={{flexDirection: "row", alignItems: "flex-start", padding: 16, backgroundColor: "#f9fafb", borderRadius: 16}}
            onPress={() => sendEmail('business')}
          >
            <View style={{backgroundColor: "#f3e8ff", borderRadius: 999, padding: 12, marginRight: 16}}>
              <Ionicons name="briefcase" size={24} color="#8B5CF6" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
                Business Inquiries
              </Text>
              <Text style={{fontSize: 14, color: "#64748b", marginBottom: 8, lineHeight: 20}}>
                Partnerships, enterprise, or media inquiries
              </Text>
              <Text style={{fontSize: 14, color: "#8B5CF6", fontWeight: "500"}}>
                {BUSINESS_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Response Time */}
        <View style={{backgroundColor: "#dcfce7", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#86efac"}}>
          <View style={{flexDirection: "row", alignItems: "center", marginBottom: 8}}>
            <Ionicons name="time" size={20} color="#16a34a" />
            <Text style={{fontSize: 16, fontWeight: "600", color: "#166534", marginLeft: 8}}>
              Response Time
            </Text>
          </View>
          <Text style={{fontSize: 14, color: "#475569", lineHeight: 20}}>
            We typically respond within 24-48 hours during business days. For urgent issues, please mention "URGENT" in your subject line.
          </Text>
        </View>

        {/* FAQ */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <View style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={{fontSize: 18, fontWeight: "bold", color: "#1e293b", marginLeft: 8}}>
              Quick Help
            </Text>
          </View>
          <Text style={{fontSize: 14, color: "#64748b", marginBottom: 12, lineHeight: 20}}>
            Before contacting us, check if your question is answered in our FAQ section.
          </Text>
          <TouchableOpacity
            style={{backgroundColor: "#f3f4f6", borderRadius: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center"}}
            onPress={() => router.push('/help-faq')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#16a34a" />
            <Text style={{color: "#16a34a", fontWeight: "600", fontSize: 16, marginLeft: 8}}>
              View FAQ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Common Issues */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12}}>
            🔧 Common Issues
          </Text>
          
          <View style={{marginBottom: 12}}>
            <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
              • App not tracking usage?
            </Text>
            <Text style={{fontSize: 14, color: "#64748b", marginLeft: 16, lineHeight: 20}}>
              Make sure Usage Access permission is enabled in Settings
            </Text>
          </View>

          <View style={{marginBottom: 12}}>
            <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
              • Login issues?
            </Text>
            <Text style={{fontSize: 14, color: "#64748b", marginLeft: 16, lineHeight: 20}}>
              Try the demo account: demo@habitguard.com / demo123
            </Text>
          </View>

          <View style={{marginBottom: 12}}>
            <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
              • No notifications?
            </Text>
            <Text style={{fontSize: 14, color: "#64748b", marginLeft: 16, lineHeight: 20}}>
              Check notification permissions in Settings {'>'} Apps {'>'} HabitGuard
            </Text>
          </View>

          <View>
            <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4}}>
              • Data not showing?
            </Text>
            <Text style={{fontSize: 14, color: "#64748b", marginLeft: 16, lineHeight: 20}}>
              Force close and reopen the app, then grant permissions if prompted
            </Text>
          </View>
        </View>

        {/* Social Media (Optional - for future) */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12}}>
            🌐 Connect With Us
          </Text>
          <Text style={{fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 20}}>
            Follow us on social media for updates, tips, and news
          </Text>
          
          <View style={{flexDirection: "row", justifyContent: "space-around"}}>
            <TouchableOpacity style={{alignItems: "center"}}>
              <View style={{backgroundColor: "#dbeafe", borderRadius: 999, padding: 12, marginBottom: 8}}>
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </View>
              <Text style={{fontSize: 12, color: "#64748b"}}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{alignItems: "center"}}>
              <View style={{backgroundColor: "#dbeafe", borderRadius: 999, padding: 12, marginBottom: 8}}>
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </View>
              <Text style={{fontSize: 12, color: "#64748b"}}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{alignItems: "center"}}>
              <View style={{backgroundColor: "#fce7f3", borderRadius: 999, padding: 12, marginBottom: 8}}>
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </View>
              <Text style={{fontSize: 12, color: "#64748b"}}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{alignItems: "center"}}>
              <View style={{backgroundColor: "#fee2e2", borderRadius: 999, padding: 12, marginBottom: 8}}>
                <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              </View>
              <Text style={{fontSize: 12, color: "#64748b"}}>YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Office Hours */}
        <View style={{backgroundColor: "#f3f4f6", borderRadius: 16, padding: 16, marginBottom: 24}}>
          <Text style={{fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20}}>
            <Text style={{fontWeight: "600"}}>Support Hours:{'\n'}</Text>
            Monday - Friday: 9:00 AM - 6:00 PM (IST){'\n'}
            Saturday: 10:00 AM - 4:00 PM (IST){'\n'}
            Sunday: Closed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

