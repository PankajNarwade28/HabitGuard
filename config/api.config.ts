/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change the API_URL in app.config.js to update across the entire app.
 */

import Constants from 'expo-constants';

// Get API URL from app config - REQUIRED, no fallback
const getBaseApiUrl = (): string => {
  // Get from expo config
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  
  if (!configUrl) {
    console.error('❌ CRITICAL ERROR: API_URL not configured!');
    console.error('📝 Please update .env file with:');
    console.error('   API_URL=http://YOUR_IP_ADDRESS:3000/api');
    console.error('🔄 Then restart Expo with: npx expo start --clear');
    throw new Error('API_URL not configured in .env file');
  }
  
  return configUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseApiUrl(),
  TIMEOUT: 10000, // 10 seconds
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/auth/signup',
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
    },
    REPORTS: {
      GENERATE: '/reports/generate',
      LIST: '/reports',
      LATEST: '/reports/latest',
      GET: (id: number) => `/reports/${id}`,
      DELETE: (id: number) => `/reports/${id}`,
    },
  },
};

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Log current API configuration (for debugging)
 */
export const logApiConfig = () => {
  console.log('📡 API Configuration:');
  console.log('   Base URL:', API_CONFIG.BASE_URL);
  console.log('   Timeout:', API_CONFIG.TIMEOUT, 'ms');
};
