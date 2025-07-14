import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../../core/models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCheckStatus = createSelector(
    selectAuthState,
    (state: AuthState) => state.status
);

export const selectAuthUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.email
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);

export const selectAuthUserType = createSelector(
    selectAuthState,
    (state: AuthState) => state.type
);

export const selectAuthUserId = createSelector(
    selectAuthState,
    (state) => state.id
);

export const selectShowSubscriptionPage = createSelector(
    selectAuthState,
    (state) => state.showSubscriptionPage
)