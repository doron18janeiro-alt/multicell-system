/**
 * Centralized error handling utility
 * Provides consistent error logging and user-friendly messages
 */

/**
 * Log error to console (can be extended to send to monitoring service)
 */
export function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    ...(error?.code && { code: error.code }),
    ...(error?.details && { details: error.details }),
  };

  console.error('[Error Handler]', errorInfo);
  
  // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
  // if (import.meta.env.PROD) {
  //   sendToMonitoring(errorInfo);
  // }

  return errorInfo;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error) {
  if (!error) return 'Ocorreu um erro inesperado';

  // Supabase specific errors
  if (error.code) {
    switch (error.code) {
      case '23505':
        return 'Este registro já existe no sistema';
      case '23503':
        return 'Não é possível excluir este registro pois está sendo usado';
      case '42501':
        return 'Você não tem permissão para realizar esta ação';
      case 'PGRST116':
        return 'Nenhum registro encontrado';
      default:
        break;
    }
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Erro de conexão. Verifique sua internet';
  }

  // Authentication errors
  if (error.message?.includes('auth') || error.message?.includes('token')) {
    return 'Sessão expirada. Faça login novamente';
  }

  // Return original message if it's user-friendly
  if (error.message && error.message.length < 100) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente';
}

/**
 * Handle async operation with error handling
 */
export async function handleAsync(operation, context = '', fallback = null) {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

/**
 * Create error handler for specific context
 */
export function createErrorHandler(context) {
  return (error) => {
    logError(error, context);
    return getUserMessage(error);
  };
}

/**
 * Check if error is a specific type
 */
export function isAuthError(error) {
  return (
    error?.message?.includes('auth') ||
    error?.message?.includes('token') ||
    error?.code === '42501'
  );
}

export function isNetworkError(error) {
  return (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.name === 'NetworkError'
  );
}

export function isDuplicateError(error) {
  return error?.code === '23505';
}

export function isNotFoundError(error) {
  return error?.code === 'PGRST116' || error?.status === 404;
}
