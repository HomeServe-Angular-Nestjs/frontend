import { createFeature, createReducer, on } from "@ngrx/store";
import { customerActions, userActions } from "./user.actions";
import { ICustomerState, IUserState } from "../../core/models/user.model";
import { customerAdaptor, providerAdaptor } from "./user.entities";

export const initialUserState: IUserState = {
    customers: customerAdaptor.getInitialState(),
    providers: providerAdaptor.getInitialState(),
    loading: false,
    error: null
}

export const initialCustomerState: ICustomerState = {
    customers: customerAdaptor.getInitialState(),
    loading: false,
    error: null,
};


export const userFeature = createFeature({
    name: 'users',
    reducer: createReducer(
        initialUserState,

        on(userActions.fetchUsers, (state) => ({
            ...state,
            loading: true,
            error: null,
        })),

        on(userActions.fetchUsersSuccess, (state, { customers, providers }) => ({
            ...state,
            customers: customerAdaptor.setAll(customers, state.customers),
            providers: providerAdaptor.setAll(providers, state.providers),
            error: null
        })),

        on(userActions.fetchUsersFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
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

        on(userActions.fetchProvidersFailure, (state, { error }) => ({
            ...state,
            error,
            loading: false
        })),
    )
});

export const customerFeature = createFeature({
    name: 'customers',
    reducer: createReducer(
        initialCustomerState,

        on(customerActions.fetchCustomers, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(customerActions.fetchCustomersSuccess, (state, { customers }) => {
            console.log('setting customers: ', customers)
            return {
                ...state,
                loading: false,
                customers: customerAdaptor.setAll(customers, state.customers),
                error: null
            }
        }),

        on(customerActions.fetchCustomersFailure, (state, { error }) => ({
            ...state,
            loading: false,
            error
        })),

        on(customerActions.updateCustomer, (state) => ({
            ...state,
            loading: true,
        })),

        on(customerActions.updateCustomerSuccess, (state, { customer }) => ({
            ...state,
            customers: customerAdaptor.updateOne(
                { id: customer.id, changes: customer },
                state.customers
            )
        })),
    )
});