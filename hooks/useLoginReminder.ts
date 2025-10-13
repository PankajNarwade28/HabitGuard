import { authService } from '@/services/AuthService';
import { NotificationService } from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

const LOGIN_REMINDER_KEY = 'login_reminder_shown';
const LOGIN_REMINDER_DELAY = 60000; // 1 minute in milliseconds

export function useLoginReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownRef = useRef(false);

  useEffect(() => {
    checkAuthAndSetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const checkAuthAndSetTimer = async () => {
    try {
      // Check if user is authenticated
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      // If not authenticated, start the timer
      if (!authenticated) {
        // Check if we've already shown the reminder in this session
        const hasShown = await AsyncStorage.getItem(LOGIN_REMINDER_KEY);
        
        if (!hasShown && !hasShownRef.current) {
          console.log('⏱️ Starting 1-minute timer for login reminder...');
          
          timerRef.current = setTimeout(async () => {
            console.log('⏰ 1 minute elapsed - showing login reminder');
            setShowReminder(true);
            hasShownRef.current = true;
            // Mark as shown for this session
            await AsyncStorage.setItem(LOGIN_REMINDER_KEY, 'true');
            // Send push notification
            await NotificationService.sendLoginReminderNotification();
          }, LOGIN_REMINDER_DELAY);
        }
      } else {
        // User is authenticated, clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error checking auth for reminder:', error);
    }
  };

  const dismissReminder = () => {
    setShowReminder(false);
  };

  const resetReminder = async () => {
    // Reset the reminder (for use after logout or on new session)
    await AsyncStorage.removeItem(LOGIN_REMINDER_KEY);
    hasShownRef.current = false;
    setShowReminder(false);
  };

  return {
    showReminder,
    isAuthenticated,
    dismissReminder,
    resetReminder,
  };
}
