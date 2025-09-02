// Import required dependencies
import React from 'react';
import { motion } from 'framer-motion';          // For animations
import { LandCoverLabel } from './LandCoverLabel';  // Custom label component
import { LandCoverType, Tile } from '../types/game'; // Type definitions

// Define the props interface for the LabelPanel component
interface LabelPanelProps {
  availableLabels: LandCoverType[];  // Array of available label types
  tiles: Tile[];                     // Array of game tiles
}

// LabelPanel component displays draggable land cover labels and their usage statistics
export const LabelPanel: React.FC<LabelPanelProps> = ({ availableLabels, tiles }) => {
  // Calculate how many times a specific label type has been used
  const getUsedCount = (labelType: LandCoverType): number => {
    return tiles.filter(tile => tile.assignedLabel === labelType).length;
  };

  // Calculate how many instances of a specific label type are needed in total
  const getNeededCount = (labelType: LandCoverType): number => {
    return tiles.filter(tile => tile.correctLabel === labelType).length;
  };

  return (
    // Main container for the label panel
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      {/* Panel title */}
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Land Cover Types</h3>
      {/* Container for label items */}
      <div className="space-y-4">
        {/* Map through available labels and create animated containers */}
        {availableLabels.map((labelType, index) => (
          // Animated container for each label
          <motion.div
            key={labelType}
            initial={{ opacity: 0, x: 20 }}         // Initial animation state
            animate={{ opacity: 1, x: 0 }}          // Final animation state
            transition={{ delay: index * 0.1 }}     // Stagger animation delay
            className="relative"
          >
            {/* Draggable label component */}
            <LandCoverLabel 
              type={labelType} 
              isUsed={getUsedCount(labelType) >= getNeededCount(labelType)}  // Disable if all instances used
            />
            {/* Usage counter display */}
            <div className="text-xs text-gray-600 text-center mt-2">
              {getUsedCount(labelType)}/{getNeededCount(labelType)} used
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};