0import React, { useEffect } from 'react';
import { AlertTriangle, X, Wifi, WifiOff } from 'lucide-react';
import { errorService } from '../services/errorService';

interface ErrorNotificationProps {
  error: string;
  onDismiss: () => void;
  type?: 'error' | 'warning' | 'info';
  context?: string;
  gameState?: any;
  autoSave?: boolean;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  type = 'error',
  context,
  gameState,
  autoSave = true
}) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (autoSave) {
      // Log error to backend with admin-trackable context
      errorService.logError(error, context, type, gameState);
    }
  }, [error, context, type, gameState, autoSave]);
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-red-100 border-red-400 text-red-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'info':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleRetrySubmission = () => {
    errorService.retrySubmission();
  };

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 border rounded-lg shadow-lg z-50 ${getStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                {type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}
              </p>
              {/* Connection status indicator */}
              {isOnline ? (
                <div title="Online - errors saved to server">
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <div title="Offline - errors saved locally">
                  <WifiOff className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
            <p className="text-sm mt-1">{error}</p>
            {context && (
              <p className="text-xs mt-1 opacity-75">Context: {context}</p>
            )}
            {!isOnline && (
              <button
                onClick={handleRetrySubmission}
                className="text-xs mt-2 underline hover:no-underline"
              >
                Retry when online
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 inline-flex text-current hover:opacity-75"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
