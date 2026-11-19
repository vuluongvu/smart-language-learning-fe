import { HttpErrorResponse } from '@angular/common/http';

export function extractApiError(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error;
    if (body && typeof body === 'object') {
      const nested = (body as { message?: unknown }).message;
      if (typeof nested === 'string' && nested.trim()) {
        return nested;
      }
      if (nested && typeof nested === 'object') {
        const innerMsg = (nested as { message?: unknown }).message;
        if (Array.isArray(innerMsg) && innerMsg.length > 0) {
          return String(innerMsg[0]);
        }
        if (typeof innerMsg === 'string' && innerMsg.trim()) {
          return innerMsg;
        }
      }
    }
    if (error.status === 0) {
      return 'Unable to reach the server. Please check your connection.';
    }
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function detectBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch {
    return 'UTC';
  }
}
