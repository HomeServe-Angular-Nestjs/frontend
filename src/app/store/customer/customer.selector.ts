import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ICustomerState, ILocationData } from "../../core/models/user.model";
import { state } from "@angular/animations";

export const selectCustomerState = createFeatureSelector<ICustomerState>('customer');

export const selectCustomer = createSelector(
    selectCustomerState,
    (state) => state.customer
);
export const selectSavedProviders = createSelector(
    selectCustomerState,
    (state) => state.customer?.savedProviders ?? []
);

export const selectPhoneNumber = createSelector(
    selectCustomerState,
    (state) => state.customer?.phone
);

export const selectLocation = createSelector(
    selectCustomerState,
    (state): ILocationData | null => {
        const coordinates = state.customer?.location?.coordinates;
        const address = state.customer?.address;

        if (
            !Array.isArray(coordinates) ||
            coordinates.length !== 2 ||
            !address
        ) {
            return null;
        }

        return {
            coordinates: [coordinates[0], coordinates[1]],
            address
        };
    }
);


export const selectCustomerId = createSelector(
    selectCustomerState,
    (state) => state.customer?.id
);

export const selectCustomerReviewStatus = createSelector(
    selectCustomerState,
    (state) => state.customer?.isReviewed
);