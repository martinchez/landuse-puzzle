export interface UserStats {
  userId: string;
  username?: string;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  highestLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number; // in minutes
  lastPlayed: string;
  registrationDate?: string;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  levelsCompleted: number;
  finalScore: number;
  errorCount: number;
  completionRate: number; // percentage
}

export interface ErrorAnalytics {
  id: string;
  userId: string;
  timestamp: string;
  error: string;
  context?: string;
  level: 'error' | 'warning' | 'info';
  gameLevel?: number;
  resolved: boolean;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number; // active in last 7 days
  totalGames: number;
  averageSessionDuration: number;
  topErrors: Array<{ error: string; count: number }>;
  topImageFailures: Array<{
    image_name: string;
    classification_attempt: string;
    correct_classification: string;
    game_level: number;
    failure_count: number;
    users_affected: number;
  }>;
  levelDifficulty: Array<{ level: number; completionRate: number; averageAttempts: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator';
  permissions: string[];
}
