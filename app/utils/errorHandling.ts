import { Platform } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (
  error: unknown,
  context: string,
  appError?: AppError,
): void => {
  if (appError) {
    console.error(`[${context}] ${appError.code}: ${appError.message}`, appError.details);
  } else if (error instanceof AppError) {
    console.error(`[${context}] ${error.code}: ${error.message}`, error.details);
  } else if (error instanceof Error) {
    console.error(`[${context}] Unexpected error: ${error.message}`);
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }

  // In production, you might want to send this to a logging service
  if (__DEV__) {
    console.warn('Error details:', error);
  }
};

export const createError = (
  message: string,
  code: string,
  details?: any,
): AppError => {
  return new AppError(message, code, details);
};

// Platform-specific error handling
export const handlePlatformError = (error: unknown, context: string): void => {
  const platform = Platform.OS;
  handleError(error, `${context} (${platform})`);
}; 