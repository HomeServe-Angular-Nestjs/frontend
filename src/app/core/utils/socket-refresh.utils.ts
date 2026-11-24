import { HttpErrorResponse } from '@angular/common/http';

export function isTransientSocketRefreshError(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse &&
    (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
}

export function isUnauthorizedSocketRefreshError(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse && error.status === 401;
}

export async function retryTransientSocketRefresh<T>(
  refresh: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await refresh();
    } catch (error) {
      if (!isTransientSocketRefreshError(error) || retries >= maxRetries) {
        throw error;
      }

      const delay = 500 * (2 ** retries) + Math.floor(Math.random() * 251);
      retries += 1;
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
}
