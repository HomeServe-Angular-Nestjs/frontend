import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { SubscriptionService } from '../services/subscription.service';
import { Store } from '@ngrx/store';
import { selectAuthUserType } from '../../store/auth/auth.selector';

export const SubscriptionGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);
  const store = inject(Store);

  const cached = subscriptionService.getSubscription;
  if (cached?.isActive) {
    return of(true);
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

      return store.select(selectAuthUserType).pipe(
        take(1),
        map(role =>
          router.createUrlTree([
            role === 'provider' ? '/provider/plans' : '/homepage'
          ])
        )
      );
    }),
    catchError(() =>
      of(router.createUrlTree(['/plans']))
    )
  );
};
