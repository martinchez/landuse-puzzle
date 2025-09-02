// Import necessary dependencies
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';         // React DnD hook for drop functionality
import { motion } from 'framer-motion';       // Animation library
import { Tile, LandCoverType } from '../types/game';
import { LAND_COVER_CONFIG, playSound } from '../utils/gameUtils';

// Define props interface for GameTile component
interface GameTileProps {
  tile: Tile;                    // Tile data containing image and label information
  onDrop: (tileId: string, labelType: LandCoverType) => void;  // Callback when label is dropped
  showHint?: boolean;            // Flag to show/hide hints
}

export const GameTile: React.FC<GameTileProps> = ({ tile, onDrop, showHint }) => {
  // State to manage visual feedback when dropping labels
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);

  // Setup drop functionality using react-dnd
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'label',  // Accept only items of type 'label'
    drop: (item: { labelType: LandCoverType }) => {
      // Check if dropped label matches the correct label
      const isCorrect = item.labelType === tile.correctLabel;
      setFeedbackType(isCorrect ? 'correct' : 'incorrect');
      playSound(isCorrect ? 'success' : 'error');
      
      // Reset feedback after animation
      setTimeout(() => setFeedbackType(null), 1000);
      onDrop(tile.id, item.labelType);
    },
    // Collect drop state information
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Helper variables for tile state
  const isAssigned = !!tile.assignedLabel;
  const isCorrect = tile.assignedLabel === tile.correctLabel;
  const config = tile.assignedLabel ? LAND_COVER_CONFIG[tile.assignedLabel] : null;

  return (
    // Main container with animation capabilities
    <motion.div
      ref={drop}
      className={`
        relative aspect-square rounded-lg overflow-hidden border-4 cursor-pointer
        ${isOver && canDrop ? 'border-blue-400 border-dashed' : 'border-transparent'}
        ${isAssigned && isCorrect ? 'border-green-400' : ''}
        ${isAssigned && !isCorrect ? 'border-red-400' : ''}
        ${showHint && !isAssigned ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
      `}
      // Animation properties for feedback
      initial={{ scale: 1 }}
      animate={{
        scale: feedbackType === 'correct' ? [1, 1.1, 1] : 
               feedbackType === 'incorrect' ? [1, 0.95, 1.05, 0.95, 1] : 1,
        boxShadow: feedbackType === 'correct' ? '0 0 20px rgba(34, 197, 94, 0.6)' : 
                   feedbackType === 'incorrect' ? '0 0 20px rgba(239, 68, 68, 0.6)' : 
                   '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Base tile image */}
      <img
        src={tile.imageUrl}
        alt="Satellite tile"
        className="w-full h-full object-cover"
      />
      
      {/* Overlay showing assigned label status */}
      {isAssigned && (
        <motion.div
          className={`
            absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center
            ${isCorrect ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center text-white">
            <div className="text-4xl mb-1">{config?.emoji}</div>
            <div className="text-xs font-bold">{config?.name}</div>
            {isCorrect && <div className="text-2xl mt-1">✅</div>}
            {!isCorrect && <div className="text-2xl mt-1">❌</div>}
          </div>
        </motion.div>
      )}

      {/* Hint overlay showing correct label */}
      {showHint && !isAssigned && (
        <motion.div
          className="absolute inset-0 bg-yellow-400 bg-opacity-30 flex items-center justify-center"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-4xl">
            {LAND_COVER_CONFIG[tile.correctLabel].emoji}
          </div>
        </motion.div>
      )}

      {/* Visual indicator for active drop zone */}
      {isOver && canDrop && !isAssigned && (
        <div className="absolute inset-0 bg-blue-400 bg-opacity-40 flex items-center justify-center">
          <div className="text-white text-2xl font-bold">Drop Here!</div>
        </div>
      )}
    </motion.div>
  );
};