import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ICustomerState } from "../../core/models/user.model";

export const selectCustomerState = createFeatureSelector<ICustomerState>('customer');

export const selectCustomer = createSelector(
    selectCustomerState,
    (state) => state.customer
);
export const selectSavedProviders = createSelector(
    selectCustomerState,
    (state) => state.customer?.savedProviders ?? []
)