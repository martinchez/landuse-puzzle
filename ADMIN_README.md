# Land Use Puzzle - Admin Dashboard

## Overview
This admin dashboard provides comprehensive monitoring and analytics for the Land Use Puzzle game, allowing administrators to track user performance, monitor errors, and analyze game metrics.

## Features

### 📊 Dashboard Overview
- **Real-time metrics**: Total users, active users, games played, and session duration
- **Error monitoring**: Top errors with counts and trends
- **Level difficulty analysis**: Completion rates and average attempts per level
- **User retention tracking**: Day 1, 7, and 30 retention rates

### 👥 User Management
- **User statistics**: Comprehensive view of all users with sorting and filtering
- **User details**: Individual user profiles with session history and error logs
- **Performance tracking**: Scores, levels completed, play time, and streaks
- **Search and filter**: Find specific users quickly

### 🔧 Error Tracking
- **Automatic error logging**: All errors are automatically captured and logged
- **Context tracking**: Errors include game state and context information
- **Admin notifications**: Real-time error monitoring with resolution tracking
- **Offline support**: Errors are saved locally when offline and synced when online

### 📈 Data Export
- **CSV/JSON export**: Export user data, sessions, or error logs
- **Bulk operations**: Process multiple records at once
- **Scheduled reports**: Automated data exports (future feature)

## Getting Started

### Accessing the Admin Panel
1. Start the game application
2. From the home screen, click the ⚙️ settings icon in the top-right corner
3. The admin dashboard will load with mock data for demonstration

### Demo Mode
The admin dashboard currently runs with mock data to demonstrate functionality. To connect to a real backend:

1. Set up your API server at `http://localhost:3001/api`
2. Update the `.env` file with your API URL
3. Implement the backend endpoints listed below

## Backend API Requirements

### Dashboard Metrics
```
GET /admin/dashboard/metrics
Response: DashboardMetrics object
```

### User Management
```
GET /admin/users?page=1&limit=50&sortBy=totalScore&sortOrder=desc
Response: { users: UserStats[], total: number, page: number, totalPages: number }

GET /admin/users/:userId
Response: { user: UserStats, recentSessions: GameSession[], recentErrors: ErrorAnalytics[] }
```

### Error Tracking
```
POST /errors/batch
Body: { errors: ErrorLog[] }
Response: { success: boolean }

GET /admin/errors?page=1&limit=50&level=error&resolved=false
Response: { errors: ErrorAnalytics[], total: number, page: number, totalPages: number }

PUT /admin/errors/:errorId/resolve
Response: { success: boolean }
```

### Game State Management
```
POST /game/save
Body: { gameState: GameState, userId: string, version: string }
Response: { id: string, timestamp: string }

GET /game/load/:userId
Response: { id: string, userId: string, gameState: GameState, timestamp: string, version: string }
```

### Data Export
```
GET /admin/export/users?format=csv
GET /admin/export/sessions?format=csv  
GET /admin/export/errors?format=csv
Response: File download (CSV or JSON)
```

## Data Types

### UserStats
```typescript
interface UserStats {
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
```

### ErrorAnalytics
```typescript
interface ErrorAnalytics {
  id: string;
  userId: string;
  timestamp: string;
  error: string;
  context?: string;
  level: 'error' | 'warning' | 'info';
  gameLevel?: number;
  resolved: boolean;
}
```

### DashboardMetrics
```typescript
interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number; // active in last 7 days
  totalGames: number;
  averageSessionDuration: number;
  topErrors: Array<{ error: string; count: number }>;
  levelDifficulty: Array<{ level: number; completionRate: number; averageAttempts: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}
```

## Features in Development

- **Real-time notifications**: Live updates for critical errors
- **Advanced filtering**: More sophisticated user and error filtering
- **Performance analytics**: Detailed performance metrics and trends
- **A/B testing**: Game variant testing and analysis
- **Automated alerts**: Email/SMS notifications for critical issues

## Technical Implementation

### Frontend Stack
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Framer Motion**: Animations

### Backend Requirements
- **REST API**: Standard HTTP endpoints
- **Database**: User data, game sessions, error logs
- **Authentication**: Admin user management
- **File Export**: CSV/JSON generation

### Error Handling
- **Automatic logging**: All errors captured automatically
- **Offline support**: Local storage fallback
- **Retry mechanism**: Automatic retry for failed submissions
- **Context preservation**: Full game state included with errors

## Contributing

To contribute to the admin dashboard:

1. Add new components in `src/components/admin/`
2. Update types in `src/types/adminTypes.ts`
3. Extend services in `src/services/adminService.ts`
4. Add mock data in `src/services/mockData.ts` for testing

## Support

For questions or issues with the admin dashboard, please check:
- Error logs in the browser console
- Network tab for API call failures  
- Local storage for cached data
- Mock data service for development testing
