import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './AuthService';

const API_BASE_URL = 'http://192.168.0.101:3000/api';

export interface WeeklyReportData {
  reportId?: number;
  reportTitle: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalScreenTime: number;
    dailyAverage: number;
    totalUnlocks: number;
    activeDays: number;
  };
  mostUsedApps: Array<{
    appName: string;
    packageName: string;
    totalTime: number;
    daysUsed: number;
  }>;
  streakData: {
    totalDays: number;
    goalsMet: number;
    avgScreenTime: number;
    successRate: number;
    currentStreak?: number;
    longestStreak?: number;
  };
  goalAchievement: Array<{
    type: string;
    target: number;
    current: number;
    status: string;
    progress: number;
  }>;
  productivityScore: number;
  insights: string;
  generatedAt?: string;
}

class WeeklyReportService {
  /**
   * Generate weekly report
   */
  async generateReport(weekStartDate?: string, weekEndDate?: string): Promise<WeeklyReportData | null> {
    try {
      console.log('📊 Generating weekly report...');

      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const body: any = {};
      if (weekStartDate && weekEndDate) {
        body.weekStartDate = weekStartDate;
        body.weekEndDate = weekEndDate;
      }

      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch((e) => {
        throw new Error('Invalid JSON response from reports/generate: ' + String(e));
      });

      if (result && result.success) {
        console.log('✅ Weekly report generated successfully');

        // Cache latest report
        await AsyncStorage.setItem('latest_weekly_report', JSON.stringify(result.data));

        return result.data;
      }

      const msg = result && result.message ? String(result.message) : 'Failed to generate report';
      throw new Error(msg);
    } catch (rawError) {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));

      // Sanitize stack for logs
      const sanitizedStack = (error.stack || '').split('\n').slice(0, 5).join('\n');
      console.error('❌ Generate report error:', error.message);
      console.debug('❗ Sanitized stack:', sanitizedStack);

      // Return null to indicate failure (caller should handle null)
      return null;
    }
  }

  /**
   * Get all weekly reports
   */
  async getAllReports(limit: number = 10): Promise<WeeklyReportData[]> {
    try {
      console.log('📋 Fetching all weekly reports...');

      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/reports?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json().catch((e) => {
        throw new Error('Invalid JSON response from reports endpoint: ' + String(e));
      });

      if (result && result.success) {
        return result.data;
      }

      const msg = result && result.message ? String(result.message) : 'Failed to fetch reports';
      throw new Error(msg);
    } catch (rawError) {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      console.error('❌ Get reports error:', error.message);
      console.debug('❗ Stack (truncated):', (error.stack || '').split('\n').slice(0, 5).join('\n'));
      return [];
    }
  }

  /**
   * Get latest weekly report
   */
  async getLatestReport(): Promise<WeeklyReportData | null> {
    try {
      console.log('📊 Fetching latest weekly report...');

      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/reports/latest`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json().catch((e) => {
        throw new Error('Invalid JSON response from reports/latest: ' + String(e));
      });

      if (result && result.success && result.data) {
        await AsyncStorage.setItem('latest_weekly_report', JSON.stringify(result.data));
        return result.data;
      }

      const cached = await AsyncStorage.getItem('latest_weekly_report');
      if (cached) {
        console.log('📱 Using cached report');
        return JSON.parse(cached);
      }

      return null;
    } catch (rawError) {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      console.error('❌ Get latest report error:', error.message);
      console.debug('❗ Stack (truncated):', (error.stack || '').split('\n').slice(0, 5).join('\n'));

      try {
        const cached = await AsyncStorage.getItem('latest_weekly_report');
        if (cached) {
          console.log('📱 Returning cached report due to error');
          return JSON.parse(cached);
        }
      } catch (e) {
        console.debug('Error reading cached report:', e);
      }

      return null;
    }
  }

  /**
   * Get specific report by ID
   */
  async getReportById(reportId: number): Promise<WeeklyReportData | null> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json().catch((e) => {
        throw new Error('Invalid JSON response from reports/:id: ' + String(e));
      });

      if (result && result.success) {
        return result.data;
      }

      return null;
    } catch (rawError) {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      console.error('❌ Get report by ID error:', error.message);
      console.debug('❗ Stack (truncated):', (error.stack || '').split('\n').slice(0, 5).join('\n'));
      return null;
    }
  }

  /**
   * Delete weekly report
   */
  async deleteReport(reportId: number): Promise<boolean> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json().catch((e) => {
        throw new Error('Invalid JSON response from reports DELETE: ' + String(e));
      });

      return result && result.success === true;
    } catch (rawError) {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      console.error('❌ Delete report error:', error.message);
      console.debug('❗ Stack (truncated):', (error.stack || '').split('\n').slice(0, 5).join('\n'));
      return false;
    }
  }

  /**
   * Get cached latest report (offline support)
   */
  async getCachedLatestReport(): Promise<WeeklyReportData | null> {
    try {
      const cached = await AsyncStorage.getItem('latest_weekly_report');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached report:', error);
      return null;
    }
  }

  /**
   * Format screen time (minutes to hours/minutes string)
   */
  formatScreenTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Get productivity score color
   */
  getProductivityScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * Get productivity score label
   */
  getProductivityScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Format date range
   */
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${startFormatted} - ${endFormatted}`;
  }

  /**
   * Calculate week start and end dates for current week
   */
  getCurrentWeekDates(): { startDate: string; endDate: string } {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate start of week (Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);

    // Calculate end of week (Saturday)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Calculate last week dates
   */
  getLastWeekDates(): { startDate: string; endDate: string } {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Last week's Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - 7);

    // Last week's Saturday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - dayOfWeek - 1);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Generate report for last 7 days
   */
  async generateLast7DaysReport(): Promise<WeeklyReportData | null> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    return await this.generateReport(weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
  }

  /**
   * Generate report for current week
   */
  async generateCurrentWeekReport(): Promise<WeeklyReportData | null> {
    const { startDate, endDate } = this.getCurrentWeekDates();
    return await this.generateReport(startDate, endDate);
  }

  /**
   * Generate report for last week
   */
  async generateLastWeekReport(): Promise<WeeklyReportData | null> {
    const { startDate, endDate } = this.getLastWeekDates();
    return await this.generateReport(startDate, endDate);
  }
}

export const weeklyReportService = new WeeklyReportService();

