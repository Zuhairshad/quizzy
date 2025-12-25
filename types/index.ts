/**
 * Global TypeScript Type Definitions for Quiz Web App
 */

// User role types
export type UserRole = 'admin' | 'intern';

// User profile interface
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

// Quiz question interface
export interface Question {
  id: string;
  quiz_id?: string;
  text: string;
  options: string[];
  correct_option_index?: number; // Only visible to admins, undefined for interns
  order?: number;
  created_at?: string;
}

// Quiz interface
export interface Quiz {
  id: string;
  title: string;
  description: string;
  created_by?: string;
  questions?: Question[];
  total_questions?: number;
  duration_minutes?: number;
  passing_score?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Quiz submission interface
export interface Submission {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, number>; // question_id -> selected_option_index
  score?: number;
  passed?: boolean;
  submitted_at: string;
}

// Quiz result interface
export interface QuizResult {
  submission: Submission;
  quiz: Quiz;
  selectedAnswers: (number | null)[];
  total_questions: number;
  percentage?: number;
}

// Analytics Types
export interface QuizAnalytics {
  topic: string;
  difficulty: string;
  questionsTotal: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeTakenSeconds: number;
}

export interface QuestionAnalytics {
  topic: string;
  difficulty: string;
  questionId: number;
  wasCorrect: boolean;
  timeTakenSeconds: number;
}

export interface AnalyticsStats {
  totalQuizzes: number;
  topicStats: Record<string, {
    completions: number;
    averageScore: number;
    averageTime: number;
  }>;
  recentCompletions: QuizAnalytics[];
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  username: string;
  email?: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  createdAt: string;
  rank?: number;
}

export interface LeaderboardSubmission {
  username: string;
  email?: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
}
