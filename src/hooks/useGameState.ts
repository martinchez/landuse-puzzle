import { useState, useEffect } from 'react';
import { GameState, GameProgress, GameScreen } from '../types/game';
import { loadProgress, saveProgress, getInitialProgress } from '../utils/gameUtils';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'home',
    currentLevel: 1,
    gameProgress: getInitialProgress()
  });

  useEffect(() => {
    const progress = loadProgress();
    setGameState(prev => ({ ...prev, gameProgress: progress }));
  }, []);

  const updateProgress = (newProgress: GameProgress) => {
    setGameState(prev => ({ ...prev, gameProgress: newProgress }));
    saveProgress(newProgress);
  };

  const setScreen = (screen: GameScreen) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  };

  const setCurrentLevel = (level: number) => {
    setGameState(prev => ({ ...prev, currentLevel: level }));
  };

  return {
    gameState,
    updateProgress,
    setScreen,
    setCurrentLevel
  };
};