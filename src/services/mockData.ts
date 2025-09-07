import { DashboardMetrics, UserStats, GameSession, ErrorAnalytics } from '../types/adminTypes';

// Mock data for demonstration purposes
export const mockDashboardMetrics: DashboardMetrics = {
  totalUsers: 1247,
  activeUsers: 384,
  totalGames: 5634,
  averageSessionDuration: 12.5,
  topErrors: [
    { error: 'Failed to load tile image', count: 45 },
    { error: 'Network timeout during save', count: 32 },
    { error: 'Invalid drag operation', count: 28 },
    { error: 'Game state corruption', count: 21 },
    { error: 'Audio context failed', count: 15 }
  ],
  levelDifficulty: [
    { level: 1, completionRate: 95, averageAttempts: 1.2 },
    { level: 2, completionRate: 88, averageAttempts: 1.4 },
    { level: 3, completionRate: 75, averageAttempts: 1.8 },
    { level: 4, completionRate: 68, averageAttempts: 2.1 },
    { level: 5, completionRate: 52, averageAttempts: 2.7 },
    { level: 6, completionRate: 41, averageAttempts: 3.2 },
    { level: 7, completionRate: 35, averageAttempts: 3.8 },
    { level: 8, completionRate: 28, averageAttempts: 4.1 }
  ],
  userRetention: {
    day1: 78,
    day7: 45,
    day30: 23
  }
};

export const mockUserStats: UserStats[] = [
  {
    userId: 'user_001',
    username: 'EcoExplorer',
    totalGamesPlayed: 45,
    totalScore: 12450,
    averageScore: 276,
    highestLevel: 8,
    currentStreak: 5,
    longestStreak: 12,
    totalPlayTime: 340,
    lastPlayed: '2025-09-03T10:30:00Z',
    registrationDate: '2025-08-15T09:00:00Z',
    isActive: true
  },
  {
    userId: 'user_002',
    username: 'LandGuardian',
    totalGamesPlayed: 38,
    totalScore: 10890,
    averageScore: 287,
    highestLevel: 7,
    currentStreak: 3,
    longestStreak: 8,
    totalPlayTime: 280,
    lastPlayed: '2025-09-02T15:45:00Z',
    registrationDate: '2025-08-20T14:30:00Z',
    isActive: true
  },
  {
    userId: 'user_003',
    username: 'NatureWatcher',
    totalGamesPlayed: 52,
    totalScore: 14230,
    averageScore: 274,
    highestLevel: 8,
    currentStreak: 0,
    longestStreak: 15,
    totalPlayTime: 420,
    lastPlayed: '2025-08-30T11:20:00Z',
    registrationDate: '2025-08-10T16:15:00Z',
    isActive: false
  },
  {
    userId: 'user_004',
    username: 'TerrainMaster',
    totalGamesPlayed: 29,
    totalScore: 8760,
    averageScore: 302,
    highestLevel: 6,
    currentStreak: 7,
    longestStreak: 9,
    totalPlayTime: 195,
    lastPlayed: '2025-09-03T08:15:00Z',
    registrationDate: '2025-08-25T12:00:00Z',
    isActive: true
  },
  {
    userId: 'user_005',
    username: 'GeoClassifier',
    totalGamesPlayed: 61,
    totalScore: 16540,
    averageScore: 271,
    highestLevel: 8,
    currentStreak: 2,
    longestStreak: 18,
    totalPlayTime: 510,
    lastPlayed: '2025-09-01T19:30:00Z',
    registrationDate: '2025-08-05T10:45:00Z',
    isActive: true
  }
];

export const mockGameSessions: GameSession[] = [
  {
    id: 'session_001',
    userId: 'user_001',
    startTime: '2025-09-03T10:30:00Z',
    endTime: '2025-09-03T10:55:00Z',
    duration: 25,
    levelsCompleted: 3,
    finalScore: 450,
    errorCount: 1,
    completionRate: 85
  },
  {
    id: 'session_002',
    userId: 'user_002',
    startTime: '2025-09-02T15:45:00Z',
    endTime: '2025-09-02T16:12:00Z',
    duration: 27,
    levelsCompleted: 2,
    finalScore: 380,
    errorCount: 0,
    completionRate: 92
  }
];

export const mockErrorAnalytics: ErrorAnalytics[] = [
  {
    id: 'error_001',
    userId: 'user_001',
    timestamp: '2025-09-03T10:35:00Z',
    error: 'Failed to load tile image',
    context: 'GameScreen.handleTileDrop',
    level: 'error',
    gameLevel: 3,
    resolved: false
  },
  {
    id: 'error_002',
    userId: 'user_003',
    timestamp: '2025-09-02T14:20:00Z',
    error: 'Network timeout during save',
    context: 'useGameState.updateProgress',
    level: 'warning',
    gameLevel: 5,
    resolved: true
  }
];

// Mock API responses for offline development
export const getMockDashboardMetrics = (): Promise<DashboardMetrics> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDashboardMetrics), 500);
  });
};

export const getMockUserStats = (): Promise<{
  users: UserStats[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      users: mockUserStats,
      total: mockUserStats.length,
      page: 1,
      totalPages: 1
    }), 300);
  });
};

export const getMockUserDetails = (userId: string): Promise<{
  user: UserStats;
  recentSessions: GameSession[];
  recentErrors: ErrorAnalytics[];
}> => {
  return new Promise((resolve) => {
    const user = mockUserStats.find(u => u.userId === userId) || mockUserStats[0];
    const recentSessions = mockGameSessions.filter(s => s.userId === userId);
    const recentErrors = mockErrorAnalytics.filter(e => e.userId === userId);
    
    setTimeout(() => resolve({
      user,
      recentSessions,
      recentErrors
    }), 200);
  });
};
