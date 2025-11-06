import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.API_URL || 'http://192.168.0.103:3000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export interface StudyPlan {
  plan_id: number;
  user_id: number;
  profile_id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  planned_duration_minutes: number;
  target_daily_hours: number;
  target_weekly_hours: number;
  priority: 'Low' | 'Medium' | 'High';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  credits?: number;
  study_hours_recommended?: number;
}

export interface StudySession {
  session_id: number;
  user_id: number;
  profile_id: number;
  subject_id: number;
  plan_id?: number;
  subject_code: string;
  subject_name: string;
  planned_duration_minutes: number;
  actual_duration_seconds: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  start_time: string | null;
  pause_time: string | null;
  end_time: string | null;
  total_paused_seconds: number;
  pause_count: number;
  notes?: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface StudyStatistics {
  period: 'week' | 'month' | 'all';
  overall: {
    total_minutes: number;
    total_sessions: number;
    completed_sessions: number;
    avg_session_minutes: number;
    total_pauses: number;
  };
  bySubject: Array<{
    subject_id: number;
    subject_code: string;
    subject_name: string;
    total_minutes: number;
    total_sessions: number;
    completed_sessions: number;
    avg_session_minutes: number;
  }>;
  daily: Array<{
    stat_date: string;
    total_minutes: number;
    total_sessions: number;
  }>;
}

class StudySessionService {
  // Study Plans
  async createStudyPlan(
    userId: number,
    data: {
      subjectId: number;
      subjectCode: string;
      subjectName: string;
      plannedDurationMinutes: number;
      targetDailyHours: number;
      targetWeeklyHours: number;
      priority: 'Low' | 'Medium' | 'High';
    }
  ): Promise<{ success: boolean; planId?: number; message?: string }> {
    try {
      return await apiCall<{ success: boolean; planId?: number; message?: string }>(
        `/student/study-plans/${userId}`,
        'POST',
        data
      );
    } catch (error: any) {
      console.error('Error creating study plan:', error);
      return {
        success: false,
        message: error.message || 'Failed to create study plan',
      };
    }
  }

  async getStudyPlans(userId: number): Promise<{ success: boolean; plans: StudyPlan[] }> {
    try {
      return await apiCall<{ success: boolean; plans: StudyPlan[] }>(
        `/student/study-plans/${userId}`
      );
    } catch (error: any) {
      console.error('Error fetching study plans:', error);
      return { success: false, plans: [] };
    }
  }

  // Study Sessions
  async createStudySession(
    userId: number,
    data: {
      subjectId: number;
      planId?: number;
      subjectCode: string;
      subjectName: string;
      plannedDurationMinutes: number;
    }
  ): Promise<{ success: boolean; sessionId?: number; message?: string }> {
    try {
      return await apiCall<{ success: boolean; sessionId?: number; message?: string }>(
        `/student/study-sessions/${userId}`,
        'POST',
        data
      );
    } catch (error: any) {
      console.error('Error creating study session:', error);
      return {
        success: false,
        message: error.message || 'Failed to create study session',
      };
    }
  }

  async getActiveSession(userId: number): Promise<{
    success: boolean;
    hasActiveSession: boolean;
    session: StudySession | null;
  }> {
    try {
      return await apiCall<{
        success: boolean;
        hasActiveSession: boolean;
        session: StudySession | null;
      }>(`/student/study-sessions/${userId}/active`);
    } catch (error: any) {
      console.error('Error fetching active session:', error);
      return { success: false, hasActiveSession: false, session: null };
    }
  }

  async startSession(sessionId: number): Promise<{ success: boolean; session?: StudySession; message?: string }> {
    try {
      return await apiCall<{ success: boolean; session?: StudySession; message?: string }>(
        `/student/study-sessions/${sessionId}/start`,
        'POST'
      );
    } catch (error: any) {
      console.error('Error starting session:', error);
      return {
        success: false,
        message: error.message || 'Failed to start session',
      };
    }
  }

  async pauseSession(
    sessionId: number,
    currentDurationSeconds: number
  ): Promise<{ success: boolean; session?: StudySession; message?: string }> {
    try {
      return await apiCall<{ success: boolean; session?: StudySession; message?: string }>(
        `/student/study-sessions/${sessionId}/pause`,
        'POST',
        { currentDurationSeconds }
      );
    } catch (error: any) {
      console.error('Error pausing session:', error);
      return {
        success: false,
        message: error.message || 'Failed to pause session',
      };
    }
  }

  async resumeSession(sessionId: number): Promise<{ success: boolean; session?: StudySession; message?: string }> {
    try {
      return await apiCall<{ success: boolean; session?: StudySession; message?: string }>(
        `/student/study-sessions/${sessionId}/resume`,
        'POST'
      );
    } catch (error: any) {
      console.error('Error resuming session:', error);
      return {
        success: false,
        message: error.message || 'Failed to resume session',
      };
    }
  }

  async stopSession(
    sessionId: number,
    finalDurationSeconds: number,
    notes?: string
  ): Promise<{
    success: boolean;
    sessionId?: number;
    studyMinutes?: number;
    completionPercentage?: string;
    message?: string;
  }> {
    try {
      return await apiCall<{
        success: boolean;
        sessionId?: number;
        studyMinutes?: number;
        completionPercentage?: string;
        message?: string;
      }>(
        `/student/study-sessions/${sessionId}/stop`,
        'POST',
        { finalDurationSeconds, notes }
      );
    } catch (error: any) {
      console.error('Error stopping session:', error);
      return {
        success: false,
        message: error.message || 'Failed to stop session',
      };
    }
  }

  async getStudyHistory(
    userId: number,
    options?: { limit?: number; subjectId?: number }
  ): Promise<{ success: boolean; sessions: StudySession[] }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.subjectId) params.append('subjectId', options.subjectId.toString());

      return await apiCall<{ success: boolean; sessions: StudySession[] }>(
        `/student/study-sessions/${userId}/history?${params.toString()}`
      );
    } catch (error: any) {
      console.error('Error fetching study history:', error);
      return { success: false, sessions: [] };
    }
  }

  // Study Statistics
  async getStudyStatistics(
    userId: number,
    period: 'week' | 'month' | 'all' = 'week'
  ): Promise<{ success: boolean; data?: StudyStatistics; message?: string }> {
    try {
      const data = await apiCall<StudyStatistics>(
        `/student/study-statistics/${userId}?period=${period}`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching study statistics:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch study statistics',
      };
    }
  }
}

export default new StudySessionService();
