import { createFeature, createReducer, on } from "@ngrx/store";
import { authActions } from "../actions/auth.actions";
import { AuthState } from "../models/auth.model";

export const initialState: AuthState = {
    email: null,
    status: 'pending',
    error: null,
    type: null,
};

export const authFeature = createFeature({
    name: 'auth',
    reducer: createReducer(
        initialState,

        // When login is dispatched
        on(authActions.login, (state): AuthState => ({
            ...state,
            status: 'loading',
            error: null,
        })),

        // When login succeeds
        on(authActions.loginSuccess, (state, { email }): AuthState => ({
            ...state,
            status: 'authenticated',
            email
        })),

        // When login fails
        on(authActions.loginFailure, (state, { error }): AuthState => ({
            ...state,
            status: 'error',
            error,
            email: null,
        })),

        // When Initiating Google Login
        on(authActions.googleLogin, (state, { userType }): AuthState => ({
            ...state,
            type: userType
        })),

        on(authActions.setUserType, (state, { userType }): AuthState => ({
            ...state,
            type: userType
        })),

        //When logs out
        on(authActions.logout, () => initialState)
    )
});