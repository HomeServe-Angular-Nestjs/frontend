import { createFeature, createReducer, on } from "@ngrx/store";
import { userActions } from "../actions/user.actions";
import { IUserState } from "../models/user.model";
import { customerAdaptor, providerAdaptor } from "../entities/user.entities";

export const initialUserState: IUserState = {
    customers: customerAdaptor.getInitialState(),
    providers: providerAdaptor.getInitialState(),
    loading: false,
    error: null
}

export const userFeature = createFeature({
    name: 'users',
    reducer: createReducer(
        initialUserState,
        on(userActions.fetchCustomers, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(userActions.fetchCustomersSuccess, (state, { customers }) => ({
            ...state,
            loading: false,
            customers: customerAdaptor.setAll(customers, state.customers),
            error: null
        })),

        on(userActions.fetchProviderFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(userActions.fetchProviders, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(userActions.fetchProvidersSuccess, (state, { providers }) => ({
            ...state,
            loading: false,
            providers: providerAdaptor.setAll(providers, state.providers),
            error: null
        })),

        on(userActions.fetchProviderFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),

        on(userActions.fetchUsers, (state) => ({
            ...state,
            loading: true,
            error: null,
        }))
    )
});

