import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/auth/auth.selector';
import { combineLatest, map, Observable, take } from 'rxjs';
import { ToastNotificationService } from '../services/public/toastr.service';

/**
 * Guard that controls access to routes based on authentication status and user role.
 * This guard checks the user's authentication status and role from the store:
 * - If the user is authenticated and has the correct role (or no role is required), the route is activated.
 * - If the user is not authenticated or does not have the correct role, they are redirected to the appropriate login page
 *   with the current URL stored in the query parameters for a potential return after login.
 */

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
  const toastr = inject(ToastNotificationService);

  const userStatus$ = store.select(authSelector.selectCheckStatus);
  const userType$ = store.select(authSelector.selectAuthUserType)

  return combineLatest([userStatus$, userType$]).pipe(
    take(1),
    map(([status, type]) => {
      const requiredRole = getRoleFromRoute(route);
      let redirectPath = getLoginRedirectPath(state.url);

      if (status === 'authenticated') {
        if (!requiredRole || type === requiredRole) {
          return true;
        }

        toastr.error('Access denied: Unauthorized');
        return router.createUrlTree([redirectPath], {
          queryParams: { return: state.url }
        });
      }

      toastr.info('Please login first.', 'Info', { positionClass: "top-10px" });
      return router.createUrlTree([redirectPath], {
        queryParams: { return: state.url }
      });
    })
  );
};