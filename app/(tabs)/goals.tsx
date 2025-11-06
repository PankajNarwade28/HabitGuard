import type { DailyGoal } from '@/services/DailyGoalsService';
import { dailyGoalsService } from '@/services/DailyGoalsService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type GoalType = 'screen_time' | 'app_usage' | 'break_time' | 'productive_time';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_MARGIN = 16;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configure notification categories
Notifications.setNotificationCategoryAsync('goal_notification', [
  {
    identifier: 'view',
    buttonTitle: 'View Goals',
    options: {
      opensAppToForeground: true,
    },
  },
  {
    identifier: 'dismiss',
    buttonTitle: 'Dismiss',
    options: {
      opensAppToForeground: false,
    },
  },
]);

Notifications.setNotificationCategoryAsync('daily_reminder', [
  {
    identifier: 'check',
    buttonTitle: 'Check Progress',
    options: {
      opensAppToForeground: true,
    },
  },
  {
    identifier: 'later',
    buttonTitle: 'Remind Later',
    options: {
      opensAppToForeground: false,
    },
  },
]);

export default function GoalsScreen() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [goalsProgress, setGoalsProgress] = useState({ 
    totalGoals: 0, 
    completedGoals: 0, 
    percentage: 0, 
    streakDays: 0 
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);
  const [newGoalType, setNewGoalType] = useState<GoalType>('screen_time');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUsageUpdate, setLastUsageUpdate] = useState(0);
  const [installedApps, setInstalledApps] = useState<Array<{ packageName: string; appName: string }>>([]);
  const [selectedAppPackage, setSelectedAppPackage] = useState('');
  const [showAppPicker, setShowAppPicker] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    requestPermissions();
    setupNotifications();
    setupNotificationChannels();
  }, []);

  const setupNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('goals', {
        name: 'Goal Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });
    }
  };

  const requestPermissions = async () => {
    const granted = await dailyGoalsService.requestNotificationPermissions();
    if (granted) {
      await dailyGoalsService.setupDailyReminder();
    }
  };

  const setupNotifications = () => {
    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to goals tab if not already there
    });

    return () => subscription.remove();
  };

  // Track app state changes to update usage
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App came to foreground, update usage data
        updateUsageData();
      }
    });

    return () => subscription.remove();
  }, []);

  // Auto-refresh usage data every 30 seconds when screen is active
  useEffect(() => {
    const interval = setInterval(() => {
      updateUsageData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateUsageData = async () => {
    try {
      // Get real app usage stats from UsageStatsService
      const { usageStatsService } = await import('@/services/UsageStatsService');
      
      // Get today's usage data
      const todayUsage = await usageStatsService.getDailyUsageStats();
      
      console.log('📊 Updating goals with usage data:', {
        totalScreenTime: Math.round(todayUsage.totalScreenTime / (1000 * 60)),
        appCount: todayUsage.appUsage.length,
      });

      // Transform data for goals service
      const appUsageData = todayUsage.appUsage.map(app => ({
        packageName: app.packageName,
        appName: app.appName,
        usageTime: app.totalTimeInForeground, // in milliseconds
      }));

      // Update goals with real usage data
      await dailyGoalsService.updateUsageData(appUsageData);
      
      // Reload goals to show updated progress
      const now = Date.now();
      if (now - lastUsageUpdate > 5000) { // Prevent too frequent updates
        setLastUsageUpdate(now);
        await loadGoals();
      }
    } catch (error) {
      console.error('Error updating usage data:', error);
    }
  };

  // Refresh goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoals();
      updateUsageData(); // Update usage data when screen comes into focus
    }, [])
  );

  useEffect(() => {
    loadGoals();
    updateUsageData(); // Update usage data on initial load
  }, []);

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    try {
      // Import the service
      const { usageStatsService } = await import('@/services/UsageStatsService');
      
      // Get today's usage to extract app list
      const todayUsage = await usageStatsService.getDailyUsageStats();
      
      // Extract unique apps and sort by name
      const apps = todayUsage.appUsage
        .filter(app => app.appName && app.packageName)
        .map(app => ({
          packageName: app.packageName,
          appName: app.appName,
        }))
        .sort((a, b) => a.appName.localeCompare(b.appName));
      
      setInstalledApps(apps);
      console.log('📱 Loaded apps:', apps.length);
    } catch (error) {
      console.error('Error loading installed apps:', error);
      // Set some common apps as fallback
      setInstalledApps([
        { packageName: 'com.instagram.android', appName: 'Instagram' },
        { packageName: 'com.facebook.katana', appName: 'Facebook' },
        { packageName: 'com.whatsapp', appName: 'WhatsApp' },
        { packageName: 'com.youtube', appName: 'YouTube' },
        { packageName: 'com.twitter.android', appName: 'Twitter' },
      ]);
    }
  };

  const loadGoals = async () => {
    try {
      setRefreshing(true);
      const loadedGoals = await dailyGoalsService.getGoals();
      setGoals(loadedGoals);
      const progress = await dailyGoalsService.getGoalsProgress();
      setGoalsProgress(progress);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim() && newGoalType !== 'app_usage') {
      Alert.alert('Missing Information', 'Please enter a goal title');
      return;
    }

    if (newGoalType === 'app_usage' && !selectedAppPackage) {
      Alert.alert('Missing Information', 'Please select an app');
      return;
    }

    if (!newGoalTarget.trim()) {
      Alert.alert('Missing Information', 'Please enter a target value');
      return;
    }

    const targetValue = parseFloat(newGoalTarget);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number');
      return;
    }

    const goalConfig: Record<GoalType, { icon: string; color: string; unit: string }> = {
      screen_time: { icon: 'phone-portrait', color: '#6366f1', unit: 'minutes' },
      app_usage: { icon: 'apps', color: '#F59E0B', unit: 'minutes' },
      break_time: { icon: 'cafe', color: '#10B981', unit: 'breaks' },
      productive_time: { icon: 'trending-up', color: '#8B5CF6', unit: 'minutes' },
    };

    const config = goalConfig[newGoalType];
    
    // Get app name if app_usage type
    let goalTitle = newGoalTitle;
    if (newGoalType === 'app_usage') {
      const selectedApp = installedApps.find(app => app.packageName === selectedAppPackage);
      goalTitle = selectedApp ? `${selectedApp.appName} Limit` : newGoalTitle;
    }

    await dailyGoalsService.addGoal({
      type: newGoalType,
      title: goalTitle,
      targetValue: targetValue,
      currentValue: 0,
      unit: config.unit,
      icon: config.icon,
      color: config.color,
      isActive: true,
      appPackageName: newGoalType === 'app_usage' ? selectedAppPackage : undefined,
      notifyOnComplete: true,
      notifyOnExceed: true,
    });

    setIsAddModalVisible(false);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalType('screen_time');
    setSelectedAppPackage('');
    loadGoals();
    
    Alert.alert('Success', 'Goal added successfully! 🎯');
  };

  const handleEditGoal = async () => {
    if (!selectedGoal || !newGoalTarget.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid target value');
      return;
    }

    const targetValue = parseFloat(newGoalTarget);
    if (isNaN(targetValue) || targetValue <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number');
      return;
    }

    await dailyGoalsService.updateGoal(selectedGoal.id, {
      targetValue: targetValue,
    });

    setIsEditModalVisible(false);
    setSelectedGoal(null);
    setNewGoalTarget('');
    loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dailyGoalsService.deleteGoal(goalId);
            loadGoals();
          },
        },
      ]
    );
  };

  const handleToggleGoal = async (goalId: string) => {
    await dailyGoalsService.toggleGoal(goalId);
    loadGoals();
  };

  const handleRecordBreak = async () => {
    await dailyGoalsService.recordBreak();
    Alert.alert('✅ Break Recorded', 'Great! Taking breaks is important for productivity.');
    loadGoals();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await updateUsageData();
    await loadGoals();
    setRefreshing(false);
  };

  const openEditModal = (goal: DailyGoal) => {
    setSelectedGoal(goal);
    setNewGoalTarget(goal.targetValue.toString());
    setIsEditModalVisible(true);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const goalTypes: Array<{ type: GoalType; label: string; icon: string; description: string }> = [
    { 
      type: 'screen_time', 
      label: 'Screen Time', 
      icon: 'phone-portrait',
      description: 'Daily device usage limit'
    },
    { 
      type: 'app_usage', 
      label: 'App Limit', 
      icon: 'apps',
      description: 'Specific app time limit'
    },
    { 
      type: 'break_time', 
      label: 'Take Breaks', 
      icon: 'cafe',
      description: 'Number of breaks'
    },
    { 
      type: 'productive_time', 
      label: 'Productive Time', 
      icon: 'trending-up',
      description: 'Focus on work/study'
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Daily Goals</Text>
          <Text style={styles.headerSubtitle}>Build better digital habits</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.headerRefreshButton}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color="#ffffff" 
              style={refreshing ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsAddModalVisible(true)}
            style={styles.headerAddButton}
          >
            <Ionicons name="add-circle" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Summary Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSubtitle}>Keep up the great work!</Text>
            </View>
            <View style={styles.goalsBadge}>
              <Text style={styles.goalsBadgeText}>
                {goalsProgress.completedGoals}/{goalsProgress.totalGoals}
              </Text>
              <Text style={styles.goalsBadgeLabel}>Goals</Text>
            </View>
          </View>

          {/* Circular Progress */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>
                {goalsProgress.percentage.toFixed(0)}%
              </Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{goalsProgress.completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text style={styles.statValue}>{goalsProgress.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="checkbox" size={24} color="#6366f1" />
              <Text style={styles.statValue}>{goalsProgress.totalGoals}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="flag-outline" size={64} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Goals Yet</Text>
              <Text style={styles.emptyDescription}>
                Start your journey by setting your first goal.{'\n'}
                Tap the + button to get started!
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                style={styles.emptyButton}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.emptyButtonText}>Add Your First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((goal, index) => {
              const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
              const isCompleted = goal.currentValue >= goal.targetValue;

              return (
                <Animated.View
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    !goal.isActive && styles.goalCardInactive,
                  ]}
                >
                  {/* Goal Header */}
                  <View style={styles.goalCardHeader}>
                    <View style={styles.goalIconContainer}>
                      <View style={[styles.goalIconBg, { backgroundColor: `${goal.color}15` }]}>
                        <Ionicons name={goal.icon as any} size={28} color={goal.color} />
                      </View>
                    </View>
                    
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle} numberOfLines={1}>
                        {goal.title}
                      </Text>
                      <View style={styles.goalProgressInfo}>
                        <Text style={styles.goalProgressText}>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </Text>
                        {goal.type === 'app_usage' && goal.appPackageName && (
                          <View style={styles.appBadge}>
                            <Ionicons name="apps" size={10} color="#F59E0B" />
                            <Text style={styles.appBadgeText}>App Limit</Text>
                          </View>
                        )}
                        {isCompleted && (
                          <View style={styles.completedTag}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={styles.completedTagText}>Done</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.goalActions}>
                      <TouchableOpacity
                        onPress={() => handleToggleGoal(goal.id)}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={goal.isActive ? 'pause' : 'play'}
                          size={20}
                          color={goal.isActive ? '#6366f1' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { 
                          width: `${progress}%`, 
                          backgroundColor: goal.color 
                        },
                      ]}
                    >
                      {progress > 10 && (
                        <Text style={styles.progressBarText}>{progress.toFixed(0)}%</Text>
                      )}
                    </View>
                  </View>

                  {/* Goal Footer */}
                  <View style={styles.goalCardFooter}>
                    <TouchableOpacity
                      onPress={() => openEditModal(goal)}
                      style={styles.footerButton}
                    >
                      <Ionicons name="create-outline" size={18} color="#6366f1" />
                      <Text style={styles.footerButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.footerDivider} />
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id)}
                      style={styles.footerButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      <Text style={[styles.footerButtonText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* Tips Section */}
        {goals.length > 0 && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={22} color="#F59E0B" />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.tipText}>Set achievable goals for better consistency</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.tipText}>Review your progress weekly and adjust targets</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.tipText}>Pause goals when you need a break - consistency matters</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="notifications" size={18} color="#F59E0B" />
                <Text style={styles.tipText}>You'll receive notifications when goals are reached or exceeded</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {goals.some(g => g.type === 'break_time') && (
          <View style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <TouchableOpacity
              onPress={handleRecordBreak}
              style={styles.quickActionButton}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="cafe" size={24} color="#10B981" />
              </View>
              <View style={styles.quickActionInfo}>
                <Text style={styles.quickActionLabel}>Record a Break</Text>
                <Text style={styles.quickActionDescription}>Track when you take breaks</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create New Goal</Text>
                <Text style={styles.modalSubtitle}>Set a target to track your progress</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsAddModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Goal Type Selection */}
              <Text style={styles.inputLabel}>Select Goal Type</Text>
              <View style={styles.goalTypeGrid}>
                {goalTypes.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    onPress={() => setNewGoalType(type.type)}
                    style={[
                      styles.goalTypeCard,
                      newGoalType === type.type && styles.goalTypeCardActive,
                    ]}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={32}
                      color={newGoalType === type.type ? '#6366f1' : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.goalTypeLabel,
                        newGoalType === type.type && styles.goalTypeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.goalTypeDescription}>
                      {type.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Goal Title / App Selection */}
              {newGoalType === 'app_usage' ? (
                <>
                  <Text style={styles.inputLabel}>Select App to Limit</Text>
                  <TouchableOpacity
                    onPress={() => setShowAppPicker(!showAppPicker)}
                    style={[styles.input, styles.appPickerButton]}
                  >
                    <Text style={selectedAppPackage ? styles.selectedAppText : styles.placeholderText}>
                      {selectedAppPackage 
                        ? installedApps.find(app => app.packageName === selectedAppPackage)?.appName 
                        : 'Select an app'}
                    </Text>
                    <Ionicons 
                      name={showAppPicker ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                  
                  {/* App List Dropdown */}
                  {showAppPicker && (
                    <ScrollView style={styles.appPickerList} nestedScrollEnabled>
                      {installedApps.length === 0 ? (
                        <View style={styles.appPickerEmpty}>
                          <Text style={styles.appPickerEmptyText}>No apps found. Loading...</Text>
                        </View>
                      ) : (
                        installedApps.map((app) => (
                          <TouchableOpacity
                            key={app.packageName}
                            onPress={() => {
                              setSelectedAppPackage(app.packageName);
                              setNewGoalTitle(`${app.appName} Limit`);
                              setShowAppPicker(false);
                            }}
                            style={[
                              styles.appPickerItem,
                              selectedAppPackage === app.packageName && styles.appPickerItemSelected,
                            ]}
                          >
                            <View style={styles.appPickerIcon}>
                              <Ionicons name="apps" size={24} color="#6366f1" />
                            </View>
                            <Text style={styles.appPickerItemText}>{app.appName}</Text>
                            {selectedAppPackage === app.packageName && (
                              <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Goal Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Limit Social Media"
                    placeholderTextColor="#9CA3AF"
                    value={newGoalTitle}
                    onChangeText={setNewGoalTitle}
                  />
                </>
              )}

              {/* Target Value */}
              <Text style={styles.inputLabel}>
                Target Value ({goalTypes.find(t => t.type === newGoalType)?.label})
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 60 for 60 minutes"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAddGoal}
                style={styles.submitButton}
              >
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                <Text style={styles.submitButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Goal</Text>
                <Text style={styles.modalSubtitle}>Update your target value</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.editGoalInfo}>
                  <View style={[styles.goalIconBg, { backgroundColor: `${selectedGoal.color}15` }]}>
                    <Ionicons name={selectedGoal.icon as any} size={32} color={selectedGoal.color} />
                  </View>
                  <Text style={styles.editGoalTitle}>{selectedGoal.title}</Text>
                </View>

                <Text style={styles.inputLabel}>
                  New Target Value ({selectedGoal.unit})
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Current: ${selectedGoal.targetValue}`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                />

                <TouchableOpacity
                  onPress={handleEditGoal}
                  style={styles.submitButton}
                >
                  <Ionicons name="save" size={24} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRefreshButton: {
    padding: 4,
  },
  headerAddButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalsBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  goalsBadgeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  goalsBadgeLabel: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 2,
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#6366f1',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  goalsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  goalCardInactive: {
    opacity: 0.6,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  goalIconContainer: {
    marginRight: 12,
  },
  goalIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  goalProgressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 3,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  goalActions: {
    padding: 4,
  },
  actionButton: {
    padding: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  progressBarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  goalCardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  footerDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    marginLeft: 8,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  modalCloseButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  goalTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  goalTypeCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  goalTypeCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366f1',
  },
  goalTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  goalTypeLabelActive: {
    color: '#6366f1',
  },
  goalTypeDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  appPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedAppText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  appPickerList: {
    maxHeight: 300,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  appPickerEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  appPickerEmptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  appPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appPickerItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  appPickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appPickerItemText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editGoalInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  editGoalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  quickActionsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
});
