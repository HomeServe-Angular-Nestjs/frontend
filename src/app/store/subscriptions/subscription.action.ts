import { createAction, props } from "@ngrx/store";
import { ISubscription } from "../../core/models/subscription.model";

export const subscriptionAction = {
    subscriptionSuccessAction: createAction('[Subscription] Success Action', props<{ selectedSubscription: ISubscription | null }>()),
    subscriptionFailedAction: createAction('[Subscription] Failed Action', props<{ error: string }>()),

    fetchSubscriptions: createAction('[Subscription] Fetch'),
}