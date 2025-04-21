import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IUserState } from "../../core/models/user.model";
import { customerAdaptor, providerAdaptor } from "./user.entities";

export const selectUserState = createFeatureSelector<IUserState>('users');

export const selectCustomerState = createSelector(
    selectUserState,
    (state) => state.customers
);

export const selectProviderState = createSelector(
    selectUserState,
    (state) => state.providers
);

export const { selectAll: selectAllCustomers } = customerAdaptor.getSelectors(selectCustomerState);

export const {
    selectAll: selectAllProviderEntities,
    selectEntities: selectProvidersEntities,
    selectIds: selectAllProviderIds,
    selectTotal: selectTotalProviders
} = providerAdaptor.getSelectors(selectProviderState);
