import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import { Alert, Linking } from 'react-native';
import { authService } from './AuthService';

// Conditional imports for native modules
let Print: any = null;
let Sharing: any = null;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('⚠️ expo-print or expo-sharing not available. PDF features will be disabled. Please rebuild the app with: npx expo run:android');
}

// API Configuration - now centralized in config/api.config.ts
// To change the API URL, update it in app.config.js
const API_BASE_URL = API_CONFIG.BASE_URL;

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

  /**
   * Generate HTML content for PDF
   */
  private generateReportHTML(report: WeeklyReportData): string {
    const dateRange = this.formatDateRange(report.weekStartDate, report.weekEndDate);
    const productivityColor = this.getProductivityScoreColor(report.productivityScore);
    const productivityLabel = this.getProductivityScoreLabel(report.productivityScore);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HabitGuard Weekly Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      padding: 20px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }
    .header h1 {
      font-size: 28px;
      color: #7c3aed;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .section {
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #d1d5db;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .stat-card {
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #7c3aed;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }
    .app-list {
      list-style: none;
    }
    .app-item {
      padding: 10px;
      margin-bottom: 8px;
      background: white;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .app-name {
      font-weight: 600;
      color: #374151;
    }
    .app-time {
      color: #7c3aed;
      font-weight: bold;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .progress-fill {
      height: 100%;
      background: #7c3aed;
    }
    .goal-item {
      padding: 12px;
      margin-bottom: 10px;
      background: white;
      border-radius: 6px;
    }
    .goal-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .goal-type {
      font-weight: 600;
      color: #374151;
    }
    .goal-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .goal-status.completed {
      background: #d1fae5;
      color: #065f46;
    }
    .goal-status.in-progress {
      background: #dbeafe;
      color: #1e40af;
    }
    .goal-status.failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .productivity-score {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      margin: 0 auto 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: bold;
      color: white;
      background: ${productivityColor};
    }
    .score-label {
      font-size: 18px;
      font-weight: 600;
      color: ${productivityColor};
    }
    .insights {
      padding: 15px;
      background: white;
      border-radius: 6px;
      line-height: 1.6;
      color: #374151;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 HabitGuard Weekly Report</h1>
    <div class="subtitle">${report.reportTitle || 'Weekly Usage Report'}</div>
    <div class="subtitle">${dateRange}</div>
  </div>

  <!-- Summary Section -->
  <div class="section">
    <div class="section-title">📈 Week Summary</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Screen Time</div>
        <div class="stat-value">${this.formatScreenTime(report.summary.totalScreenTime)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Daily Average</div>
        <div class="stat-value">${this.formatScreenTime(report.summary.dailyAverage)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Unlocks</div>
        <div class="stat-value">${report.summary.totalUnlocks.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Days</div>
        <div class="stat-value">${report.summary.activeDays}/7</div>
      </div>
    </div>
  </div>

  <!-- Productivity Score -->
  <div class="section">
    <div class="section-title">🎯 Productivity Score</div>
    <div class="productivity-score">
      <div class="score-circle">${report.productivityScore}</div>
      <div class="score-label">${productivityLabel}</div>
    </div>
  </div>

  <!-- Most Used Apps -->
  <div class="section">
    <div class="section-title">📱 Most Used Apps</div>
    <ul class="app-list">
      ${report.mostUsedApps.slice(0, 5).map((app, index) => `
        <li class="app-item">
          <span class="app-name">${index + 1}. ${app.appName}</span>
          <span class="app-time">${this.formatScreenTime(app.totalTime)}</span>
        </li>
      `).join('')}
    </ul>
  </div>

  <!-- Goal Achievement -->
  ${report.goalAchievement && report.goalAchievement.length > 0 ? `
  <div class="section">
    <div class="section-title">🎯 Goal Achievement</div>
    ${report.goalAchievement.map(goal => `
      <div class="goal-item">
        <div class="goal-header">
          <span class="goal-type">${goal.type}</span>
          <span class="goal-status ${goal.status.toLowerCase().replace(' ', '-')}">${goal.status}</span>
        </div>
        <div>Target: ${goal.target} | Current: ${goal.current}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progress}%"></div>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Streak Data -->
  <div class="section">
    <div class="section-title">🔥 Streak & Consistency</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Days Tracked</div>
        <div class="stat-value">${report.streakData.totalDays}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Goals Met</div>
        <div class="stat-value">${report.streakData.goalsMet}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Current Streak</div>
        <div class="stat-value">${report.streakData.currentStreak || 0} days</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value">${report.streakData.successRate.toFixed(1)}%</div>
      </div>
    </div>
  </div>

  <!-- Insights -->
  <div class="section">
    <div class="section-title">💡 Insights & Recommendations</div>
    <div class="insights">
      ${report.insights || 'Great job tracking your screen time! Keep up the good work and stay consistent with your goals.'}
    </div>
  </div>

  <div class="footer">
    <p>Generated by HabitGuard on ${new Date().toLocaleDateString()}</p>
    <p>Keep building better digital habits! 🚀</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate and save PDF report
   */
  async generatePDF(report: WeeklyReportData): Promise<string | null> {
    try {
      if (!Print) {
        Alert.alert(
          'Feature Unavailable', 
          'PDF generation requires a native rebuild. Please run: npx expo run:android',
          [{ text: 'OK' }]
        );
        return null;
      }

      console.log('📄 Generating PDF report...');

      const html = this.generateReportHTML(report);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      console.log('✅ PDF generated at:', uri);
      return uri;
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      return null;
    }
  }

  /**
   * Save PDF to device
   */
  async savePDF(report: WeeklyReportData): Promise<boolean> {
    try {
      const pdfUri = await this.generatePDF(report);
      if (!pdfUri) {
        return false;
      }

      const fileName = `HabitGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      const destinationUri = `${Paths.document.uri}/${fileName}`;

      await FileSystem.moveAsync({
        from: pdfUri,
        to: destinationUri,
      });

      console.log('✅ PDF saved to:', destinationUri);
      Alert.alert(
        'Success!',
        `Report saved as ${fileName}`,
        [
          {
            text: 'OK',
            onPress: () => console.log('PDF saved confirmation')
          }
        ]
      );

      return true;
    } catch (error) {
      console.error('❌ Save PDF error:', error);
      Alert.alert('Error', 'Failed to save PDF. Please try again.');
      return false;
    }
  }

  /**
   * Share PDF via system share sheet
   */
  async sharePDF(report: WeeklyReportData): Promise<boolean> {
    try {
      if (!Sharing) {
        Alert.alert(
          'Feature Unavailable', 
          'PDF sharing requires a native rebuild. Please run: npx expo run:android',
          [{ text: 'OK' }]
        );
        return false;
      }

      const pdfUri = await this.generatePDF(report);
      if (!pdfUri) {
        return false;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return false;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Weekly Report',
        UTI: 'com.adobe.pdf',
      });

      console.log('✅ PDF shared successfully');
      return true;
    } catch (error) {
      console.error('❌ Share PDF error:', error);
      Alert.alert('Error', 'Failed to share PDF. Please try again.');
      return false;
    }
  }

  /**
   * Send PDF via email
   */
  async sendPDFByEmail(report: WeeklyReportData, emailAddress?: string): Promise<boolean> {
    try {
      const pdfUri = await this.generatePDF(report);
      if (!pdfUri) {
        return false;
      }

      const subject = encodeURIComponent(`HabitGuard Weekly Report - ${this.formatDateRange(report.weekStartDate, report.weekEndDate)}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached my HabitGuard weekly report.\n\n` +
        `Summary:\n` +
        `• Total Screen Time: ${this.formatScreenTime(report.summary.totalScreenTime)}\n` +
        `• Daily Average: ${this.formatScreenTime(report.summary.dailyAverage)}\n` +
        `• Productivity Score: ${report.productivityScore}/100\n\n` +
        `Keep building better digital habits!\n\n` +
        `Best regards,\n` +
        `HabitGuard`
      );

      const to = emailAddress || '';
      const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        
        // Also share the PDF so user can attach it
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          setTimeout(async () => {
            await Sharing.shareAsync(pdfUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Attach PDF to Email',
            });
          }, 500);
        }

        return true;
      } else {
        Alert.alert(
          'Email Not Available',
          'Please set up an email client on your device or use the share option to send via other apps.',
          [
            {
              text: 'Share Instead',
              onPress: () => this.sharePDF(report)
            },
            { text: 'Cancel' }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Send email error:', error);
      Alert.alert('Error', 'Failed to open email client. Use the share option instead.');
      return false;
    }
  }

  /**
   * Print report (for devices that support printing)
   */
  async printReport(report: WeeklyReportData): Promise<boolean> {
    try {
      if (!Print) {
        Alert.alert(
          'Feature Unavailable', 
          'Printing requires a native rebuild. Please run: npx expo run:android',
          [{ text: 'OK' }]
        );
        return false;
      }

      const html = this.generateReportHTML(report);
      
      await Print.printAsync({
        html,
      });

      console.log('✅ Print dialog opened');
      return true;
    } catch (error) {
      console.error('❌ Print error:', error);
      Alert.alert('Error', 'Printing is not available on this device.');
      return false;
    }
  }
}

export const weeklyReportService = new WeeklyReportService();
