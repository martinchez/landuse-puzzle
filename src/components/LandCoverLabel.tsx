import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { LandCoverType } from '../types/game';
import { LAND_COVER_CONFIG } from '../utils/gameUtils';
import { useDragContext } from '../contexts/DragContext';

interface LandCoverLabelProps {
  type: LandCoverType;
  isFullyClassified?: boolean;
}

export const LandCoverLabel: React.FC<LandCoverLabelProps> = ({
  type,
  isFullyClassified = false,
}) => {
  const { setIsDragging, setCurrentDragItem } = useDragContext();
  const dragItem = React.useMemo(() => ({ labelType: type }), [type]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'label',
      item: () => {
        setIsDragging(true);
        setCurrentDragItem(dragItem);
        console.log(`🎯 Started dragging ${type} label`);
        return dragItem;
      },
      canDrag: !isFullyClassified,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        setIsDragging(false);
        setCurrentDragItem(null);
        console.log(`🔚 Ended dragging ${type} label`);
      },
    }),
    [dragItem, isFullyClassified, setIsDragging, setCurrentDragItem]
  );

  const config = LAND_COVER_CONFIG[type];

  return (
    <motion.div
      ref={drag}
      className={`
        cursor-grab active:cursor-grabbing select-none p-4 rounded-xl shadow-lg border-2 border-white
        ${config.color} text-white font-bold text-center
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isFullyClassified ? 'opacity-40 grayscale cursor-not-allowed' : ''}
        hover:scale-105 transition-all duration-200
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