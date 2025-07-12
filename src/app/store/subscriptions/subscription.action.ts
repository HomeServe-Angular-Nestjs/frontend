import { createAction, props } from "@ngrx/store";

export const subscriptionAction = {

    fetchSubs: createAction('[Subscription] Fetch', props<{ userType: string }>()),
    subSuccess: createAction('[Subscription] Success', props<{ subs: any }>),
}