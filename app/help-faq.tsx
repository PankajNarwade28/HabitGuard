import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'permissions' | 'goals' | 'reports' | 'troubleshooting';
}

const faqData: FAQItem[] = [
  {
    question: 'What is HabitGuard?',
    answer: 'HabitGuard is a screen time tracking and digital wellbeing app that helps you monitor your app usage, set daily goals, and build healthier digital habits. It uses ML algorithms to provide personalized insights and recommendations.',
    category: 'getting-started',
  },
  {
    question: 'How do I get started with HabitGuard?',
    answer: '1. Create an account or use the demo account (demo@habitguard.com / demo123)\n2. Grant Usage Access permission when prompted\n3. Grant notification permission for alerts\n4. Set your daily goals in the Goals tab\n5. Start tracking your screen time automatically',
    category: 'getting-started',
  },
  {
    question: 'Why is HabitGuard asking for Usage Access permission?',
    answer: 'Usage Access permission allows HabitGuard to track which apps you use and for how long. This data is stored locally on your device and is essential for providing accurate screen time statistics. Without this permission, the app cannot function properly.',
    category: 'permissions',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Yes! Your usage data is stored locally on your device using AsyncStorage. Account information is encrypted with bcrypt and stored on secure servers. We never sell your data to third parties or share it with advertisers. See our Privacy Policy for more details.',
    category: 'getting-started',
  },
  {
    question: 'How do I set daily goals?',
    answer: 'Go to the Goals tab and tap the "Add Goal" button. Choose a goal type (screen time, app usage, breaks, or productive time), set your target value, and save. You can track your progress throughout the day and see your streak when you consistently meet your goals.',
    category: 'goals',
  },
  {
    question: 'What is Student Mode?',
    answer: 'Student Mode is a special feature that restricts access to social media apps (Instagram, Facebook, TikTok, etc.) during study hours. When enabled, you\'ll receive alerts when trying to use restricted apps, helping you stay focused on your studies.',
    category: 'features',
  },
  {
    question: 'How does the ML prediction work?',
    answer: 'HabitGuard uses a neural network (TensorFlow) to analyze your usage patterns and predict future behavior. It learns from your daily app usage, time of day, and historical data to provide personalized recommendations and identify potential overuse patterns.',
    category: 'features',
  },
  {
    question: 'How do I generate a weekly report?',
    answer: 'Go to the Progress tab and tap "Generate Weekly Report". The report will show your usage trends, most-used apps, goal achievements, and insights. You can save it as a PDF or share it via email.',
    category: 'reports',
  },
  {
    question: 'Why am I not seeing any data?',
    answer: 'If you\'re not seeing data:\n1. Make sure Usage Access permission is granted\n2. Open Settings > Apps > HabitGuard > Permissions > Usage Access > Enable\n3. Use some apps for a few minutes\n4. Return to HabitGuard and check again\n5. Try force-closing and reopening the app',
    category: 'troubleshooting',
  },
  {
    question: 'Why are notifications not working?',
    answer: 'Check the following:\n1. Grant notification permission when prompted\n2. Go to Settings > Apps > HabitGuard > Notifications > Enable\n3. Check if "Do Not Disturb" mode is off\n4. Verify notification settings in the app\'s Profile tab\n5. Try logging out and back in',
    category: 'troubleshooting',
  },
  {
    question: 'How do streaks work?',
    answer: 'Streaks track consecutive days of meeting your goals. Each day you complete all your active goals, your streak increases by 1. If you miss a day, your streak resets to 0. Longer streaks show your commitment to building better habits!',
    category: 'goals',
  },
  {
    question: 'Can I delete my account and data?',
    answer: 'Yes. Go to Profile > Settings > Delete Account. This will permanently delete your account, usage history, goals, and all associated data from our servers. Local data on your device will also be cleared. This action cannot be undone.',
    category: 'getting-started',
  },
  {
    question: 'What apps are tracked?',
    answer: 'HabitGuard tracks all installed apps on your device that you actively use. This includes social media apps, games, productivity apps, and more. System apps and HabitGuard itself are excluded from tracking.',
    category: 'features',
  },
  {
    question: 'How accurate is the screen time tracking?',
    answer: 'HabitGuard uses Android\'s UsageStatsManager API, which provides highly accurate app usage data. However, there may be slight delays (1-2 minutes) in real-time updates due to system limitations. Daily totals are always accurate.',
    category: 'features',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes! You can export your weekly reports as PDF files. Go to Progress > Generate Report > Save as PDF. You can also share reports via email or other apps. Full data export (JSON format) will be available in a future update.',
    category: 'reports',
  },
  {
    question: 'The app says "Network request failed" when logging in',
    answer: 'This usually means:\n1. The backend server is not running\n2. You don\'t have internet connection\n3. Try using the demo account: demo@habitguard.com / demo123\n4. Check your WiFi/mobile data\n5. Contact support if the issue persists',
    category: 'troubleshooting',
  },
  {
    question: 'How do I change my goals?',
    answer: 'In the Goals tab, tap on any goal card to edit it. You can change the target value, toggle it on/off, or delete it entirely. Changes take effect immediately and will be reflected in your daily progress.',
    category: 'goals',
  },
  {
    question: 'What do the different goal types mean?',
    answer: 'Screen Time: Total time spent on your device\nApp Usage: Time spent on specific apps (e.g., social media)\nBreak Time: Number of breaks taken from screen\nProductive Time: Time spent on productive apps (work, learning)',
    category: 'goals',
  },
  {
    question: 'Does HabitGuard drain battery?',
    answer: 'No. HabitGuard uses minimal battery by leveraging Android\'s built-in usage tracking APIs. Background monitoring is efficient and only checks data periodically (every 1 minute). The battery impact is negligible (<1% per day).',
    category: 'troubleshooting',
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us via email at support@habitguard.com. We typically respond within 24-48 hours. For bug reports, please include your device model, Android version, and a description of the issue.',
    category: 'getting-started',
  },
];

export default function HelpFAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'getting-started', label: 'Getting Started', icon: 'rocket' },
    { id: 'features', label: 'Features', icon: 'star' },
    { id: 'permissions', label: 'Permissions', icon: 'shield-checkmark' },
    { id: 'goals', label: 'Goals', icon: 'trophy' },
    { id: 'reports', label: 'Reports', icon: 'document-text' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: 'build' },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={{flex: 1, backgroundColor: "#f0fdf4"}}>
      {/* Header */}
      <View style={{backgroundColor: "#16a34a", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16}}>
        <View style={{flexDirection: "row", alignItems: "center", marginBottom: 8}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginRight: 16}}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{fontSize: 22, fontWeight: "bold", color: "#ffffff"}}>Help & FAQ</Text>
        </View>
        <Text style={{fontSize: 14, color: "#dcfce7", marginLeft: 40}}>Find answers to common questions</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", maxHeight: 60}}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{
              flexDirection: "row", 
              alignItems: "center", 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 20, 
              marginRight: 8,
              backgroundColor: selectedCategory === category.id ? '#16a34a' : '#f3f4f6',
              height: 36
            }}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : '#4B5563'} 
            />
            <Text 
              style={{
                marginLeft: 6, 
                fontSize: 14,
                fontWeight: "500",
                color: selectedCategory === category.id ? '#ffffff' : '#475569'
              }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView style={{flex: 1, paddingHorizontal: 16, paddingVertical: 16}}>
        {filteredFAQs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleExpand(index)}
            style={{backgroundColor: "#ffffff", borderRadius: 16, marginBottom: 12, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}
          >
            <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1e293b", flex: 1, paddingRight: 16}}>
                {faq.question}
              </Text>
              <Ionicons 
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#16a34a" 
              />
            </View>
            
            {expandedIndex === index && (
              <View style={{paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9"}}>
                <Text style={{fontSize: 15, color: "#475569", lineHeight: 24, marginTop: 12}}>
                  {faq.answer}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {filteredFAQs.length === 0 && (
          <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 32, alignItems: "center"}}>
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text style={{color: "#64748b", fontSize: 16, marginTop: 16}}>
              No questions found in this category
            </Text>
          </View>
        )}

        {/* Still Need Help */}
        <View style={{backgroundColor: "#dcfce7", borderRadius: 16, padding: 24, marginTop: 16, marginBottom: 24, borderWidth: 1, borderColor: "#86efac"}}>
          <View style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
            <Ionicons name="help-circle" size={28} color="#16a34a" />
            <Text style={{fontSize: 18, fontWeight: "bold", color: "#166534", marginLeft: 8}}>
              Still Need Help?
            </Text>
          </View>
          <Text style={{fontSize: 15, color: "#475569", marginBottom: 16, lineHeight: 24}}>
            Can't find the answer you're looking for? Our support team is here to help!
          </Text>
          <TouchableOpacity 
            style={{backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center"}}
            onPress={() => router.push('/contact-us' as any)}
          >
            <Ionicons name="mail" size={20} color="white" />
            <Text style={{color: "#ffffff", fontWeight: "600", fontSize: 16, marginLeft: 8}}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={{backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: "#16a34a", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4}}>
          <Text style={{fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12}}>📚 Quick Links</Text>
          
          <TouchableOpacity 
            style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#f1f5f9"}}
            onPress={() => router.push('/privacy-policy' as any)}
          >
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Ionicons name="shield-checkmark" size={28} color="#16a34a" />
              <Text style={{fontSize: 16, color: "#475569", marginLeft: 12}}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#f1f5f9"}}
            onPress={() => {
              // Terms of service page not yet created
              Alert.alert('Coming Soon', 'Terms of Service page will be available soon');
            }}
          >
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Ionicons name="document-text" size={28} color="#16a34a" />
              <Text style={{fontSize: 16, color: "#475569", marginLeft: 12}}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18}}
            onPress={() => router.push('/contact-us' as any)}
          >
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Ionicons name="chatbubbles" size={28} color="#16a34a" />
              <Text style={{fontSize: 16, color: "#475569", marginLeft: 12}}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

