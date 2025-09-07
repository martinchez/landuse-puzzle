import { apiClient } from '../utils/api';

export interface ErrorLog {
  id?: string;
  timestamp: string;
  error: string;
  context?: string;
  level: 'error' | 'warning' | 'info';
  userAgent: string;
  url: string;
  userId?: string;
  gameState?: any;
}

export interface ErrorLogResponse {
  id: string;
  timestamp: string;
}

class ErrorService {
  private errorQueue: ErrorLog[] = [];
  private isSubmitting = false;

  async logError(
    error: string, 
    context?: string, 
    level: 'error' | 'warning' | 'info' = 'error',
    gameState?: any,
    metadata?: any
  ): Promise<void> {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error,
      context,
      level,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      gameState,
      ...metadata // Spread any additional metadata
    };

    // Add to queue
    this.errorQueue.push(errorLog);

    // Try to submit immediately
    this.submitErrorLogs();

    // Also save to localStorage as backup
    this.saveToLocalStorage(errorLog);
  }

  private async submitErrorLogs(): Promise<void> {
    if (this.isSubmitting || this.errorQueue.length === 0) {
      return;
    }

    this.isSubmitting = true;

    try {
      const logsToSubmit = [...this.errorQueue];
      const response = await apiClient.post<ErrorLogResponse[]>('/errors/batch', {
        errors: logsToSubmit
      });

      if (response.success) {
        // Clear submitted logs from queue
        this.errorQueue.splice(0, logsToSubmit.length);
        console.log('Error logs submitted successfully');
      } else {
        console.warn('Failed to submit error logs:', response.error);
      }
    } catch (error) {
      console.warn('Error submitting logs:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private saveToLocalStorage(errorLog: ErrorLog): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error-logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 100 errors
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('error-logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to save error to localStorage:', error);
    }
  }

  private getUserId(): string | undefined {
    // Get user ID from localStorage, session, or generate anonymous ID
    let userId = localStorage.getItem('user-id');
    if (!userId) {
      userId = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user-id', userId);
    }
    return userId;
  }

  async getErrorLogs(limit = 50): Promise<ErrorLog[]> {
    try {
      const response = await apiClient.get<ErrorLog[]>(`/errors?limit=${limit}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('error-logs') || '[]');
  }

  // Retry submitting queued errors (useful for offline scenarios)
  retrySubmission(): void {
    this.submitErrorLogs();
  }
}

export const errorService = new ErrorService();
