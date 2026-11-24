import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, flush, flushMicrotasks } from '@angular/core/testing';
import {
  isTransientSocketRefreshError,
  isUnauthorizedSocketRefreshError,
  retryTransientSocketRefresh,
} from './socket-refresh.utils';

describe('socket refresh utilities', () => {
  it('classifies retryable and unauthorized responses separately', () => {
    expect(isTransientSocketRefreshError(new HttpErrorResponse({ status: 0 }))).toBeTrue();
    expect(isTransientSocketRefreshError(new HttpErrorResponse({ status: 503 }))).toBeTrue();
    expect(isTransientSocketRefreshError(new HttpErrorResponse({ status: 429 }))).toBeTrue();
    expect(isUnauthorizedSocketRefreshError(new HttpErrorResponse({ status: 401 }))).toBeTrue();
    expect(isTransientSocketRefreshError(new HttpErrorResponse({ status: 401 }))).toBeFalse();
  });

  it('retries transient failures at most three times', fakeAsync(() => {
    let attempts = 0;
    let completed = false;

    retryTransientSocketRefresh(async () => {
      attempts += 1;
      if (attempts <= 3) throw new HttpErrorResponse({ status: 503 });
    }).then(() => completed = true);

    flush();
    flushMicrotasks();

    expect(attempts).toBe(4);
    expect(completed).toBeTrue();
  }));
});
