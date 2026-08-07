import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/auth/auth.selector';
import { combineLatest, map, Observable, take } from 'rxjs';
import { ToastNotificationService } from '../services/public/toastr.service';
import { navigationAfterLogin } from '../utils/navigation.utils';


export const getRoleFromRoute = (route: ActivatedRouteSnapshot): string | undefined => {
  while (route) {
    const data = route.data ?? {};
    if ('role' in data) return data['role'] as string | undefined;
    route = route.parent!;
  }
  return undefined;
}

export const getLoginRedirectPath = (url: string, type?: string | null): string => {
  if (url?.includes('admin') || type === 'admin') return 'admin/login';
  return 'landing_page';
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

      if (status === 'authenticated') {
        if (!requiredRole || type === requiredRole) {
          return true;
        }

        toastr.error('Access denied: Unauthorized');
        return router.createUrlTree([navigationAfterLogin(type || 'customer')], {
          queryParams: { return: state.url }
        });
      }

      const redirectPath = getLoginRedirectPath(state.url, type);
      toastr.error('Your session has expired. Please log in again.');
      return router.createUrlTree([redirectPath], {
        queryParams: { return: state.url }
      });
    })
  );
};