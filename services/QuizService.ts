import { API_CONFIG } from '../config/api.config';

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizAnswer {
  questionId: number;
  answer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizScore {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  passed: boolean;
  timeSpent: number;
}

export interface QuizAttempt {
  id?: number;
  attempt_id?: number;
  user_id: number;
  subject_code?: string;
  subject_name?: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken_seconds: number;
  passed?: boolean;
  attempted_at: string;
}

export interface AvailableQuiz {
  subjectCode: string;
  subjectName: string;
  semester: number;
  hasQuiz: boolean;
  questionCount: number;
}

class QuizService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/quiz`;
    console.log('QuizService initialized with baseURL:', this.baseURL);
  }

  // Get available quizzes for a student
  async getAvailableQuizzes(userId: number): Promise<{ success: boolean; quizzes: AvailableQuiz[] }> {
    try {
      const response = await fetch(`${this.baseURL}/available/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get available quizzes error:', error);
      throw new Error('Failed to fetch available quizzes');
    }
  }

  // Get quiz questions for a subject
  async getQuizQuestions(
    subjectCode: string,
    count: number = 5
  ): Promise<{ success: boolean; subjectCode: string; totalQuestions: number; questions: QuizQuestion[] }> {
    try {
      const response = await fetch(`${this.baseURL}/questions/${subjectCode}?count=${count}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get quiz questions error:', error);
      throw new Error('Failed to fetch quiz questions');
    }
  }

  // Submit quiz answers
  async submitQuiz(
    userId: number,
    subjectCode: string,
    answers: QuizAnswer[],
    timeSpent: number
  ): Promise<{ success: boolean; score: QuizScore; results: QuizResult[] }> {
    try {
      const response = await fetch(`${this.baseURL}/submit/${userId}/${subjectCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  // Get quiz history
  async getQuizHistory(userId: number): Promise<{
    success: boolean;
    stats: {
      totalAttempts: number;
      averageScore: number;
      passedCount: number;
      failedCount: number;
      totalTimeSpent: number;
    };
    attempts: QuizAttempt[];
  }> {
    try {
      const response = await fetch(`${this.baseURL}/history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get quiz history error:', error);
      throw new Error('Failed to fetch quiz history');
    }
  }
}

export default new QuizService();
