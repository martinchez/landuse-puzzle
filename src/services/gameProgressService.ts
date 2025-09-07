import { apiClient } from '../utils/api';
import { GameProgress } from '../types/game';
import { AuthService } from './authService';
import { getInitialProgress } from '../utils/gameUtils';

interface UserGameProgress {
  user_id: string;
  game_progress: GameProgress;
  last_updated: string;
}

export class GameProgressService {
  private static progressCache: GameProgress | null = null;

  static async loadProgress(): Promise<GameProgress> {
    const user = AuthService.getCurrentUser();
    if (!user || !user.user_id) {
      console.warn('No user found or user_id missing, returning initial progress');
      const initialProgress = getInitialProgress();
      this.progressCache = initialProgress;
      return initialProgress;
    }

    try {
      console.log('Loading game progress for user:', user.user_id);
      
      const response = await apiClient.get<UserGameProgress>(`/users/${user.user_id}/progress`);
      
      console.log('Raw API response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      // Handle the nested response structure from API client
      const actualData = (response.data as any)?.data;
      console.log('Nested data:', actualData);
      console.log('Game progress data:', actualData?.game_progress);
      
      if (response.success && actualData && actualData.game_progress) {
        console.log('Loaded progress from database:', actualData.game_progress);
        this.progressCache = actualData.game_progress;
        return actualData.game_progress;
      } else {
        console.log('No valid progress found in database response, returning initial progress');
        console.log('Response data:', response.data);
        const initialProgress = getInitialProgress();
        this.progressCache = initialProgress;
        return initialProgress;
      }
    } catch (error) {
      console.warn('Failed to load progress from database (using initial progress):', error);
      // Return cached progress if available, otherwise initial progress
      const fallbackProgress = this.progressCache || getInitialProgress();
      this.progressCache = fallbackProgress;
      return fallbackProgress;
    }
  }

  static async saveProgress(progress: GameProgress): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user || !user.user_id) {
      console.warn('No user found or user_id missing, cannot save progress');
      return false;
    }

    try {
      console.log('Saving game progress for user:', user.user_id);
      console.log('Progress data:', progress);
      
      const response = await apiClient.post(`/users/${user.user_id}/progress`, {
        game_progress: progress
      });
      
      if (response.success) {
        console.log('Progress saved successfully to database');
        this.progressCache = progress;
        
        // Also update user stats based on progress
        await this.updateUserStatsFromProgress(progress);
        
        return true;
      } else {
        console.error('Failed to save progress:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error saving progress to database:', error);
      return false;
    }
  }

  private static async updateUserStatsFromProgress(progress: GameProgress): Promise<void> {
    try {
      // Calculate stats from progress
      const totalGamesPlayed = Object.keys(progress.levelStars).length;
      const totalScore = progress.totalStars * 100; // Simple calculation
      const highestLevel = Math.max(...Object.keys(progress.levelStars).map(Number), 0);

      await AuthService.updateUserStats(highestLevel, 0, 0); // Score is calculated from stars
    } catch (error) {
      console.error('Failed to update user stats from progress:', error);
    }
  }

  static async clearProgress(): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user || !user.user_id) {
      console.warn('No user found or user_id missing, cannot clear progress');
      return false;
    }

    try {
      const response = await apiClient.post(`/users/${user.user_id}/progress/reset`, {});
      
      if (response.success) {
        console.log('Progress cleared successfully');
        this.progressCache = getInitialProgress();
        return true;
      } else {
        console.error('Failed to clear progress:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error clearing progress:', error);
      return false;
    }
  }

  static getCachedProgress(): GameProgress | null {
    return this.progressCache;
  }
}
