import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/auth/auth.selector';
import { combineLatest, map, Observable, take } from 'rxjs';
import { NotificationService } from '../services/public/notification.service';

/**
 * Guard that controls access to routes based on authentication status and user role.
 *
 * @param {ActivatedRouteSnapshot} route - Snapshot of the current route that is being activated.
 * @returns {Observable<boolean | UrlTree>} - Returns `true` if the user is authenticated and has the required role;
 * otherwise redirects to the login page or a specific login page based on user type.
 *
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

export const AuthGuard: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> => {
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