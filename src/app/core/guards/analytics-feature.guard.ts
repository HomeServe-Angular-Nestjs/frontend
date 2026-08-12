import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { SubscriptionService } from '../services/subscription.service';
import { ToastNotificationService } from '../services/public/toastr.service';
import { FEATURE_REGISTRY } from '../models/plan.model';

export const AnalyticsFeatureGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);
  const toastr = inject(ToastNotificationService);

  const analyticsEnabled = (features?: Record<string, unknown>): boolean =>
    features?.[FEATURE_REGISTRY['ANALYTICS_DASHBOARD'].key] === true;

  const redirectToUpgrade = () => {
    toastr.info('Analytics is a premium feature. Upgrade your plan to unlock it.');
    return router.createUrlTree(['/provider/plans']);
  };

  const cached = subscriptionService.getSubscription;
  if (cached) {
    return of(cached.isActive && analyticsEnabled(cached.features) ? true : redirectToUpgrade());
  }

  return subscriptionService.hasActiveSubscription().pipe(
    map(res => {
      const subscription = res?.data;
      if (subscription?.isActive && analyticsEnabled(subscription.features)) {
        subscriptionService.setSubscription = subscription;
        return true;
      }
      return redirectToUpgrade();
    }),
    catchError(() => of(redirectToUpgrade()))
  );
};
