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
    const count = tiles.filter((t) => t.assignedLabel === labelType).length;
    console.log(`📊 ${labelType} usage: ${count} tiles`);
    return count;
  };

  const getNeededCount = (labelType: LandCoverType): number => {
    const count = tiles.filter((t) => t.correctLabel === labelType).length;
    console.log(`🎯 ${labelType} needed: ${count} tiles`);
    return count;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Land Cover Types</h3>

      <div className="space-y-4">
        {availableLabels.map((labelType, index) => {
          const used = getUsedCount(labelType);
          const needed = getNeededCount(labelType);
          const isFullyClassified = used >= needed;

          return (
            <motion.div
              key={`label-${labelType}`} // 🔧 ensure stable key; avoids remounting the source
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* 🔧 pass isFullyClassified to control drag enabling & visuals */}
              <LandCoverLabel type={labelType} isFullyClassified={isFullyClassified} />

              <div
                className={`text-xs text-center mt-2 ${
                  isFullyClassified ? 'text-green-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {used}/{needed} used
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
