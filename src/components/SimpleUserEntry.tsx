import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, School, Calendar } from 'lucide-react';

interface SimpleUserEntryProps {
  onUserCreate: (userData: { name: string; age?: number; school?: string }) => void;
}

export const SimpleUserEntry: React.FC<SimpleUserEntryProps> = ({ onUserCreate }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        console.log('Submitting user data:', {
          name: name.trim(),
          age: age ? parseInt(age) : undefined,
          school: school.trim() || undefined
        });
        
        await onUserCreate({
          name: name.trim(),
          age: age ? parseInt(age) : undefined,
          school: school.trim() || undefined
        });
        
        // Don't set isSubmitting to false here, let the parent component handle the navigation
        console.log('User creation completed successfully');
      } catch (error) {
        console.error('Error creating user:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🛰️ Welcome!
          </h1>
          <p className="text-gray-600">
            Tell us about yourself to start playing
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              What's your name? *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
              maxLength={50}
            />
          </motion.div>
          
          {/* Age Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="form-group"
          >
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <Calendar className="w-5 h-5 mr-2 text-green-500" />
              How old are you?
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              min="5"
              max="18"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-lg"
            />
          </motion.div>
          
          {/* School Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="form-group"
          >
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <School className="w-5 h-5 mr-2 text-purple-500" />
              What school do you go to?
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="School name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-lg"
              maxLength={100}
            />
          </motion.div>
          
          {/* Submit Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                     disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                     text-white font-bold py-4 px-8 rounded-lg shadow-lg 
                     flex items-center justify-center space-x-3 text-xl
                     transition-all transform hover:scale-105"
            whileHover={{ scale: !name.trim() ? 1 : 1.05 }}
            whileTap={{ scale: !name.trim() ? 1 : 0.95 }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <span>Start Playing!</span>
                <span>🎮</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          * Required field
        </motion.p>
      </motion.div>
    </div>
  );
};
