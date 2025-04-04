// store/auth/selectors/auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCheckStatus = createSelector(
    selectAuthState,
    (state: AuthState) => state.status
);

export const selectAuthUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.user
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);

export const selectAuthUserType = createSelector(
    selectAuthState,
    (state: AuthState) => state.type
);