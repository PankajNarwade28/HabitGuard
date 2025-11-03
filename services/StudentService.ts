import { API_CONFIG } from '../config/api.config';

export interface StudentProfile {
  id: number;
  user_id: number;
  course_type: 'undergraduate' | 'postgraduate' | 'diploma';
  degree_name: string;
  current_semester: number;
  specialization?: string;
  study_hours_per_day: number;
  created_at: string;
  updated_at: string;
  subjects?: Subject[];
}

export interface Subject {
  id: number;
  profile_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  credits: number;
  study_hours_recommended: number;
}

export interface CourseRecommendation {
  subject: {
    code: string;
    name: string;
    credits: number;
    studyHours: number;
  };
  courses: {
    platform: string;
    title: string;
    url: string;
    instructor: string;
    difficulty: string;
    duration?: string;
  }[];
}

export interface StudyTimeSuggestion {
  subjectCode: string;
  subjectName: string;
  credits: number;
  recommendedWeeklyHours: number;
  dailyHours: number;
  priority: 'High' | 'Medium' | 'Low';
}

class StudentService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/student`;
    console.log('StudentService initialized with baseURL:', this.baseURL);
  }

  // Create student profile
  async createProfile(
    userId: number,
    data: {
      courseType: 'undergraduate' | 'postgraduate' | 'diploma';
      degreeName: string;
      currentSemester: number;
      specialization?: string;
      studyHoursPerDay?: number;
    }
  ): Promise<{ success: boolean; message: string; profileId?: number }> {
    try {
      const response = await fetch(`${this.baseURL}/profile/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create profile error:', error);
      throw new Error('Failed to create student profile');
    }
  }

  // Get student profile
  async getProfile(userId: number): Promise<{ success: boolean; profile?: StudentProfile }> {
    try {
      const response = await fetch(`${this.baseURL}/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Failed to fetch student profile');
    }
  }

  // Update student profile
  async updateProfile(
    userId: number,
    data: {
      currentSemester?: number;
      specialization?: string;
      studyHoursPerDay?: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update student profile');
    }
  }

  // Get available courses
  async getCourses(courseType?: string): Promise<{ success: boolean; courses: any }> {
    try {
      const url = courseType 
        ? `${this.baseURL}/courses?courseType=${courseType}`
        : `${this.baseURL}/courses`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get courses error:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  // Get student subjects
  async getSubjects(userId: number): Promise<{ success: boolean; subjects: Subject[] }> {
    try {
      const response = await fetch(`${this.baseURL}/subjects/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get subjects error:', error);
      throw new Error('Failed to fetch subjects');
    }
  }

  // Get course recommendations
  async getRecommendations(userId: number): Promise<{ success: boolean; recommendations: CourseRecommendation[] }> {
    try {
      const response = await fetch(`${this.baseURL}/recommendations/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  // Get study time suggestions
  async getStudyTimeSuggestions(userId: number): Promise<{ 
    success: boolean; 
    totalAvailableHours: number;
    totalRecommendedHours: number;
    suggestions: StudyTimeSuggestion[] 
  }> {
    try {
      const response = await fetch(`${this.baseURL}/study-time/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get study time suggestions error:', error);
      throw new Error('Failed to fetch study time suggestions');
    }
  }
}

export default new StudentService();
