import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IUserState } from "../models/user.model";
import { customerAdaptor, providerAdaptor } from "../entities/user.entities";

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
    selectAll: selectAllProviders,
    selectEntities: selectProviderEntities,
    selectIds: selectProviderIds,
    selectTotal: selectTotalProviders
} = providerAdaptor.getSelectors(selectProviderState);


// export const selectTheProviderState = createFeatureSelector<IProviderState>('providers')
