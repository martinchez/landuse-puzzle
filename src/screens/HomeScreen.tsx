import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';
import { GameProgress } from '../types/game';

interface HomeScreenProps {
  onStartGame: () => void;
  onLevelSelect: () => void;
  onAbout: () => void;
  gameProgress: GameProgress;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartGame, 
  onLevelSelect, 
  onAbout, 
  gameProgress 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🛰️ Land Cover
          </h1>
          <h2 className="text-3xl font-bold text-white mb-2">
            Classifier
          </h2>
          <p className="text-xl text-white opacity-90">
            Learn how satellites see Earth!
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white bg-opacity-20 rounded-xl p-4 mb-8 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center space-x-6 text-white">
            <div className="text-center">
              <Star className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
              <div className="font-bold text-xl">{gameProgress.totalStars}</div>
              <div className="text-sm opacity-80">Stars</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">{gameProgress.unlockedLevels}</div>
              <div className="text-sm opacity-80">Levels</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">
                {gameProgress.badges.filter(b => b.earned).length}
              </div>
              <div className="text-sm opacity-80">Badges</div>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-4">
          <motion.button
            onClick={onStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 
                     rounded-xl shadow-lg flex items-center justify-center space-x-3 text-xl"
          >
            <Play className="w-6 h-6" />
            <span>Start Playing!</span>
          </motion.button>

          <motion.button
            onClick={onLevelSelect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 
                     rounded-xl shadow-lg"
          >
            Select Level
          </motion.button>

          <motion.button
            onClick={onAbout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 
                     rounded-xl shadow-lg flex items-center justify-center space-x-2"
          >
            <Info className="w-5 h-5" />
            <span>About Satellites</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};