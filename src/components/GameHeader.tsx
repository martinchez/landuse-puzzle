// Import necessary dependencies
import React from 'react';
import { motion } from 'framer-motion';  // For animations
import { Star, Lightbulb, Home } from 'lucide-react';  // Icons

// Define props interface for GameHeader component
interface GameHeaderProps {
  levelTitle: string;      // Title of the current game level
  currentStars: number;    // Number of stars earned
  totalTiles: number;      // Total number of tiles in the game
  correctAnswers: number;  // Number of correctly classified tiles
  onHint: () => void;      // Callback for hint button click
  onHome: () => void;      // Callback for home button click
  hintsUsed: number;       // Number of hints already used
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  levelTitle, 
  currentStars, 
  totalTiles, 
  correctAnswers, 
  onHint, 
  onHome,
  hintsUsed 
}) => {
  // Calculate progress percentage
  const progress = (correctAnswers / totalTiles) * 100;

  return (
    // Main container with styling
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Header section with title and controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side - Home button and level title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onHome}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{levelTitle}</h2>
        </div>
        
        {/* Right side - Hint button and stars */}
        <div className="flex items-center space-x-4">
          {/* Hint button with remaining hints counter */}
          <button
            onClick={onHint}
            disabled={hintsUsed >= 3}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg 
                     transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Hint ({3 - hintsUsed} left)</span>
          </button>
          
          {/* Star rating display with animations */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: star <= currentStars ? 1 : 0.5 }}
                transition={{ delay: star * 0.1 }}
              >
                <Star 
                  className={`w-6 h-6 ${star <= currentStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Progress counter */}
      <div className="text-center mt-2 text-sm text-gray-600">
        {correctAnswers}/{totalTiles} tiles classified correctly
      </div>
    </div>
  );
};