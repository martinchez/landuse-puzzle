import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Trophy,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DashboardMetrics } from '../../types/adminTypes';

export const DashboardOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics();
      console.log('DashboardOverview received data:', data);
      console.log('topImageFailures:', data?.topImageFailures);
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'users' | 'sessions' | 'errors') => {
    try {
      const blob = await adminService.exportData(type);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load dashboard metrics</p>
        <button 
          onClick={loadMetrics}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('users')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Users
              </button>
              <button
                onClick={() => handleExport('sessions')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Sessions
              </button>
              <button
                onClick={() => handleExport('errors')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Errors
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers?.toLocaleString() || '0'}
          icon={<Users className="w-8 h-8 text-blue-500" />}
          subtitle={`${metrics?.activeUsers || 0} active this week`}
        />
        <MetricCard
          title="Total Games"
          value={metrics?.totalGames?.toLocaleString() || '0'}
          icon={<Trophy className="w-8 h-8 text-green-500" />}
          subtitle="Games completed"
        />
        <MetricCard
          title="Avg Session"
          value={`${metrics?.averageSessionDuration || 0} min`}
          icon={<Clock className="w-8 h-8 text-purple-500" />}
          subtitle="Session duration"
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics?.topErrors && metrics?.totalGames ? 
            ((metrics.topErrors.reduce((sum, e) => sum + e.count, 0) / metrics.totalGames) * 100).toFixed(1) : 
            '0.0'}%`}
          icon={<AlertCircle className="w-8 h-8 text-red-500" />}
          subtitle="Errors per game"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Retention Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Retention</h3>
          <div className="space-y-3">
            <RetentionBar label="Day 1" value={metrics?.userRetention?.day1 || 0} />
            <RetentionBar label="Day 7" value={metrics?.userRetention?.day7 || 0} />
            <RetentionBar label="Day 30" value={metrics?.userRetention?.day30 || 0} />
          </div>
        </div>

        {/* Top Errors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Errors</h3>
          <div className="space-y-3">
            {(metrics?.topErrors || []).slice(0, 5).map((error, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                  {error.error}
                </span>
                <span className="font-medium text-red-600">
                  {error.count}
                </span>
              </div>
            ))}
            {(!metrics?.topErrors || metrics.topErrors.length === 0) && (
              <p className="text-gray-500 text-sm">No errors to display</p>
            )}
          </div>
        </div>

        {/* Most Failed Image Classifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Failed Image Classifications</h3>
          <div className="space-y-3">
            {(() => {
              console.log('Rendering image failures, metrics:', metrics);
              console.log('topImageFailures array:', metrics?.topImageFailures);
              console.log('topImageFailures length:', metrics?.topImageFailures?.length);
              return (metrics?.topImageFailures || []).slice(0, 5).map((failure, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-800">
                          {failure.image_name}
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          Level {failure.game_level}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Attempted: <span className="text-red-600">{failure.classification_attempt}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Correct: <span className="text-green-600">{failure.correct_classification}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        {failure.failure_count} fails
                      </div>
                      <div className="text-xs text-gray-500">
                        {failure.users_affected} users
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}
            {(!metrics?.topImageFailures || metrics.topImageFailures.length === 0) && (
              <p className="text-gray-500 text-sm">No image classification failures to display</p>
            )}
          </div>
        </div>
      </div>

      {/* Level Difficulty Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Level Difficulty Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Completion Rate</th>
                <th className="text-left py-2">Avg Attempts</th>
                <th className="text-left py-2">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.levelDifficulty || []).map((level, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{level.level}</td>
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${level.completionRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{level.completionRate || 0}%</span>
                    </div>
                  </td>
                  <td className="py-2">{level.averageAttempts?.toFixed(1) || '0.0'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      (level.completionRate || 0) > 80 ? 'bg-green-100 text-green-800' :
                      (level.completionRate || 0) > 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {level.completionRate > 80 ? 'Easy' :
                       level.completionRate > 60 ? 'Medium' : 'Hard'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, icon, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {icon}
    </div>
  </div>
);

const RetentionBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-600 w-16">{label}</span>
    <div className="flex-1 mx-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
    <span className="text-sm font-medium text-gray-900 w-12 text-right">{value}%</span>
  </div>
);
