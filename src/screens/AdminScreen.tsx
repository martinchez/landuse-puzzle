import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Database, BarChart3 } from 'lucide-react';
import { GameProgress, LevelStats } from '../types/game';

interface AdminScreenProps {
  onBack: () => void;
  gameProgress: GameProgress;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack, gameProgress }) => {
  const [csvData, setCsvData] = useState<string>('');

  useEffect(() => {
    // Generate CSV data
    const headers = ['Level ID', 'Attempts', 'Completions', 'Failed Attempts', 'Avg Score', 'Avg Time (s)'];
    const rows = Object.entries(gameProgress.levelStatistics).map(([levelId, stats]) => [
      levelId,
      stats.attempts,
      stats.completions,
      stats.failedAttempts,
      stats.averageScore.toFixed(2),
      stats.averageTimeSpent.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    setCsvData(csv);
  }, [gameProgress]);

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-statistics-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToDatabase = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          statistics: gameProgress.levelStatistics,
          totalStars: gameProgress.totalStars,
          unlockedLevels: gameProgress.unlockedLevels,
          mostPlayed: gameProgress.mostPlayedLevelId,
          mostFailed: gameProgress.mostFailedLevelId,
          mostCompleted: gameProgress.mostCompletedLevelId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data to database');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <div className="w-20"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Total Progress</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Total Stars: {gameProgress.totalStars}</p>
              <p className="text-gray-600">Unlocked Levels: {gameProgress.unlockedLevels}</p>
              <p className="text-gray-600">
                Badges Earned: {gameProgress.badges.filter(b => b.earned).length}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Most Active</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Most Played: Level {gameProgress.mostPlayedLevelId || 'N/A'}
              </p>
              <p className="text-gray-600">
                Most Failed: Level {gameProgress.mostFailedLevelId || 'N/A'}
              </p>
              <p className="text-gray-600">
                Most Completed: Level {gameProgress.mostCompletedLevelId || 'N/A'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Actions</h3>
            <div className="space-y-4">
              <button
                onClick={downloadCSV}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 
                         rounded-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={exportToDatabase}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 
                         rounded-lg flex items-center justify-center space-x-2"
              >
                <Database className="w-5 h-5" />
                <span>Export to Database</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Detailed Stats Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6" />
              <span>Level Statistics</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(gameProgress.levelStatistics).map(([levelId, stats]) => (
                  <tr key={levelId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Level {levelId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.completions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.failedAttempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.averageScore.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.averageTimeSpent.toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};