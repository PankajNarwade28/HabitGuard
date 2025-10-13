import { authService } from '@/services/AuthService';
import { NotificationService } from '@/services/NotificationService';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserData {
  userId: number;
  name: string;
  email: string;
  age?: number;
  education?: string;
  mobile_no?: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = await authService.getUserData();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Send login success notification
        await NotificationService.sendLoginSuccessNotification(response.data.name);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await authService.signup(userData);
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Send signup success notification
        await NotificationService.sendSignupSuccessNotification(response.data.name);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Send logout notification
      await NotificationService.sendLogoutNotification();
      
      // Force a hard reset by reloading the app state
      // This will trigger _layout.tsx to re-check auth and show login screen
      if (router) {
        console.log('🔄 Redirecting to login screen...');
        router.replace('/login' as any);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authService.getProfile();
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        // Update local storage
        await authService.updateUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If token expired, logout
      if (error instanceof Error && error.message.includes('token')) {
        await logout();
      }
    }
  };

  const updateUserData = (data: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // Save to local storage
      authService.updateUserData(updatedUser);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshUserData,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
