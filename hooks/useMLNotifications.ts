import { mlAnalysisService, MLInsight } from '@/services/MLAnalysisService';
import { usageStatsService } from '@/services/UsageStatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';

const LAST_NOTIFICATION_KEY = '@habitguard_last_ml_notification';
const NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30 minutes between notifications
const ANALYSIS_INTERVAL = 60 * 60 * 1000; // Run analysis every hour
const DISMISSED_INSIGHTS_KEY = '@habitguard_dismissed_insights';

export function useMLNotifications(enabled: boolean = true) {
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    // Initial analysis
    runMLAnalysis();

    // Set up periodic analysis
    intervalRef.current = setInterval(() => {
      runMLAnalysis();
    }, ANALYSIS_INTERVAL);

    // Set up notification listeners
    setupNotificationListeners();

    return () => {
      cleanup();
    };
  }, [enabled]);

  const setupNotificationListeners = () => {
    // Listener for when notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as any;
      if (data?.type && typeof data.type === 'string' && data.type.startsWith('ml_')) {
        console.log('🤖 ML notification received:', data);
      }
    });

    // Listener for when user interacts with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      
      if (data?.type && typeof data.type === 'string' && data.type.startsWith('ml_')) {
        handleNotificationResponse(response.actionIdentifier, data);
      }
    });
  };

  const runMLAnalysis = async () => {
    try {
      setLoading(true);
      console.log('🤖 Running ML analysis for real-time insights...');

      // Get recent usage data (last 30 days)
      const usageData = await usageStatsService.getMLDataForAnalysis(30);

      if (!usageData || usageData.length === 0) {
        console.log('⚠️ No usage data available for ML analysis');
        setLoading(false);
        return;
      }

      // Perform ML analysis
      const analysis = await mlAnalysisService.analyzeUsagePatterns(usageData);

      // Get current usage for real-time context
      const todayStats = await usageStatsService.getDailyUsageStats();
      
      const currentUsage = {
        todayScreenTime: todayStats.totalScreenTime || 0,
        appCount: todayStats.appUsage?.length || 0,
      };

      // Generate real-time insights
      const newInsights = await mlAnalysisService.getRealtimeInsights(currentUsage, analysis);

      // Filter out dismissed insights
      const dismissedIds = await getDismissedInsights();
      const filteredInsights = newInsights.filter(
        insight => !dismissedIds.includes(insight.id)
      );

      setInsights(filteredInsights);

      // Send notifications for critical/high priority insights
      await sendPriorityNotifications(filteredInsights);

      console.log(`✅ ML analysis complete. ${filteredInsights.length} insights generated.`);
    } catch (error) {
      console.error('❌ ML analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPriorityNotifications = async (insights: MLInsight[]) => {
    try {
      // Check if we recently sent a notification (cooldown period)
      const lastNotificationTime = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
      if (lastNotificationTime) {
        const timeSinceLastNotification = Date.now() - parseInt(lastNotificationTime, 10);
        if (timeSinceLastNotification < NOTIFICATION_COOLDOWN) {
          console.log('⏳ Notification cooldown active. Skipping notification.');
          return;
        }
      }

      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted');
        return;
      }

      // Get the highest priority insight that needs action
      const criticalInsight = insights.find(i => i.type === 'critical' && i.actionRequired);
      const warningInsight = insights.find(i => i.type === 'warning' && i.actionRequired);
      const insightToNotify = criticalInsight || warningInsight;

      if (!insightToNotify) {
        return;
      }

      // Send notification with action buttons
      await Notifications.scheduleNotificationAsync({
        content: {
          title: insightToNotify.title,
          body: insightToNotify.message,
          data: {
            type: `ml_${insightToNotify.category}`,
            insightId: insightToNotify.id,
            insight: insightToNotify,
          },
          categoryIdentifier: 'ml-insight',
          sound: true,
          priority: insightToNotify.type === 'critical' 
            ? Notifications.AndroidNotificationPriority.MAX 
            : Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      // Set notification action categories
      await Notifications.setNotificationCategoryAsync('ml-insight', [
        {
          identifier: 'view',
          buttonTitle: '👁️ View Details',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: '✖️ Dismiss',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'take-action',
          buttonTitle: '⚡ Take Action',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      // Update last notification timestamp
      await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());

      console.log(`🔔 ML notification sent: ${insightToNotify.title}`);
    } catch (error) {
      console.error('❌ Failed to send ML notification:', error);
    }
  };

  const handleNotificationResponse = async (actionId: string, data: any) => {
    console.log(`📲 User action: ${actionId}`, data);

    const insightId = data.insightId;

    switch (actionId) {
      case 'view':
        // Navigate to ML insights screen
        console.log('👁️ User wants to view ML insights');
        // Navigation will be handled by the component using this hook
        break;

      case 'dismiss':
        // Dismiss this specific insight
        if (insightId) {
          await dismissInsight(insightId);
          console.log('✖️ Insight dismissed:', insightId);
        }
        break;

      case 'take-action':
        // Navigate to action screen (goals, limits, etc.)
        console.log('⚡ User wants to take action');
        // Navigation will be handled by the component using this hook
        break;

      default:
        // Default action (tap on notification)
        console.log('📱 Notification tapped');
        break;
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      // Remove from current insights
      setInsights(prev => prev.filter(i => i.id !== insightId));

      // Add to dismissed list
      const dismissedIds = await getDismissedInsights();
      dismissedIds.push(insightId);
      await AsyncStorage.setItem(DISMISSED_INSIGHTS_KEY, JSON.stringify(dismissedIds));

      console.log(`✅ Insight ${insightId} dismissed`);
    } catch (error) {
      console.error('❌ Failed to dismiss insight:', error);
    }
  };

  const getDismissedInsights = async (): Promise<string[]> => {
    try {
      const dismissed = await AsyncStorage.getItem(DISMISSED_INSIGHTS_KEY);
      return dismissed ? JSON.parse(dismissed) : [];
    } catch (error) {
      console.error('❌ Failed to get dismissed insights:', error);
      return [];
    }
  };

  const clearDismissedInsights = async () => {
    try {
      await AsyncStorage.removeItem(DISMISSED_INSIGHTS_KEY);
      console.log('✅ Dismissed insights cleared');
      
      // Re-run analysis to show all insights
      await runMLAnalysis();
    } catch (error) {
      console.error('❌ Failed to clear dismissed insights:', error);
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (notificationListener.current) {
      notificationListener.current.remove();
    }

    if (responseListener.current) {
      responseListener.current.remove();
    }
  };

  return {
    insights,
    loading,
    refreshInsights: runMLAnalysis,
    dismissInsight,
    clearDismissedInsights,
  };
}
