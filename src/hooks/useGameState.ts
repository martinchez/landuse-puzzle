import { useState, useEffect } from 'react';
import { GameState, GameProgress, GameScreen } from '../types/game';
import { getInitialProgress, handleError } from '../utils/gameUtils';
import { GameProgressService } from '../services/gameProgressService';
import { AuthService } from '../services/authService';

export const useGameState = (currentUser?: any) => {
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'home',
    currentLevel: 1,
    gameProgress: getInitialProgress(),
    isLoading: true
  });

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const user = currentUser || AuthService.getCurrentUser();
        if (!user || !user.user_id) {
          // No valid user logged in, use initial progress
          console.log('No valid user for progress loading, using initial progress');
          setGameState(prev => ({ 
            ...prev, 
            gameProgress: getInitialProgress(),
            isLoading: false,
            error: undefined
          }));
          return;
        }

        console.log('Loading progress for user:', user.user_id);
        const progress = await GameProgressService.loadProgress();
        
        // Ensure progress is valid
        const validProgress = progress || getInitialProgress();
        
        setGameState(prev => ({ 
          ...prev, 
          gameProgress: validProgress,
          isLoading: false,
          error: undefined
        }));
      } catch (error) {
        const errorMessage = handleError(error, 'loading game progress');
        console.error('Failed to load user progress:', error);
        setGameState(prev => ({ 
          ...prev, 
          gameProgress: getInitialProgress(), // Use initial progress as fallback
          isLoading: false,
          error: errorMessage
        }));
      }
    };

    loadUserProgress();
  }, [currentUser]);

  const updateProgress = async (newProgress: GameProgress) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.user_id) {
        console.warn('No valid user found, cannot save progress to database');
        // Still update local state even if we can't save to database
        setGameState(prev => ({ 
          ...prev, 
          gameProgress: newProgress,
          error: undefined
        }));
        return;
      }

      const success = await GameProgressService.saveProgress(newProgress);
      if (success) {
        setGameState(prev => ({ 
          ...prev, 
          gameProgress: newProgress,
          error: undefined
        }));
      } else {
        // Save failed, but still update local state
        console.warn('Failed to save progress to database, updating local state only');
        setGameState(prev => ({ 
          ...prev, 
          gameProgress: newProgress,
          error: 'Progress not saved to database'
        }));
      }
    } catch (error) {
      const errorMessage = handleError(error, 'saving game progress');
      // Still update local state even if save failed
      setGameState(prev => ({ 
        ...prev, 
        gameProgress: newProgress,
        error: errorMessage
      }));
    }
  };

  const setScreen = (screen: GameScreen) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  const setCurrentLevel = (level: number) => {
    setGameState(prev => ({ ...prev, currentLevel: level }));
  };

  const clearError = () => {
    setGameState(prev => ({ ...prev, error: undefined }));
  };

  const resetGame = async () => {
    try {
      const user = AuthService.getCurrentUser();
      const initialProgress = getInitialProgress();
      
      if (!user || !user.user_id) {
        console.warn('No valid user found, resetting local progress only');
        setGameState({
          currentScreen: 'home',
          currentLevel: 1,
          gameProgress: initialProgress,
          isLoading: false
        });
        return;
      }

      const success = await GameProgressService.clearProgress();
      if (success) {
        setGameState({
          currentScreen: 'home',
          currentLevel: 1,
          gameProgress: initialProgress,
          isLoading: false
        });
      } else {
        // Reset failed, but still reset local state
        console.warn('Failed to reset progress in database, resetting local state only');
        setGameState({
          currentScreen: 'home',
          currentLevel: 1,
          gameProgress: initialProgress,
          isLoading: false,
          error: 'Progress not reset in database'
        });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'resetting game');
      // Still reset local state even if database reset failed
      setGameState({
        currentScreen: 'home',
        currentLevel: 1,
        gameProgress: getInitialProgress(),
        isLoading: false,
        error: errorMessage
      });
    }
  };

  return {
    gameState,
    updateProgress,
    setScreen,
    setCurrentLevel,
    clearError,
    resetGame
  };
};