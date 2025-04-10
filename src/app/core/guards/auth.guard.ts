//* Guards From Unauthenticated Users.

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/selectors/auth.selector';
import { combineLatest, map, Observable, take } from 'rxjs';
import { NotificationService } from '../services/public/notification.service';

export const getRoleFromRoute = (route: ActivatedRouteSnapshot): string | undefined => {
  while (route) {
    if (route.data?.['role']) return route.data['role'];
    route = route.parent!;
  }
  return undefined;
}

export const getLoginRedirectPath = (url: string): string => {
  if (url.includes('provider')) return 'provider/login';
  if (url.includes('admin')) return 'admin/login';
  return 'login';
}

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);
  const notyf = inject(NotificationService);

  return combineLatest([
    store.select(authSelector.selectCheckStatus),
    store.select(authSelector.selectAuthUserType)
  ]).pipe(
    take(1),
    map(([status, type]) => {
      const requiredRole = getRoleFromRoute(route);
      let redirectPath = getLoginRedirectPath(state.url);

      if (status === 'authenticated') {
        if (!requiredRole || type === requiredRole) {
          return true;
        }

        notyf.error('Access denied: Unauthorized');
        return router.createUrlTree([redirectPath], {
          queryParams: { return: state.url }
        });
      }

      notyf.error('Please login first.');
      return router.createUrlTree([redirectPath], {
        queryParams: { return: state.url }
      });
    })
  );
};
