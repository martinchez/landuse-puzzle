import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { LandCoverType } from '../types/game';
import { LAND_COVER_CONFIG } from '../utils/gameUtils';

interface LandCoverLabelProps {
  type: LandCoverType;
  isUsed?: boolean;
}

export const LandCoverLabel: React.FC<LandCoverLabelProps> = ({ type, isUsed }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'label',
    item: { labelType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUsed,
  }));

  const config = LAND_COVER_CONFIG[type];

  return (
    <motion.div
      ref={drag}
      className={`
        relative cursor-pointer select-none p-4 rounded-xl shadow-lg border-2 border-white
        ${config.color} text-white font-bold text-center
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
        transition-all duration-200
      `}
      whileHover={!isUsed ? { scale: 1.05 } : {}}
      whileTap={!isUsed ? { scale: 0.95 } : {}}
      animate={{ opacity: isDragging ? 0.5 : (isUsed ? 0.4 : 1) }}
    >
      <div className="text-3xl mb-2">{config.emoji}</div>
      <div className="text-sm font-semibold">{config.name}</div>
      {isUsed && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-xl flex items-center justify-center">
          <span className="text-2xl">✓</span>
        </div>
      )}
    </motion.div>
  );
};