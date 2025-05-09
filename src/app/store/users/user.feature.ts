import { createFeature, createReducer, on } from "@ngrx/store";
import { userActions } from "./user.actions";
import { IUserState } from "../../core/models/user.model";
import { customerAdaptor, providerAdaptor } from "./user.entities";

/**
 * @constant
 * @description Initial state for the user feature.
 */
export const initialUserState: IUserState = {
    customers: customerAdaptor.getInitialState(),
    providers: providerAdaptor.getInitialState(),
    loading: false,
    error: null
}

/**
 * @feature User State Feature
 * @description Handles user-related state including customers and providers.
 */
export const userFeature = createFeature({
    name: 'users',
    reducer: createReducer(
        initialUserState,

        /** @action Triggered when fetching users begins. */
        on(userActions.fetchUsers, (state) => ({
            ...state,
            loading: true,
            error: null,
        })),

        /**
         * @action Successfully fetched users.
         * @param customers - List of customer entities.
         * @param providers - List of provider entities.
         * @returns Updated state with new entities and loading disabled.
         */
        on(userActions.fetchUsersSuccess, (state, { customers, providers }) => ({
            ...state,
            customers: customerAdaptor.setAll(customers, state.customers),
            providers: providerAdaptor.setAll(providers, state.providers),
            error: null
        })),

        /** @action Sets error state when user fetch fails. */
        on(userActions.fetchUsersFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),

        /** @action Triggered when fetching providers begins. */
        on(userActions.fetchProviders, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        /**
         * @action Successfully fetched providers.
         * @param providers - List of provider entities.
         */
        on(userActions.fetchProvidersSuccess, (state, { providers }) => ({
            ...state,
            loading: false,
            providers: providerAdaptor.setAll(providers, state.providers),
            error: null
        })),

        /** @action Sets error state when provider fetch fails. */
        on(userActions.fetchProvidersFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),

        /** @action Triggered when partial update for a provider starts. */
        on(userActions.partialUpdateProvider, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        /**
        * @action Successfully updated a provider.
        * @param provider - Updated provider entity.
        */
        on(userActions.partialUpdateProviderSuccess, (state, { provider }) => {
            return {
                ...state,
                providers: providerAdaptor.updateOne(
                    { id: provider.id, changes: provider },
                    state.providers
                ),
                loading: false,
                error: null
            }
        }),

        /** @action Sets error state when provider update fails. */
        on(userActions.partialUpdateProviderFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        /** @action Triggered when partial update for a customer starts. */
        on(userActions.partialUpdateCustomer, (state) => ({
            ...state,
            loading: true,
            error: null,
        })),

        /**
         * @action Successfully updated a customer.
         * @param customer - Updated customer entity.
         */
        on(userActions.partialUpdateCustomerSuccess, (state, { customer }) => {
            return {
                ...state,
                customers: customerAdaptor.updateOne(
                    { id: customer.id, changes: customer },
                    state.customers
                ),
                loading: false,
                error: null
            }
        }),

        /** @action Sets error state when customer update fails. */
        on(userActions.partialUpdateCustomerFailure, (state, { error }) => ({
            ...state,
            error
        })),

        /** @action Successfully fetched customers. */
        on(userActions.searchCustomers, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        /**
         * @action Successfully fetched customers.
         * @param customers - Updated customers entity.
         */
        on(userActions.searchCustomersSuccess, (state, { customers }) => ({
            ...state,
            customers: customerAdaptor.setAll(customers, state.customers),
            loading: false,
            error: null
        })),

        /** @action Sets error state when customer fetch fails. */
        on(userActions.searchCustomersFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        /** @action Successfully fetched providers. */
        on(userActions.searchProviders, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        /**
         * @action Successfully fetched providers.
         * @param providers - Updated providers entity.
         */
        on(userActions.searchProvidersSuccess, (state, { providers }) => ({
            ...state,
            providers: customerAdaptor.setAll(providers, state.providers),
            loading: false,
            error: null
        })),

        /** @action Sets error state when provider fetch fails. */
        on(userActions.searchProvidersFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),
    )
});