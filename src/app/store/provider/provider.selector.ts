import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IProviderState } from "../../core/models/user.model";
import { state } from "@angular/animations";

export const selectProviderState = createFeatureSelector<IProviderState>('provider');

export const selectProvider = createSelector(
    selectProviderState,
    (state) => state.provider
);

export const selectDefaultSlots = createSelector(
    selectProviderState,
    (state) => state.provider?.defaultSlots
);

export const selectBufferTime = createSelector(
    selectProviderState,
    (state) => state.provider?.bufferTime
);