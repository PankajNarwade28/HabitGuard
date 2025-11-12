import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ML_ANALYSIS_CACHE_KEY = '@habitguard_ml_analysis';
const ML_ANALYSIS_TIMESTAMP_KEY = '@habitguard_ml_analysis_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface MLAnalysisResult {
  summary: {
    totalDays: number;
    avgDailyScreenTime: number;
    maxDailyScreenTime: number;
    minDailyScreenTime: number;
    avgAppsPerDay: number;
    totalScreenTimeHours: number;
  };
  patterns: {
    weekdayVsWeekend: {
      weekday: number;
      weekend: number;
    };
    dailyAverages: Record<string, number>;
    trends: {
      trend: 'increasing' | 'decreasing' | 'stable';
      recent_avg: number;
      overall_avg: number;
    };
    behaviorClassification: {
      category: 'light_user' | 'moderate_user' | 'heavy_user' | 'very_heavy_user' | 'excessive_user';
      severity: 'low' | 'medium' | 'high' | 'critical';
      action: string;
      message: string;
      avg_hours: number;
      max_hours: number;
      consistency_score: number;
      risk_level: 'low' | 'moderate' | 'high' | 'critical';
    };
  };
  predictions?: {
    model_performance: {
      mean_absolute_error_hours: number;
      r2_score: number;
      accuracy: string;
    };
    next_7_days: Array<{
      date: string;
      dayOfWeek: number;
      predictedScreenTimeHours: number;
      isWeekend: boolean;
    }>;
    weekly_prediction: number;
  };
  recommendations: string[];
  timestamp?: string;
}

export interface MLInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  category: string;
  timestamp: Date;
  data?: any;
}

class MLAnalysisServiceClass {
  private baseUrl: string;

  constructor() {
    // ML service runs on same server as main API, just different endpoint
    const baseApiUrl = API_CONFIG.BASE_URL.replace('/api', '');
    this.baseUrl = `${baseApiUrl}/ml`;
  }

  /**
   * Analyze usage patterns using ML
   */
  async analyzeUsagePatterns(usageData: any[]): Promise<MLAnalysisResult> {
    try {
      console.log('🤖 Performing ML analysis on usage data...');

      // Check cache first
      const cachedResult = await this.getCachedAnalysis();
      if (cachedResult) {
        console.log('✅ Using cached ML analysis');
        return cachedResult;
      }

      // Prepare CSV data for Python ML analyzer
      const csvData = this.convertToCSV(usageData);

      // Call ML API
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`);
      }

      const result: MLAnalysisResult = await response.json();
      
      // Cache the result
      await this.cacheAnalysis(result);

      console.log('✅ ML analysis completed successfully');
      return result;
    } catch (error) {
      console.error('❌ ML analysis failed:', error);
      // Return fallback analysis
      return this.performFallbackAnalysis(usageData);
    }
  }

  /**
   * Get real-time insights based on current usage
   */
  async getRealtimeInsights(currentUsage: any, historicalAnalysis?: MLAnalysisResult): Promise<MLInsight[]> {
    const insights: MLInsight[] = [];
    const now = new Date();

    try {
      // Get cached analysis if not provided
      const analysis = historicalAnalysis || await this.getCachedAnalysis();
      
      if (!analysis) {
        return [];
      }

      const behavior = analysis.patterns.behaviorClassification;
      const trends = analysis.patterns.trends;

      // Critical screen time alert
      if (behavior.severity === 'critical' || behavior.risk_level === 'critical') {
        insights.push({
          id: `critical-${Date.now()}`,
          type: 'critical',
          title: '🚨 Critical Screen Time Detected',
          message: behavior.message,
          actionRequired: true,
          category: 'health',
          timestamp: now,
          data: { behavior },
        });
      }

      // High usage alert
      if (behavior.severity === 'high' && behavior.avg_hours > 6) {
        insights.push({
          id: `high-usage-${Date.now()}`,
          type: 'warning',
          title: '⚠️ High Screen Time Alert',
          message: `Your average screen time is ${behavior.avg_hours.toFixed(1)}h/day. Consider setting stricter limits.`,
          actionRequired: true,
          category: 'usage',
          timestamp: now,
          data: { avg_hours: behavior.avg_hours },
        });
      }

      // Increasing trend alert
      if (trends.trend === 'increasing') {
        const increase = trends.recent_avg - trends.overall_avg;
        if (increase > 0.5) {
          insights.push({
            id: `trend-increasing-${Date.now()}`,
            type: 'warning',
            title: '📈 Usage Trending Upward',
            message: `Your screen time has increased by ${increase.toFixed(1)}h recently. Take action now to prevent escalation.`,
            actionRequired: true,
            category: 'trend',
            timestamp: now,
            data: { increase, trend: trends },
          });
        }
      }

      // Positive reinforcement for good behavior
      if (behavior.severity === 'low' && trends.trend === 'decreasing') {
        insights.push({
          id: `positive-${Date.now()}`,
          type: 'success',
          title: '🌟 Excellent Progress!',
          message: `Your screen time is decreasing and well-balanced at ${behavior.avg_hours.toFixed(1)}h/day. Keep it up!`,
          actionRequired: false,
          category: 'achievement',
          timestamp: now,
          data: { behavior },
        });
      }

      // Inconsistency warning
      if (behavior.consistency_score > 0.5) {
        insights.push({
          id: `inconsistent-${Date.now()}`,
          type: 'warning',
          title: '⚡ Inconsistent Usage Pattern',
          message: 'Your usage varies significantly day-to-day. This may indicate compulsive behavior. Try establishing a routine.',
          actionRequired: true,
          category: 'pattern',
          timestamp: now,
          data: { consistency: behavior.consistency_score },
        });
      }

      // Weekend vs weekday imbalance
      const weekdayVsWeekend = analysis.patterns.weekdayVsWeekend;
      const imbalance = Math.abs(weekdayVsWeekend.weekend - weekdayVsWeekend.weekday);
      
      if (imbalance > 2) {
        insights.push({
          id: `imbalance-${Date.now()}`,
          type: 'info',
          title: '📅 Weekend Usage Imbalance',
          message: `Your ${weekdayVsWeekend.weekend > weekdayVsWeekend.weekday ? 'weekend' : 'weekday'} usage is ${imbalance.toFixed(1)}h higher. Aim for more consistent habits.`,
          actionRequired: false,
          category: 'pattern',
          timestamp: now,
          data: { weekdayVsWeekend, imbalance },
        });
      }

      // Prediction-based insights
      if (analysis.predictions && analysis.predictions.next_7_days) {
        const nextWeekTotal = analysis.predictions.weekly_prediction;
        const currentWeekTotal = analysis.summary.avgDailyScreenTime * 7;
        
        if (nextWeekTotal > currentWeekTotal * 1.1) {
          insights.push({
            id: `prediction-increase-${Date.now()}`,
            type: 'warning',
            title: '🔮 Predicted Usage Increase',
            message: `ML models predict ${nextWeekTotal.toFixed(1)}h screen time next week (${((nextWeekTotal / currentWeekTotal - 1) * 100).toFixed(0)}% increase). Take preventive action now!`,
            actionRequired: true,
            category: 'prediction',
            timestamp: now,
            data: { prediction: analysis.predictions },
          });
        }
      }

      // Real-time current session alert
      if (currentUsage && currentUsage.todayScreenTime) {
        const todayHours = currentUsage.todayScreenTime / (60 * 60 * 1000);
        const avgHours = analysis.summary.avgDailyScreenTime;
        
        if (todayHours > avgHours * 1.5) {
          insights.push({
            id: `today-excessive-${Date.now()}`,
            type: 'critical',
            title: '🔴 Today\'s Usage Critical',
            message: `You've already used ${todayHours.toFixed(1)}h today, ${((todayHours / avgHours - 1) * 100).toFixed(0)}% above your average. Time for a digital detox!`,
            actionRequired: true,
            category: 'realtime',
            timestamp: now,
            data: { todayHours, avgHours },
          });
        }
      }

    } catch (error) {
      console.error('❌ Error generating ML insights:', error);
    }

    // Sort by priority (critical > warning > info > success)
    const priorityMap = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

    return insights;
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(analysis: MLAnalysisResult): Promise<string[]> {
    return analysis.recommendations || [];
  }

  /**
   * Check if user needs immediate intervention
   */
  needsIntervention(analysis: MLAnalysisResult): boolean {
    const behavior = analysis.patterns.behaviorClassification;
    return (
      behavior.severity === 'critical' ||
      behavior.risk_level === 'critical' ||
      behavior.action === 'urgent_intervention'
    );
  }

  /**
   * Convert usage data to CSV format for ML processing
   */
  private convertToCSV(usageData: any[]): string {
    const headers = 'date,hour,totalScreenTime,topAppPackage,topAppTime,appCount,dayOfWeek,isWeekend';
    const rows = usageData.map(record => {
      const date = new Date(record.date || record.timestamp);
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      return [
        date.toISOString().split('T')[0],
        date.getHours(),
        record.totalScreenTime || 0,
        record.topAppPackage || 'unknown',
        record.topAppTime || 0,
        record.appCount || 0,
        dayOfWeek,
        isWeekend,
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Fallback analysis when ML service is unavailable
   */
  private performFallbackAnalysis(usageData: any[]): MLAnalysisResult {
    console.log('⚙️ Performing fallback analysis...');

    if (!usageData || usageData.length === 0) {
      return this.getEmptyAnalysis();
    }

    const screenTimes = usageData.map(d => (d.totalScreenTime || 0) / (1000 * 60 * 60));
    const avgScreenTime = screenTimes.reduce((a, b) => a + b, 0) / screenTimes.length;
    const maxScreenTime = Math.max(...screenTimes);
    const minScreenTime = Math.min(...screenTimes);

    // Simple classification
    let category: any = 'moderate_user';
    let severity: any = 'low';
    let action = 'monitor';
    let message = 'Continue monitoring your usage.';

    if (avgScreenTime < 2) {
      category = 'light_user';
      severity = 'low';
      action = 'maintain';
      message = 'Great digital wellness!';
    } else if (avgScreenTime < 4) {
      category = 'moderate_user';
      severity = 'low';
      action = 'monitor';
      message = 'Good balance maintained.';
    } else if (avgScreenTime < 6) {
      category = 'heavy_user';
      severity = 'medium';
      action = 'reduce';
      message = 'Consider reducing screen time.';
    } else {
      category = 'excessive_user';
      severity = 'high';
      action = 'immediate_action';
      message = 'Take immediate action to reduce usage.';
    }

    return {
      summary: {
        totalDays: usageData.length,
        avgDailyScreenTime: avgScreenTime,
        maxDailyScreenTime: maxScreenTime,
        minDailyScreenTime: minScreenTime,
        avgAppsPerDay: usageData.reduce((a, b) => a + (b.appCount || 0), 0) / usageData.length,
        totalScreenTimeHours: screenTimes.reduce((a, b) => a + b, 0),
      },
      patterns: {
        weekdayVsWeekend: {
          weekday: avgScreenTime,
          weekend: avgScreenTime,
        },
        dailyAverages: {},
        trends: {
          trend: 'stable',
          recent_avg: avgScreenTime,
          overall_avg: avgScreenTime,
        },
        behaviorClassification: {
          category,
          severity,
          action,
          message,
          avg_hours: avgScreenTime,
          max_hours: maxScreenTime,
          consistency_score: 0.3,
          risk_level: severity === 'high' ? 'high' : 'moderate',
        },
      },
      recommendations: [
        'Track your usage daily',
        'Set app time limits',
        'Take regular breaks',
      ],
    };
  }

  private getEmptyAnalysis(): MLAnalysisResult {
    return {
      summary: {
        totalDays: 0,
        avgDailyScreenTime: 0,
        maxDailyScreenTime: 0,
        minDailyScreenTime: 0,
        avgAppsPerDay: 0,
        totalScreenTimeHours: 0,
      },
      patterns: {
        weekdayVsWeekend: { weekday: 0, weekend: 0 },
        dailyAverages: {},
        trends: { trend: 'stable', recent_avg: 0, overall_avg: 0 },
        behaviorClassification: {
          category: 'light_user',
          severity: 'low',
          action: 'monitor',
          message: 'Insufficient data',
          avg_hours: 0,
          max_hours: 0,
          consistency_score: 0,
          risk_level: 'low',
        },
      },
      recommendations: ['Start tracking your usage'],
    };
  }

  /**
   * Cache ML analysis result
   */
  private async cacheAnalysis(analysis: MLAnalysisResult): Promise<void> {
    try {
      await AsyncStorage.setItem(ML_ANALYSIS_CACHE_KEY, JSON.stringify(analysis));
      await AsyncStorage.setItem(ML_ANALYSIS_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('❌ Failed to cache ML analysis:', error);
    }
  }

  /**
   * Get cached ML analysis if still valid
   */
  private async getCachedAnalysis(): Promise<MLAnalysisResult | null> {
    try {
      const timestampStr = await AsyncStorage.getItem(ML_ANALYSIS_TIMESTAMP_KEY);
      if (!timestampStr) return null;

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        // Cache expired
        return null;
      }

      const cached = await AsyncStorage.getItem(ML_ANALYSIS_CACHE_KEY);
      if (!cached) return null;

      return JSON.parse(cached);
    } catch (error) {
      console.error('❌ Failed to get cached ML analysis:', error);
      return null;
    }
  }

  /**
   * Clear ML analysis cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ML_ANALYSIS_CACHE_KEY);
      await AsyncStorage.removeItem(ML_ANALYSIS_TIMESTAMP_KEY);
      console.log('✅ ML analysis cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear ML cache:', error);
    }
  }
}

export const mlAnalysisService = new MLAnalysisServiceClass();
