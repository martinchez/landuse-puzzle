import { apiClient } from '../utils/api';
import { UserStats, GameSession, ErrorAnalytics, DashboardMetrics } from '../types/adminTypes';
import { getMockDashboardMetrics, getMockUserStats, getMockUserDetails } from './mockData';

class AdminService {
  async getDashboardMetrics(): Promise<DashboardMetrics | null> {
    try {
      console.log('Fetching dashboard metrics from: /admin/dashboard/metrics');
      const response = await apiClient.get<DashboardMetrics>('/admin/dashboard/metrics');
      console.log('Dashboard metrics response:', response);
      
      if (response.success && response.data) {
        console.log('Successfully fetched real dashboard metrics');
        return response.data;
      } else {
        console.warn('Dashboard metrics request succeeded but no data returned');
        throw new Error('No data returned from dashboard metrics API');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      console.log('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // For debugging, let's fall back to mock data but log that we're doing so
      console.warn('Falling back to mock data due to API error');
      return await getMockDashboardMetrics();
    }
  }

  async getUserStats(page = 1, limit = 50, sortBy = 'totalScore', sortOrder = 'desc'): Promise<{
    users: UserStats[];
    total: number;
    page: number;
    totalPages: number;
  } | null> {
    try {
      // Map frontend camelCase to backend snake_case temporarily
      const backendSortBy = sortBy === 'totalScore' ? 'total_score' 
                          : sortBy === 'totalGamesPlayed' ? 'total_games_played'
                          : sortBy === 'highestLevel' ? 'highest_level' 
                          : 'total_score'; // default fallback
      
      const response = await apiClient.get<{
        users: UserStats[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/users?page=${page}&limit=${limit}&sortBy=${backendSortBy}&sortOrder=${sortOrder}`);
      return response.success ? response.data! : null;
    } catch (error) {
      console.error('Failed to fetch user stats, using mock data:', error);
      // Fallback to mock data for demo purposes
      return await getMockUserStats();
    }
  }

  async getUserDetails(userId: string): Promise<{
    user: UserStats;
    recentSessions: GameSession[];
    recentErrors: ErrorAnalytics[];
  } | null> {
    try {
      const response = await apiClient.get<{
        user: UserStats;
        recentSessions: GameSession[];
        recentErrors: ErrorAnalytics[];
      }>(`/admin/users/${userId}`);
      return response.success ? response.data! : null;
    } catch (error) {
      console.error('Failed to fetch user details, using mock data:', error);
      // Fallback to mock data for demo purposes
      return await getMockUserDetails(userId);
    }
  }

  async getErrorLogs(
    page = 1, 
    limit = 50, 
    level?: 'error' | 'warning' | 'info',
    resolved?: boolean
  ): Promise<{
    errors: ErrorAnalytics[];
    total: number;
    page: number;
    totalPages: number;
  } | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (level) params.append('level', level);
      if (resolved !== undefined) params.append('resolved', resolved.toString());

      const response = await apiClient.get<{
        errors: ErrorAnalytics[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/errors?${params}`);
      return response.success ? response.data! : null;
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      return null;
    }
  }

  async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      const response = await apiClient.put<{ success: boolean }>(`/admin/errors/${errorId}/resolve`, {});
      return response.success;
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }
  }

  async getGameSessions(
    page = 1,
    limit = 50,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    sessions: GameSession[];
    total: number;
    page: number;
    totalPages: number;
  } | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (userId) params.append('userId', userId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<{
        sessions: GameSession[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/sessions?${params}`);
      return response.success ? response.data! : null;
    } catch (error) {
      console.error('Failed to fetch game sessions:', error);
      return null;
    }
  }

  async exportData(dataType: 'users' | 'sessions' | 'errors', format: 'csv' | 'json' = 'csv'): Promise<Blob | null> {
    try {
      const API_BASE_URL = 'http://localhost:3001/api'; // Fallback URL
      const response = await fetch(`${API_BASE_URL}/admin/export/${dataType}?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('admin-token') || localStorage.getItem('auth-token') || '';
  }
}

export const adminService = new AdminService();
