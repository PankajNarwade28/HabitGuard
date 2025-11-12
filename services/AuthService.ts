import { API_CONFIG, logApiConfig } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Log API configuration on service initialization
logApiConfig();

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

interface SignupData {
  name: string;
  age?: number;
  education?: string;
  email: string;
  mobile_no?: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    name: string;
    email: string;
    age?: number;
    education?: string;
    mobile_no?: string;
    token: string;
  };
}

class AuthService {
  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server not responding');
      }
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting signup to:', `${API_CONFIG.BASE_URL}/auth/signup`);
      console.log('⏱️  Timeout: 10 seconds');
      
      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 Signup response status:', response.status);

      const data = await response.json();
      console.log('📦 Signup response data:', data);

      if (data.success && data.data?.token) {
        // Store token and user data
        await this.saveAuthData(data.data.token, data.data);
      }

      return data;
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('🔍 API URL:', API_CONFIG.BASE_URL);
      console.error('💡 Make sure backend server is running at:', API_CONFIG.BASE_URL.replace('/api', ''));
      throw new Error('Failed to connect to server. Please ensure:\n1. Backend server is running (npm start in backend folder)\n2. You are using the correct API URL\n3. Check network connection');
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting login to:', `${API_CONFIG.BASE_URL}/auth/login`);
      console.log('⏱️  Timeout: 10 seconds');
      console.log('📧 Email:', credentials.email);
      
      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Login response status:', response.status);

      const data = await response.json();
      console.log('📦 Login response:', data.success ? 'Success' : 'Failed');

      if (data.success && data.data?.token) {
        // Store token and user data
        await this.saveAuthData(data.data.token, data.data);
      }

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('🔍 API URL:', API_CONFIG.BASE_URL);
      console.error('💡 Server should be at:', API_CONFIG.BASE_URL.replace('/api', ''));
      
      let errorMessage = 'Failed to connect to server.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = `Server not responding. Please check:\n1. Backend server is running\n2. IP address matches .env file\n3. Both devices on same WiFi`;
        } else if (error.message.includes('Network request failed')) {
          errorMessage = `Network error. Please check:\n1. Backend server is running on port 3000\n2. IP address in .env file is correct\n3. Windows Firewall allows port 3000`;
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<SignupData>): Promise<AuthResponse> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Updating profile:', profileData);

      const response = await this.fetchWithTimeout(`${API_CONFIG.BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('📡 Update profile response status:', response.status);

      const data = await response.json();
      console.log('📦 Update profile response:', data.success ? 'Success' : 'Failed');

      if (data.success && data.data) {
        // Update stored user data
        await this.updateUserData(data.data);
      }

      return data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  /**
   * Update stored user data
   */
  async updateUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Update user data error:', error);
    }
  }

  /**
   * Validate token by making a profile request
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save authentication data
   */
  private async saveAuthData(token: string, userData: any): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, JSON.stringify(userData)],
      ]);
    } catch (error) {
      console.error('Save auth data error:', error);
    }
  }
}

export const authService = new AuthService();
