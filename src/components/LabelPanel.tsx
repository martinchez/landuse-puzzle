import React from 'react';
import { motion } from 'framer-motion';
import { LandCoverLabel } from './LandCoverLabel';
import { LandCoverType, Tile } from '../types/game';

interface LabelPanelProps {
  availableLabels: LandCoverType[];
  tiles: Tile[];
}

export const LabelPanel: React.FC<LabelPanelProps> = ({ availableLabels, tiles }) => {
  const getUsedCount = (labelType: LandCoverType): number => {
    return tiles.filter(tile => tile.assignedLabel === labelType).length;
  };

  const getNeededCount = (labelType: LandCoverType): number => {
    return tiles.filter(tile => tile.correctLabel === labelType).length;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Land Cover Types</h3>
      <div className="space-y-4">
        {availableLabels.map((labelType, index) => (
          <motion.div
            key={labelType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <LandCoverLabel 
              type={labelType} 
            />
            <div className="text-xs text-gray-600 text-center mt-2">
              {getUsedCount(labelType)}/{getNeededCount(labelType)} used
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};