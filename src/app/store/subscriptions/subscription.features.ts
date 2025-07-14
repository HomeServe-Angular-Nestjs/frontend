import { createFeature, createReducer, on } from "@ngrx/store";
import { ISubscriptionState } from "../../core/models/subscription.model";
import { subscriptionAction } from "./subscription.action";

export const initialSubscriptionState: ISubscriptionState = {
    selectedSubscription: null,
    error: null,
    showSubscriptionPage: true,
}

export const subscriptionFeature = createFeature({
    name: 'subscription',
    reducer: createReducer(
        initialSubscriptionState,

        on(subscriptionAction.subscriptionSuccessAction, (state, { selectedSubscription }) => ({
            ...state,
            selectedSubscription,
            error: null,
            showSubscriptionPage: false
        })),

        on(subscriptionAction.subscriptionFailedAction, (state, { error }) => ({
            ...state,
            selectedSubscription: null,
            error,
        })),
    )
})