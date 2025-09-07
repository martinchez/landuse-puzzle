import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { AdminScreen } from './screens/AdminScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SimpleUserEntry } from './components/SimpleUserEntry';
import { useGameState } from './hooks/useGameState';
import { Level, Badge } from './types/game';
import levelsData from './data/levels.json';
import { DragProvider } from './contexts/DragContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { handleError } from './utils/gameUtils';
import { randomizeLevelImagesWithSeed } from './utils/imageUtils';
import { AuthService, User, UserData } from './services/authService';

function App() {
  const [showUserEntry, setShowUserEntry] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const { gameState, updateProgress, setScreen, setCurrentLevel, clearError } = useGameState(currentUser);
  
  // Initialize levels with randomized images (must be before any early returns)
  const [levels] = useState<Level[]>(() => {
    return (levelsData as Level[]).map(level => ({
      ...level,
      tiles: randomizeLevelImagesWithSeed(level.tiles, level.id)
    }));
  });
  
  const [lastCompletedLevel, setLastCompletedLevel] = useState<{
    level: Level;
    stars: number;
    newBadges: Badge[];
  } | null>(null);

  // Check for existing user session on app load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Run migration to clean up old localStorage data
        AuthService.migrateOldData();
        
        const user = AuthService.getCurrentUser();
        console.log('Checking user session:', user);
        
        if (user && user.user_id && AuthService.isSessionValid()) {
          setCurrentUser(user);
          setShowUserEntry(false);
          console.log('Valid user session found:', user.display_name);
        } else {
          if (user) {
            console.log('Previous session invalid or expired, clearing');
            AuthService.clearInvalidSession();
          }
          console.log('No valid user session, showing user entry');
          setShowUserEntry(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        AuthService.clearInvalidSession();
        setShowUserEntry(true);
      } finally {
        setIsAppLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Update activity periodically for active sessions
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        AuthService.updateLastActive();
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleUserEntry = async (userData: { name: string; age?: number; school?: string }) => {
    console.log('handleUserEntry called with:', userData);
    try {
      setIsAppLoading(true);
      console.log('Creating user...');
      
      const user = await AuthService.createChildUser(userData);
      console.log('User creation response:', user);
      
      if (user && user.user_id) {
        console.log('Setting current user:', user);
        setCurrentUser(user);
        setShowUserEntry(false);
        console.log('User session started successfully:', user.display_name);
      } else {
        console.error('Invalid user object received:', user);
        throw new Error('Failed to create valid user - missing user_id');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      handleError(error, 'user creation');
      // Keep showing user entry form on error
    } finally {
      setIsAppLoading(false);
      console.log('handleUserEntry completed');
    }
  };

  const handleSwitchUser = () => {
    AuthService.switchUser();
    setCurrentUser(null);
    setShowUserEntry(true);
  };

  // Show loading while initializing
  if (isAppLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>🎮 Loading Land Use Puzzle...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Initializing user session</div>
      </div>
    );
  }

  // Show user entry screen if no valid session
  if (showUserEntry) {
    return (
      <ErrorBoundary>
        <SimpleUserEntry onUserCreate={handleUserEntry} />
      </ErrorBoundary>
    );
  }

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <SimpleUserEntry onUserCreate={handleUserEntry} />
      </ErrorBoundary>
    );
  }

  if (!currentUser.user_id) {
    console.log('User missing user_id:', currentUser);
    return (
      <ErrorBoundary>
        <SimpleUserEntry onUserCreate={handleUserEntry} />
      </ErrorBoundary>
    );
  }

  const currentLevel = levels.find(l => l.id === gameState.currentLevel);

  const handleStartGame = () => {
    try {
      // Start from the first unlocked incomplete level
      const nextLevel = levels.find(level => {
        const stars = gameState.gameProgress.levelStars[level.id] || 0;
        return level.id <= gameState.gameProgress.unlockedLevels && stars === 0;
      }) || levels[0];
      
      setCurrentLevel(nextLevel.id);
      setScreen('game');
      clearError();
    } catch (error) {
      console.error('Error starting game:', handleError(error, 'start game'));
    }
  };

  const handleLevelSelect = () => {
    try {
      setScreen('levelSelect');
      clearError();
    } catch (error) {
      console.error('Error navigating to level select:', handleError(error, 'level select'));
    }
  };

  const handleSelectLevel = (levelId: number) => {
    try {
      setCurrentLevel(levelId);
      setScreen('game');
      clearError();
    } catch (error) {
      console.error('Error selecting level:', handleError(error, 'select level'));
    }
  };

  const handleLevelComplete = (stars: number, playTimeMinutes: number = 0) => {
    try {
      if (!currentLevel) return;

      const currentLevelStars = gameState.gameProgress.levelStars[currentLevel.id] || 0;
      const newStars = Math.max(stars, currentLevelStars);
      
      // Calculate score based on stars (you can adjust this formula)
      const scoreGained = stars * 100 + (currentLevel.id * 10);
      
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
        }).reduce((sum: number, s: unknown) => sum + (typeof s === 'number' ? s : 0), 0),
        unlockedLevels: Math.max(
          gameState.gameProgress.unlockedLevels,
          currentLevel.id + 1
        )
      };

      // Check for new badges
      const newBadges: Badge[] = [];
      if (stars === 3 && !gameState.gameProgress.badges.find((b: Badge) => b.id === 'perfect-classifier')?.earned) {
        const perfectBadge = gameState.gameProgress.badges.find((b: Badge) => b.id === 'perfect-classifier');
        if (perfectBadge) {
          newBadges.push({ ...perfectBadge, earned: true });
        }
      }

      if (newProgress.totalStars >= 15 && !gameState.gameProgress.badges.find((b: Badge) => b.id === 'master-classifier')?.earned) {
        const masterBadge = gameState.gameProgress.badges.find((b: Badge) => b.id === 'master-classifier');
        if (masterBadge) {
          newBadges.push({ ...masterBadge, earned: true });
        }
      }

      // Update badges in progress
      newProgress.badges = newProgress.badges.map((badge: Badge) => {
        const newBadge = newBadges.find(nb => nb.id === badge.id);
        return newBadge || badge;
      });

      updateProgress(newProgress);
      
      // Update user statistics in database
      AuthService.updateUserStats(currentLevel.id, scoreGained, playTimeMinutes);
      
      setLastCompletedLevel({
        level: currentLevel,
        stars: newStars,
        newBadges
      });
      setScreen('results');
    } catch (error) {
      console.error('Error completing level:', handleError(error, 'level complete'));
    }
  };

  const handleReplay = () => {
    try {
      setScreen('game');
      clearError();
    } catch (error) {
      console.error('Error replaying level:', handleError(error, 'replay'));
    }
  };

  const handleNextLevel = () => {
    try {
      const nextLevelId = gameState.currentLevel + 1;
      const nextLevel = levels.find((l: Level) => l.id === nextLevelId);
      
      if (nextLevel && nextLevelId <= gameState.gameProgress.unlockedLevels) {
        setCurrentLevel(nextLevelId);
        setScreen('game');
      } else {
        setScreen('home');
      }
      clearError();
    } catch (error) {
      console.error('Error going to next level:', handleError(error, 'next level'));
    }
  };

  const handleHome = () => {
    try {
      setScreen('home');
      clearError();
    } catch (error) {
      console.error('Error navigating home:', handleError(error, 'navigate home'));
    }
  };

  const handleAbout = () => {
    try {
      setScreen('about');
      clearError();
    } catch (error) {
      console.error('Error navigating to about:', handleError(error, 'navigate about'));
    }
  };

  const handleAdmin = () => {
    try {
      setScreen('admin');
      clearError();
    } catch (error) {
      console.error('Error navigating to admin:', handleError(error, 'navigate admin'));
    }
  };

  // Loading state
  if (gameState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-green-500 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (gameState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{gameState.error}</p>
          <button
            onClick={clearError}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState.currentScreen === 'home') {
    return (
      <HomeScreen
        onStartGame={handleStartGame}
        onLevelSelect={handleLevelSelect}
        onAbout={handleAbout}
        onAdmin={handleAdmin}
        onSwitchUser={handleSwitchUser}
        gameProgress={gameState.gameProgress}
        currentUser={currentUser}
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

  if (gameState.currentScreen === 'admin') {
    return <AdminLayout />;
  }

  return null;
}

export default function WrappedApp() {
  const handleAppReset = () => {
    // Force reload the page to reset everything
    window.location.reload();
  };

  const handleGoHome = () => {
    // Try to reset to home screen
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <ErrorBoundary onReset={handleAppReset} onHome={handleGoHome}>
      <DndProvider backend={HTML5Backend}>
        <DragProvider>
          <App />
        </DragProvider>
      </DndProvider>
    </ErrorBoundary>
  );
}