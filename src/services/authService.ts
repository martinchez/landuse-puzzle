import { apiClient } from '../utils/api';

export interface UserData {
  name: string;
  age?: number;
  school?: string;
  laptop_id?: string;
  session_start?: Date;
}

export interface User {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  age?: number;
  school?: string;
  laptop_id: string;
  session_start: string;
  user_type: string;
  created_at: string;
  last_active: string;
}

export class AuthService {
  static async createChildUser(userData: UserData): Promise<User> {
    try {
      const laptopId = this.getLaptopId();
      const sessionStart = new Date();
      
      console.log('Creating child user:', userData);
      
      const response = await apiClient.post<User>('/users/create-child', {
        username: userData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        display_name: userData.name,
        age: userData.age,
        school: userData.school,
        laptop_id: laptopId,
        session_start: sessionStart.toISOString(),
        user_type: 'child'
      });
      
      console.log('API response received:', response);
      
      if (response.success && response.data) {
        // The API client returns { success: true, data: serverResponse }
        // The server returns { success: true, data: actualUserData }
        // So we need to access response.data.data to get the actual user
        const serverResponse = response.data as any;
        if (serverResponse.success && serverResponse.data) {
          const user = serverResponse.data;
          console.log('Extracted user data:', user);
          
          // Store in localStorage for session
          localStorage.setItem('current_user', JSON.stringify(user));
          localStorage.setItem('session_start', sessionStart.toISOString());
          localStorage.setItem('user-id', user.user_id);
          
          console.log('User stored in localStorage successfully');
          console.log('User created successfully:', user);
          return user;
        } else {
          console.error('Server response not successful:', serverResponse);
          throw new Error('Failed to create user on server');
        }
      } else {
        console.error('API response not successful:', response);
        throw new Error('Failed to create user on server');
      }
    } catch (error) {
      console.error('Failed to create child user on server:', error);
      
      // Fallback to local storage only
      const laptopId = this.getLaptopId();
      const sessionStart = new Date();
      const localUser: User = {
        id: Date.now().toString(),
        user_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: userData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        display_name: userData.name,
        age: userData.age,
        school: userData.school,
        laptop_id: laptopId,
        session_start: sessionStart.toISOString(),
        user_type: 'child',
        created_at: sessionStart.toISOString(),
        last_active: sessionStart.toISOString()
      };
      
      localStorage.setItem('current_user', JSON.stringify(localUser));
      localStorage.setItem('session_start', sessionStart.toISOString());
      localStorage.setItem('user-id', localUser.user_id);
      
      console.log('User created locally:', localUser);
      return localUser;
    }
  }

  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('current_user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Validate that user has required fields
      if (!user || !user.user_id || !user.display_name) {
        console.warn('Invalid user object in localStorage, clearing:', user);
        this.clearInvalidSession();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.clearInvalidSession();
      return null;
    }
  }

  static getLaptopId(): string {
    let laptopId = localStorage.getItem('laptop_id');
    if (!laptopId) {
      laptopId = `laptop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('laptop_id', laptopId);
    }
    return laptopId;
  }

  static getSessionDuration(): number {
    const sessionStart = localStorage.getItem('session_start');
    if (!sessionStart) return 0;
    
    const startTime = new Date(sessionStart);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
  }

  static isSessionValid(): boolean {
    const sessionStart = localStorage.getItem('session_start');
    if (!sessionStart) return false;
    
    const startTime = new Date(sessionStart);
    const now = new Date();
    const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Session is valid for 8 hours (full school day)
    return hoursSinceStart < 8;
  }

  static logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      console.log(`User ${user.display_name} logged out after ${this.getSessionDuration()} minutes`);
    }
    
    // Clear all user-related localStorage data
    localStorage.removeItem('current_user');
    localStorage.removeItem('session_start');
    localStorage.removeItem('user-id');
    
    // Clear old progress data from localStorage (migration cleanup)
    localStorage.removeItem('landCoverGameProgress');
    localStorage.removeItem('game-state-backup');
    
    // Keep laptop_id for device tracking
  }

  static async updateLastActive(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      await apiClient.post('/users/update-activity', {
        user_id: user.user_id,
        last_active: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to update user activity:', error);
    }
  }

  static async updateUserStats(levelCompleted: number, scoreGained: number, playTimeMinutes: number = 0): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      console.log('Updating user stats:', { levelCompleted, scoreGained, playTimeMinutes });
      
      const response = await apiClient.post('/users/update-stats', {
        user_id: user.user_id,
        level_completed: levelCompleted,
        score_gained: scoreGained,
        play_time_minutes: playTimeMinutes
      });

      if (response.success) {
        console.log('User stats updated successfully:', response.data);
      }
    } catch (error) {
      console.error('Failed to update user stats:', error);
    }
  }

  static switchUser(): void {
    this.logout();
    // Force page reload to show user entry
    window.location.reload();
  }

  // Clear invalid session data
  static clearInvalidSession(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('session_start');
    localStorage.removeItem('user-id');
    console.log('Cleared invalid user session');
  }

  // Migration function to clean up old localStorage data
  static migrateOldData(): void {
    console.log('🔄 Checking for old localStorage data to migrate...');
    
    // Check for old progress data
    const oldProgress = localStorage.getItem('landCoverGameProgress');
    if (oldProgress) {
      console.log('🗑️ Removing old game progress from localStorage');
      localStorage.removeItem('landCoverGameProgress');
    }
    
    // Check for old game state backup
    const oldGameState = localStorage.getItem('game-state-backup');
    if (oldGameState) {
      console.log('🗑️ Removing old game state backup from localStorage');
      localStorage.removeItem('game-state-backup');
    }
    
    console.log('✅ Migration check complete');
  }
}
