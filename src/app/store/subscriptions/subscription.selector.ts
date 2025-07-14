import { createSelector } from "@ngrx/store";
import { subscriptionFeature } from "./subscription.features";

export const { selectSubscriptionState } = subscriptionFeature;

export const selectSelectedSubscription = createSelector(
    selectSubscriptionState,
    (state) => state.selectedSubscription
);