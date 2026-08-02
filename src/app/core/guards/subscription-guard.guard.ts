import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { SubscriptionService } from '../services/subscription.service';
import { Store } from '@ngrx/store';
import { selectAuthUserType } from '../../store/auth/auth.selector';
import { ToastNotificationService } from '../services/public/toastr.service';
import { ISubscription } from '../models/subscription.model';

export const SubscriptionGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);
  const store = inject(Store);
  const toastr = inject(ToastNotificationService);

  const redirectToPlans = () =>
    store.select(selectAuthUserType).pipe(
      take(1),
      map(role =>
        router.createUrlTree([
          role === 'provider' ? '/provider/plans' : '/homepage'
        ])
      )
    );

  const isExpired = (sub: ISubscription | null | undefined): boolean =>
    !!sub && !!sub.endDate && new Date(sub.endDate).getTime() < Date.now();

  const showExpiryNotice = (sub: ISubscription) => {
    const formatted = new Date(sub.endDate as string).toLocaleDateString();
    toastr.warning(`Your subscription expired on ${formatted} — renew to continue.`);
  };

  const cached = subscriptionService.getSubscription;
  if (cached?.isActive) {
    return of(true);
  }

  // Cached subscription exists but is no longer active (expired/blocked) —
  if (cached && !cached.isActive) {
    if (isExpired(cached)) {
      showExpiryNotice(cached);
    }
    return redirectToPlans();
  }

  if (subscriptionService.isAlreadyCheckedForSubscription) {
    return of(true);
  }

  subscriptionService.setIsAlreadyCheckedForSubscription = true;

  return subscriptionService.hasActiveSubscription().pipe(
    switchMap(res => {
      const subscription = res?.data;

      if (subscription?.isActive) {
        subscriptionService.setSubscription = subscription;
        return of(true);
      }

      return subscriptionService.fetchLatestSubscription().pipe(
        switchMap(latest => {
          if (isExpired(latest?.data)) {
            showExpiryNotice(latest!.data!);
          } else if (!latest?.data) {
            toastr.info('Subscribe to a plan to access this feature.');
          } else {
            toastr.info('You need an active subscription to access this feature.');
          }
          return redirectToPlans();
        }),
        catchError(() => redirectToPlans())
      );
    }),
    catchError(() => redirectToPlans())
  );
};
