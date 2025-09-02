import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { LandCoverType } from '../types/game';
import { LAND_COVER_CONFIG } from '../utils/gameUtils';

interface LandCoverLabelProps {
  type: LandCoverType;
}

export const LandCoverLabel: React.FC<LandCoverLabelProps> = ({ type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'label',
    item: { labelType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const config = LAND_COVER_CONFIG[type];

  return (
    <motion.div
      ref={drag}
      className={`
        cursor-pointer select-none p-4 rounded-xl shadow-lg border-2 border-white
        ${config.color} text-white font-bold text-center
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:scale-105
        transition-all duration-200
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="text-3xl mb-2">{config.emoji}</div>
      <div className="text-sm font-semibold">{config.name}</div>
    </motion.div>
  );
};