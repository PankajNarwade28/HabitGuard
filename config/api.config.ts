/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change the API_URL in app.config.js to update across the entire app.
 */

import Constants from 'expo-constants';

// Get API URL from app config, fallback to hardcoded value
const getBaseApiUrl = (): string => {
  // Try to get from expo config first
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  
  if (configUrl) {
    return configUrl;
  }
  
  // Fallback to default
  return 'http://10.187.209.177:3000/api';
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
