/**
 * Expo App Configuration
 * 
 * This file replaces app.json to allow dynamic configuration
 * based on environment variables.
 * 
 * To change the API URL, edit the .env file in the root directory.
 */

// Load environment variables from .env file
require('dotenv').config();

// Read API URL from .env file - REQUIRED, no fallback
const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('❌ ERROR: API_URL not found in .env file!');
  console.error('📝 Please create/update .env file with:');
  console.error('   API_URL=http://YOUR_IP_ADDRESS:3000/api');
  process.exit(1);
}

console.log('📡 API URL configured as:', API_URL);

module.exports = {
  expo: {
    name: 'HabitGuard - Digital Wellbeing',
    slug: 'habitguard-wellbeing',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'habitguard',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    description: 'Monitor your screen time, optimize sleep schedules, and maintain digital wellness with intelligent insights and personalized recommendations.',
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.habitguard.wellbeing',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // Expose API URL to the app through expo-constants
      apiUrl: API_URL,
      router: {},
      eas: {
        projectId: '2c76b7e6-1198-49a4-a6c2-0ec089cb5977',
      },
    },
  },
};
