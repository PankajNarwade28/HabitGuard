import type { DailyGoal } from '@/services/DailyGoalsService';
import { dailyGoalsService } from '@/services/DailyGoalsService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { 
  Alert, 
  Animated,
  Dimensions,
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';

type GoalType = 'screen_time' | 'app_usage' | 'break_time' | 'productive_time';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_MARGIN = 16;

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

  // Refresh goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  useEffect(() => {
    loadGoals();
  }, []);

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
    if (!newGoalTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a goal title');
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

    await dailyGoalsService.addGoal({
      type: newGoalType,
      title: newGoalTitle,
      targetValue: targetValue,
      currentValue: 0,
      unit: config.unit,
      icon: config.icon,
      color: config.color,
      isActive: true,
    });

    setIsAddModalVisible(false);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalType('screen_time');
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
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={styles.headerAddButton}
        >
          <Ionicons name="add-circle" size={32} color="#ffffff" />
        </TouchableOpacity>
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
            </View>
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

              {/* Goal Title */}
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Limit Social Media"
                placeholderTextColor="#9CA3AF"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

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
  },
  goalProgressText: {
    fontSize: 14,
    color: '#6B7280',
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
});
