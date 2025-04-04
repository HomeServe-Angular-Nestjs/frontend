import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/selectors/auth.selector';
import { map, Observable, take } from 'rxjs';
import { NotificationService } from '../services/public/notification.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);
  const notyf = inject(NotificationService);

  return store.select(authSelector.selectCheckStatus).pipe(
    take(1),
    map((status) => {
      if (status === 'authenticated') {
        return true;
      }
      notyf.error('Please login first');
      return router.createUrlTree(['login'], {
        queryParams: { return: state.url }
      })
    })
  );
};
