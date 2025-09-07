import { apiClient } from '../utils/api';
import { GameState } from '../types/game';
import { AuthService } from './authService';

export interface SaveGameResponse {
  id: string;
  timestamp: string;
}

export interface GameSave {
  id: string;
  userId: string;
  gameState: GameState;
  timestamp: string;
  version: string;
}

class GameService {
  private saveTimeout: number | null = null;
  private readonly SAVE_DELAY = 2000; // Auto-save after 2 seconds of inactivity

  async saveGameState(gameState: GameState): Promise<SaveGameResponse | null> {
    const user = AuthService.getCurrentUser();
    if (!user) {
      console.warn('No user logged in, cannot save game state');
      return null;
    }

    try {
      const response = await apiClient.post<SaveGameResponse>('/game/save', {
        gameState,
        userId: user.user_id,
        version: '1.0.0'
      });

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
    
    return null;
  }

  async loadGameState(): Promise<GameState | null> {
    const user = AuthService.getCurrentUser();
    if (!user) {
      console.warn('No user logged in, cannot load game state');
      return null;
    }

    try {
      const response = await apiClient.get<GameSave>(`/game/load/${user.user_id}`);
      
      if (response.success && response.data) {
        return response.data.gameState;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }

    return null;
  }

  // Auto-save with debouncing
  scheduleAutoSave(gameState: GameState): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveGameState(gameState);
    }, this.SAVE_DELAY);
  }

  async deleteGameSave(): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) {
      console.warn('No user logged in, cannot delete game save');
      return false;
    }

    try {
      const response = await apiClient.post<{success: boolean}>(`/game/delete/${user.user_id}`, {});
      
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.error('Failed to delete game save:', error);
    }
    
    return false;
  }

}

export const gameService = new GameService();
