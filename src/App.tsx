import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { useGameState } from './hooks/useGameState';
import { Level, Badge } from './types/game';
import levelsData from './data/levels.json';
import { DragProvider } from './contexts/DragContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const { gameState, updateProgress, setScreen, setCurrentLevel } = useGameState();
  const [levels] = useState<Level[]>(levelsData as Level[]);
  const [lastCompletedLevel, setLastCompletedLevel] = useState<{
    level: Level;
    stars: number;
    newBadges: Badge[];
  } | null>(null);

  const currentLevel = levels.find(l => l.id === gameState.currentLevel);

  const handleStartGame = () => {
    // Start from the first unlocked incomplete level
    const nextLevel = levels.find(level => {
      const stars = gameState.gameProgress.levelStars[level.id] || 0;
      return level.id <= gameState.gameProgress.unlockedLevels && stars === 0;
    }) || levels[0];
    
    setCurrentLevel(nextLevel.id);
    setScreen('game');
  };

  const handleLevelSelect = () => {
    setScreen('levelSelect');
  };

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    setScreen('game');
  };

  const handleLevelComplete = (stars: number) => {
    if (!currentLevel) return;

    const currentLevelStars = gameState.gameProgress.levelStars[currentLevel.id] || 0;
    const newStars = Math.max(stars, currentLevelStars);
    
    // Update progress
    const newProgress = {
      ...gameState.gameProgress,
      levelStars: {
        ...gameState.gameProgress.levelStars,
        [currentLevel.id]: newStars
      },
      totalStars: Object.values({
        ...gameState.gameProgress.levelStars,
        [currentLevel.id]: newStars
      }).reduce((sum, s) => sum + s, 0),
      unlockedLevels: Math.max(
        gameState.gameProgress.unlockedLevels,
        currentLevel.id + 1
      )
    };

    // Check for new badges
    const newBadges: Badge[] = [];
    if (stars === 3 && !gameState.gameProgress.badges.find(b => b.id === 'perfect-classifier')?.earned) {
      newBadges.push({ ...gameState.gameProgress.badges.find(b => b.id === 'perfect-classifier')!, earned: true });
    }

    if (newProgress.totalStars >= 15 && !gameState.gameProgress.badges.find(b => b.id === 'master-classifier')?.earned) {
      newBadges.push({ ...gameState.gameProgress.badges.find(b => b.id === 'master-classifier')!, earned: true });
    }

    // Update badges in progress
    newProgress.badges = newProgress.badges.map(badge => {
      const newBadge = newBadges.find(nb => nb.id === badge.id);
      return newBadge || badge;
    });

    updateProgress(newProgress);
    setLastCompletedLevel({
      level: currentLevel,
      stars: newStars,
      newBadges
    });
    setScreen('results');
  };

  const handleReplay = () => {
    setScreen('game');
  };

  const handleNextLevel = () => {
    const nextLevelId = gameState.currentLevel + 1;
    const nextLevel = levels.find(l => l.id === nextLevelId);
    
    if (nextLevel && nextLevelId <= gameState.gameProgress.unlockedLevels) {
      setCurrentLevel(nextLevelId);
      setScreen('game');
    } else {
      setScreen('home');
    }
  };

  const handleHome = () => {
    setScreen('home');
  };

  const handleAbout = () => {
    setScreen('about');
  };

  if (gameState.currentScreen === 'home') {
    return (
      <HomeScreen
        onStartGame={handleStartGame}
        onLevelSelect={handleLevelSelect}
        onAbout={handleAbout}
        gameProgress={gameState.gameProgress}
      />
    );
  }

  if (gameState.currentScreen === 'levelSelect') {
    return (
      <LevelSelectScreen
        levels={levels}
        gameProgress={gameState.gameProgress}
        onSelectLevel={handleSelectLevel}
        onBack={handleHome}
      />
    );
  }

  if (gameState.currentScreen === 'game' && currentLevel) {
    return (
      <GameScreen
        level={currentLevel}
        gameProgress={gameState.gameProgress}
        onLevelComplete={handleLevelComplete}
        onHome={handleHome}
      />
    );
  }

  if (gameState.currentScreen === 'results' && lastCompletedLevel) {
    const hasNextLevel = gameState.currentLevel < levels.length && 
                        gameState.currentLevel + 1 <= gameState.gameProgress.unlockedLevels;

    return (
      <ResultsScreen
        levelTitle={lastCompletedLevel.level.title}
        stars={lastCompletedLevel.stars}
        correctAnswers={lastCompletedLevel.level.tiles.length}
        totalTiles={lastCompletedLevel.level.tiles.length}
        newBadges={lastCompletedLevel.newBadges}
        onReplay={handleReplay}
        onNextLevel={handleNextLevel}
        onHome={handleHome}
        hasNextLevel={hasNextLevel}
      />
    );
  }

  if (gameState.currentScreen === 'about') {
    return <AboutScreen onBack={handleHome} />;
  }

  return null;
}

export default function WrappedApp() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragProvider>
        <App />
      </DragProvider>
    </DndProvider>
  );
}