import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Satellite, Globe, Camera } from 'lucide-react';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
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
          <h1 className="text-4xl font-bold text-white">About Satellites</h1>
          <div className="w-20"></div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-4">
              <Satellite className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">What are Satellites?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Satellites are like super high-flying cameras that orbit around Earth! They take pictures 
              from space to help us understand what's happening on our planet. Scientists use these 
              pictures to study forests, oceans, cities, and farms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-4">
              <Camera className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">How Do They Work?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Satellites use special cameras that can see different types of light. This helps them 
              tell the difference between forests (which look green), water (which looks blue), 
              and cities (which look gray) from way up in space!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-4">
              <Globe className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">Why is This Important?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              By studying satellite images, scientists can track how our planet changes over time. 
              They can see if forests are growing or shrinking, if cities are expanding, or if 
              climate change is affecting different areas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-800">Your Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              In this game, you become a satellite image analyst! Your job is to look at satellite 
              pictures and identify what type of land cover you see. Are you ready to help classify 
              Earth from space?
            </p>
          </motion.div>
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-6"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Fun Satellite Facts! 🚀</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌍</span>
              <span>Satellites can circle Earth in about 90 minutes!</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📸</span>
              <span>Some satellites can see objects as small as a car!</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌡️</span>
              <span>Satellites help predict the weather you see on TV!</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🗺️</span>
              <span>GPS in your phone uses satellites to know where you are!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};