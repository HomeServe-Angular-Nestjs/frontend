import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IProviderState } from "../../core/models/user.model";

export const selectProviderState = createFeatureSelector<IProviderState>('provider');


export const selectProvider = createSelector(
    selectProviderState,
    (state) => state.provider
);