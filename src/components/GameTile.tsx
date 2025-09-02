import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Tile, LandCoverType } from '../types/game';
import { LAND_COVER_CONFIG, playSound } from '../utils/gameUtils';
import { useDragContext } from '../contexts/DragContext';

interface GameTileProps {
  tile: Tile;
  onDrop: (tileId: string, labelType: LandCoverType) => void;
  showHint?: boolean;
}

export const GameTile: React.FC<GameTileProps> = ({ tile, onDrop, showHint }) => {
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const { currentDragItem } = useDragContext();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'label',
    drop: (item: { labelType: LandCoverType }) => {
      const isCorrect = item.labelType === tile.correctLabel;
      setFeedbackType(isCorrect ? 'correct' : 'incorrect');
      playSound(isCorrect ? 'success' : 'error');
      
      setTimeout(() => setFeedbackType(null), 1000);
      onDrop(tile.id, item.labelType);
      return { dropped: true };
    },
    canDrop: () => !tile.assignedLabel && !!currentDragItem,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [tile.id, tile.correctLabel, tile.assignedLabel, currentDragItem, onDrop]);

  const isAssigned = !!tile.assignedLabel;
  const isCorrect = tile.assignedLabel === tile.correctLabel;
  const config = tile.assignedLabel ? LAND_COVER_CONFIG[tile.assignedLabel] : null;

  return (
    <motion.div
      ref={drop} // ✅ drop zone stays attached to the main container
      className={`
        relative aspect-square rounded-lg overflow-hidden border-4 cursor-pointer
        ${isOver && canDrop && !isAssigned ? 'border-blue-400 border-dashed' : 'border-transparent'}
        ${isAssigned && isCorrect ? 'border-green-400' : ''}
        ${isAssigned && !isCorrect ? 'border-red-400' : ''}
        ${showHint && !isAssigned ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
      `}
      initial={{ scale: 1 }}
      animate={{
        scale: feedbackType === 'correct' ? [1, 1.1, 1] :
               feedbackType === 'incorrect' ? [1, 0.95, 1.05, 0.95, 1] : 1,
        boxShadow: feedbackType === 'correct'
          ? '0 0 20px rgba(34, 197, 94, 0.6)'
          : feedbackType === 'incorrect'
          ? '0 0 20px rgba(239, 68, 68, 0.6)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Base tile image */}
      <img src={tile.imageUrl} alt="Satellite tile" className="w-full h-full object-cover" />

      {/* Overlay showing assigned label status */}
      {isAssigned && (
        <motion.div
          className={`
            absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center
            ${isCorrect ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}
            pointer-events-none   // ✅ allow drag to still work
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center text-white pointer-events-none">
            <div className="text-4xl mb-1">{config?.emoji}</div>
            <div className="text-xs font-bold">{config?.name}</div>
            {isCorrect && <div className="text-2xl mt-1">✅</div>}
            {!isCorrect && <div className="text-2xl mt-1">❌</div>}
          </div>
        </motion.div>
      )}

      {/* Hint overlay */}
      {showHint && !isAssigned && (
        <motion.div
          className="absolute inset-0 bg-yellow-400 bg-opacity-30 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-4xl">{LAND_COVER_CONFIG[tile.correctLabel].emoji}</div>
        </motion.div>
      )}

      {/* Drop zone indicator */}
      {isOver && canDrop && !isAssigned && (
        <div className="absolute inset-0 bg-blue-400 bg-opacity-40 flex items-center justify-center pointer-events-none">
          <div className="text-white text-2xl font-bold">Drop Here!</div>
        </div>
      )}
    </motion.div>
  );
};