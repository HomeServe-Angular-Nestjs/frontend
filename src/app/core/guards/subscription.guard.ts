import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { map, Observable, of, switchMap, take } from "rxjs";
import { selectSelectedSubscription } from "../../store/subscriptions/subscription.selector";
import { ToastNotificationService } from "../services/public/toastr.service";
import { SubscriptionService } from "../services/subscription.service";
import { subscriptionAction } from "../../store/subscriptions/subscription.action";
import { ISubscription } from "../models/subscription.model";
import { authActions } from "../../store/auth/auth.actions";

export const SubscriptionGuard: CanActivateFn = (): Observable<boolean> => {
    const store = inject(Store);
    const subscriptionService = inject(SubscriptionService);
    const toastr = inject(ToastNotificationService);

    return store.select(selectSelectedSubscription).pipe(
        take(1),
        switchMap((subscription) => {
            if (subscription) return of(validate(subscription));

            return subscriptionService.fetchSubscription().pipe(
                map((res) => {
                    const data = res.data;
                    if (data) {
                        store.dispatch(subscriptionAction.subscriptionSuccessAction({ selectedSubscription: data }));
                        return validate(data);
                    }
                    store.dispatch(authActions.updateShowSubscriptionPageValue({ value: true }));
                    return false;
                })
            );
        })
    );

    function validate(sub: ISubscription): boolean {
        if (!sub.isActive) {
            toastr.error('Your subscription is inactive');
            return false;
        }

        if (!sub.endDate) {
            toastr.error('Subscription end date is missing');
            return false;
        }

        const endDate = new Date(sub.endDate);
        if (isNaN(endDate.getTime())) {
            toastr.error('Invalid subscription end date');
            return false;
        }

        if (new Date() > endDate) {
            toastr.error('Your subscription has expired');
            return false;
        }

        return true;
    }
};

