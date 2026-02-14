// src/lib/error-handler.ts - Centralized Error Handling System
// Provides user-friendly messages while logging technical details

// Error types for categorization
export type ErrorType = 
  | 'AUTH_REQUIRED'
  | 'AUTH_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'ROLE_REQUIRED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMITED'
  | 'ENCODING_ERROR'
  | 'UNKNOWN';

export interface AppError {
  type: ErrorType;
  message: string; // User-friendly message
  technicalDetails?: string; // For logging
  code?: string;
  statusCode?: number;
  action?: 'login' | 'retry';
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string; action?: string }> = {
  AUTH_REQUIRED: {
    title: 'Login Required',
    message: 'Please log in to access this feature.',
    action: 'login'
  },
  AUTH_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    action: 'login'
  },
  PERMISSION_DENIED: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'retry'
  },
  ROLE_REQUIRED: {
    title: 'Insufficient Access Level',
    message: 'Your access level doesn\'t support this feature.',
    action: 'retry'
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    action: 'retry'
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'retry'
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'retry'
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later or contact support.',
    action: 'retry'
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment and try again.',
    action: 'retry'
  },
  ENCODING_ERROR: {
    title: 'Data Error',
    message: 'There was an error processing the data. Please refresh the page.',
    action: 'retry'
  },
  UNKNOWN: {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'retry'
  }
};

class ErrorHandler {
  private static logs: Array<{
    timestamp: Date;
    type: ErrorType;
    message: string;
    technical: string;
    userId?: string;
    path?: string;
  }> = [];

  /**
   * Parse API error response into AppError
   */
  static parseApiError(error: any, statusCode?: number): AppError {
    const errorMessage = error?.message || error?.error || String(error);
    
    // Determine error type based on status code or message
    let type: ErrorType = 'UNKNOWN';
    
    if (statusCode === 401) {
      type = errorMessage.toLowerCase().includes('expired') ? 'AUTH_EXPIRED' : 'AUTH_REQUIRED';
    } else if (statusCode === 403) {
      type = errorMessage.toLowerCase().includes('role') ? 'ROLE_REQUIRED' : 'PERMISSION_DENIED';
    } else if (statusCode === 404) {
      type = 'NOT_FOUND';
    } else if (statusCode === 400) {
      type = 'VALIDATION_ERROR';
    } else if (statusCode === 429) {
      type = 'RATE_LIMITED';
    } else if (statusCode && statusCode >= 500) {
      type = 'SERVER_ERROR';
    } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
      type = 'NETWORK_ERROR';
    } else if (errorMessage.toLowerCase().includes('btoa') || errorMessage.toLowerCase().includes('latin1')) {
      type = 'ENCODING_ERROR';
    }

    const errorInfo = ERROR_MESSAGES[type];
    
    return {
      type,
      message: errorInfo.message,
      technicalDetails: errorMessage,
      statusCode,
      action: errorInfo.action as AppError['action']
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(type: ErrorType): { title: string; message: string } {
    return ERROR_MESSAGES[type] || ERROR_MESSAGES.UNKNOWN;
  }

  /**
   * Log error internally (in production, send to logging service)
   */
  static logError(error: AppError, context?: { userId?: string; path?: string; action?: string }): void {
    const logEntry = {
      timestamp: new Date(),
      type: error.type,
      message: error.message,
      technical: error.technicalDetails || '',
      userId: context?.userId,
      path: context?.path
    };

    // Store in memory (in production, use external logging)
    this.logs.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Console log for development
    console.error(`[${logEntry.timestamp.toISOString()}] ${error.type}:`, {
      message: error.message,
      technical: error.technicalDetails,
      context
    });
  }

  /**
   * Get recent error logs
   */
  static getRecentLogs(limit: number = 50): typeof this.logs {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Handle and display error (returns user-friendly info)
   */
  static handle(error: any, context?: { userId?: string; path?: string }): AppError {
    const appError = this.parseApiError(error, error?.status || error?.statusCode);
    this.logError(appError, context);
    return appError;
  }

  /**
   * Create permission denied error with context
   */
  static permissionDenied(): AppError {
    return {
      type: 'PERMISSION_DENIED',
      message: ERROR_MESSAGES.PERMISSION_DENIED.message,
      action: 'retry'
    };
  }

  /**
   * Safe base64 encoding (Unicode-safe)
   */
  static safeBase64Encode(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (error) {
      this.logError({
        type: 'ENCODING_ERROR',
        message: 'Failed to encode data',
        technicalDetails: String(error)
      });
      throw new Error('Encoding failed');
    }
  }

  /**
   * Safe base64 decoding (Unicode-safe)
   */
  static safeBase64Decode(encoded: string): any {
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(decoded);
    } catch (error) {
      this.logError({
        type: 'ENCODING_ERROR',
        message: 'Failed to decode data',
        technicalDetails: String(error)
      });
      throw new Error('Decoding failed');
    }
  }
}

export default ErrorHandler;
