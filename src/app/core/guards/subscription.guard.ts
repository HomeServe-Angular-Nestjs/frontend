import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable, of, switchMap, take } from "rxjs";
import { selectSelectedSubscription } from "../../store/subscriptions/subscription.selector";
import { ToastNotificationService } from "../services/public/toastr.service";
import { SubscriptionService } from "../services/subscription.service";
import { subscriptionAction } from "../../store/subscriptions/subscription.action";
import { ISubscription } from "../models/subscription.model";
import { selectAuthUserType } from "../../store/auth/auth.selector";

export const SubscriptionGuard: CanActivateFn = (): Observable<boolean> => {
    const store = inject(Store);
    const subscriptionService = inject(SubscriptionService);
    const toastr = inject(ToastNotificationService);
    const router = inject(Router);

    const selectedSubscription$ = store.select(selectSelectedSubscription);
    const userType$ = store.select(selectAuthUserType);

    return combineLatest([selectedSubscription$, userType$]).pipe(
        take(1),
        switchMap(([subscription, userType]) => {
            const url = userType === 'provider' ? '/provider/plans' : '/plans';

            if (subscription) {
                const isValid = validate(subscription);
                if (!isValid) {
                    toastr.error('Your subscription is not active. Please renew to continue.');
                    router.navigate([url]);
                    return of(false);
                }
                return of(true);
            }

            return subscriptionService.fetchSubscription().pipe(
                map((res) => {
                    const data = res.data;
                    if (data) {
                        store.dispatch(subscriptionAction.subscriptionSuccessAction({ selectedSubscription: data }));
                        return validate(data);
                    }

                    toastr.error('You don’t have an active subscription. Please choose a plan to get started.');
                    router.navigate([url]);
                    return false;
                })
            );
        })
    );

    function validate(sub: ISubscription): boolean {
        const now = new Date();

        return (!sub.isActive
            || !sub.endDate
            || isNaN(new Date(sub.endDate).getTime())
            || now > new Date(sub.endDate)
        );
    }
};

