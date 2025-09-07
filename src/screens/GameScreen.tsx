import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { GameGrid } from '../components/GameGrid';
import { LabelPanel } from '../components/LabelPanel';
import { GameHeader } from '../components/GameHeader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Level, Tile, LandCoverType, GameProgress } from '../types/game';
import { AuthService } from '../services/authService';
import { withErrorHandling, calculateStars, playSound, handleError } from '../utils/gameUtils';
import { randomizeLevelImages } from '../utils/imageUtils';
import { logImageClassificationError, logCorrectImageClassification } from '../utils/imageClassificationLogger';

interface GameScreenProps {
  level: Level;
  gameProgress: GameProgress;
  onLevelComplete: (stars: number, playTimeMinutes?: number) => void;
  onHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  level, 
  gameProgress, 
  onLevelComplete, 
  onHome 
}) => {
  // Initialize tiles with randomized images on level start
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const randomizedTiles = randomizeLevelImages(level.tiles);
    return randomizedTiles.map(t => ({ ...t, assignedLabel: undefined }));
  });
  
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gameStartTime] = useState<number>(() => Date.now());

  const correctAnswers = tiles.filter(tile => tile.assignedLabel === tile.correctLabel).length;
  const currentStars = calculateStars(correctAnswers, tiles.length);

  useEffect(() => {
    try {
      if (correctAnswers === tiles.length) {
        playSound('complete');
        
        // Calculate play time in minutes
        const playTimeMinutes = Math.round((Date.now() - gameStartTime) / (1000 * 60));
        
        setTimeout(() => onLevelComplete(currentStars, playTimeMinutes), 1000);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'level completion');
      setError(errorMessage);
    }
  }, [correctAnswers, tiles.length, currentStars, onLevelComplete, gameStartTime]);

  const handleTileDrop = (tileId: string, labelType: LandCoverType) => {
    try {
      // Find the tile being classified
      const tile = tiles.find(t => t.id === tileId);
      if (!tile) {
        console.error('Tile not found:', tileId);
        return;
      }

      // Extract image name from URL for logging
      const imageName = tile.imageUrl.split('/').pop()?.split('?')[0] || 'unknown';
      
      // Log the classification attempt
      if (labelType === tile.correctLabel) {
        // Correct classification
        console.log(`✅ Correct classification: ${imageName} as ${labelType}`);
        const user = AuthService.getCurrentUser();
        logCorrectImageClassification(
          imageName,
          labelType,
          level.id,
          user?.user_id
        );
        
        // Play success sound
        playSound('success');
      } else {
        // Incorrect classification
        console.log(`❌ Wrong classification: ${imageName} as ${labelType}, should be ${tile.correctLabel}`);
        const user = AuthService.getCurrentUser();
        logImageClassificationError({
          imageName,
          userAttempt: labelType,
          correctAnswer: tile.correctLabel,
          gameLevel: level.id,
          userId: user?.user_id,
          additionalContext: `Level: ${level.title}, Tile ID: ${tileId}`
        });
        
        // Play error sound
        playSound('error');
      }

      // Update tile state
      setTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, assignedLabel: labelType } : t
      ));
      setError(null); // Clear any previous errors
    } catch (error) {
      const errorMessage = handleError(error, 'tile drop');
      setError(errorMessage);
    }
  };

  const handleHint = () => {
    try {
      if (hintsUsed < 3) {
        setShowHints(true);
        setHintsUsed(prev => prev + 1);
        setTimeout(() => setShowHints(false), 3000);
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      const errorMessage = handleError(error, 'hint display');
      setError(errorMessage);
    }
  };

  const handleRetry = () => {
    try {
      // Reset tiles with new random images
      const randomizedTiles = randomizeLevelImages(level.tiles);
      setTiles(randomizedTiles.map(t => ({ ...t, assignedLabel: undefined })));
      setShowHints(false);
      setHintsUsed(0);
      setError(null);
    } catch (error) {
      const errorMessage = handleError(error, 'level retry');
      setError(errorMessage);
    }
  };

  const handleRandomizeImages = () => {
    try {
      // Randomize images while preserving assignments and correct labels
      const randomizedTiles = randomizeLevelImages(level.tiles);
      const updatedTiles = randomizedTiles.map(randomizedTile => {
        // Find the corresponding current tile to preserve its assigned label
        const currentTile = tiles.find(t => t.id === randomizedTile.id);
        return {
          ...randomizedTile,
          assignedLabel: currentTile?.assignedLabel
        };
      });
      setTiles(updatedTiles);
      
      // Play a sound effect for feedback
      playSound('success');
      
      setError(null);
    } catch (error) {
      const errorMessage = handleError(error, 'image randomization');
      setError(errorMessage);
    }
  };

  const handleErrorRetry = () => {
    setError(null);
    handleRetry();
  };

  return (
    <ErrorBoundary onReset={handleErrorRetry} onHome={onHome}>
      <DndProvider backend={HTML5Backend}>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Error: {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-green-500 p-4">
          <div className="max-w-6xl mx-auto">
            <GameHeader
              levelTitle={level.title}
              currentStars={currentStars}
              totalTiles={tiles.length}
              correctAnswers={correctAnswers}
              onHint={handleHint}
              onHome={onHome}
              onRetry={handleRetry}
              onRandomizeImages={handleRandomizeImages}
              hintsUsed={hintsUsed}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Game Grid */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <GameGrid
                    tiles={tiles}
                    gridSize={level.gridSize}
                    onTileDrop={handleTileDrop}
                    showHints={showHints}
                  />
                </motion.div>
              </div>

              {/* Label Panel */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <LabelPanel
                    availableLabels={level.availableLabels}
                    tiles={tiles}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
};