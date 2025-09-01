import React from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw, Home, ArrowRight } from 'lucide-react';
import { Badge } from '../types/game';

interface ResultsScreenProps {
  levelTitle: string;
  stars: number;
  correctAnswers: number;
  totalTiles: number;
  newBadges: Badge[];
  onReplay: () => void;
  onNextLevel: () => void;
  onHome: () => void;
  hasNextLevel: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  levelTitle,
  stars,
  correctAnswers,
  totalTiles,
  newBadges,
  onReplay,
  onNextLevel,
  onHome,
  hasNextLevel
}) => {
  const percentage = Math.round((correctAnswers / totalTiles) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Complete!</h2>
          <h3 className="text-xl text-gray-600">{levelTitle}</h3>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center space-x-2 mb-6"
        >
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + star * 0.2, duration: 0.5 }}
            >
              <Star 
                className={`w-12 h-12 ${star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Score */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-2xl font-bold text-gray-800 mb-2">{percentage}% Correct</div>
          <div className="text-gray-600">{correctAnswers} out of {totalTiles} tiles</div>
        </div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <h4 className="text-lg font-bold text-gray-800 mb-3">New Badges Earned!</h4>
            <div className="space-y-2">
              {newBadges.map((badge) => (
                <div key={badge.id} className="bg-yellow-100 rounded-lg p-3 flex items-center space-x-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {hasNextLevel && (
            <motion.button
              onClick={onNextLevel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 
                       rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Next Level</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            onClick={onReplay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 
                     rounded-xl shadow-lg flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </motion.button>

          <motion.button
            onClick={onHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 
                     rounded-xl shadow-lg flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};