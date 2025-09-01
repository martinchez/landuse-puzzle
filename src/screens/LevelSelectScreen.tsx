import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, ArrowLeft } from 'lucide-react';
import { GameProgress, Level } from '../types/game';

interface LevelSelectScreenProps {
  levels: Level[];
  gameProgress: GameProgress;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ 
  levels, 
  gameProgress, 
  onSelectLevel, 
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Choose Your Level</h1>
          <div className="w-20"></div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            const isUnlocked = gameProgress.unlockedLevels >= level.id;
            const stars = gameProgress.levelStars[level.id] || 0;
            const isCompleted = stars > 0;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
                  ${isUnlocked ? 'hover:shadow-xl' : 'opacity-60'}
                  transition-all duration-300
                `}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
              >
                {/* Level Number Badge */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500 text-white rounded-full 
                              flex items-center justify-center font-bold text-lg z-10">
                  {level.id}
                </div>

                {/* Lock Icon */}
                {!isUnlocked && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gray-400 text-white rounded-full 
                                flex items-center justify-center z-10">
                    <Lock className="w-5 h-5" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 pt-20">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{level.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {level.gridSize}×{level.gridSize} grid • {level.availableLabels.length} categories
                  </p>

                  {/* Stars */}
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {!isUnlocked && (
                      <span className="text-sm text-gray-500">
                        Requires {level.requiredStars} stars
                      </span>
                    )}
                    {isUnlocked && !isCompleted && (
                      <span className="text-sm text-blue-500 font-semibold">
                        Ready to play!
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-sm text-green-500 font-semibold">
                        Completed! 
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};