import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { GameGrid } from '../components/GameGrid';
import { LabelPanel } from '../components/LabelPanel';
import { GameHeader } from '../components/GameHeader';
import { Level, Tile, LandCoverType, GameProgress } from '../types/game';
import { calculateStars, playSound } from '../utils/gameUtils';

interface GameScreenProps {
  level: Level;
  gameProgress: GameProgress;
  onLevelComplete: (stars: number) => void;
  onHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  level, 
  gameProgress, 
  onLevelComplete, 
  onHome 
}) => {
  const [tiles, setTiles] = useState<Tile[]>(level.tiles.map(t => ({ ...t, assignedLabel: undefined })));
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const correctAnswers = tiles.filter(tile => tile.assignedLabel === tile.correctLabel).length;
  const currentStars = calculateStars(correctAnswers, tiles.length);

  useEffect(() => {
    if (correctAnswers === tiles.length) {
      playSound('complete');
      setTimeout(() => onLevelComplete(currentStars), 1000);
    }
  }, [correctAnswers, tiles.length, currentStars, onLevelComplete]);

  const handleTileDrop = (tileId: string, labelType: LandCoverType) => {
    setTiles(prev => prev.map(tile => 
      tile.id === tileId ? { ...tile, assignedLabel: labelType } : tile
    ));
  };

  const handleHint = () => {
    if (hintsUsed < 3) {
      setShowHints(true);
      setHintsUsed(prev => prev + 1);
      setTimeout(() => setShowHints(false), 3000);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-green-500 p-4">
        <div className="max-w-6xl mx-auto">
          <GameHeader
            levelTitle={level.title}
            currentStars={currentStars}
            totalTiles={tiles.length}
            correctAnswers={correctAnswers}
            onHint={handleHint}
            onHome={onHome}
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
  );
};