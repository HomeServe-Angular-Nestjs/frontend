import { createFeature, createReducer, on } from "@ngrx/store";
import { ICustomerState } from "../../core/models/user.model";
import { customerActions } from "./customer.actions";

export const initialCustomerState: ICustomerState = {
    customer: null,
    error: null,
    loading: false,
    isSubmittingProfile: false
}

export const customerFeature = createFeature({
    name: 'customer',
    reducer: createReducer(
        initialCustomerState,

        on(customerActions.fetchOneCustomer, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(customerActions.updateCustomer, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(customerActions.updateAddToSaved, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(customerActions.changeAvatar, (state) => ({
            ...state,
            loading: true,
            error: null
        })),

        on(customerActions.updateProfile, (state) => ({
            ...state,
            isSubmittingProfile: true,
            error: null
        })),

        on(customerActions.customerSuccessAction, (state, { customer }) => ({
            ...state,
            customer,
            loading: false,
            isSubmittingProfile: false
        })),

        on(customerActions.customerFailureAction, (state, { error }) => ({
            ...state,
            error,
            loading: false,
            isSubmittingProfile: false
        })),
    )
})