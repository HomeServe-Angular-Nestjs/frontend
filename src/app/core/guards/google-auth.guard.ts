import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import * as authSelector from '../../store/selectors/auth.selector';
import { authActions } from '../../store/actions/auth.actions';
import { map, take } from 'rxjs';

export const googleAuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);

  return store.select(authSelector.selectAuthState).pipe(
    take(1),
    map(authState => {
      if (authState.status === 'authenticated') {
        return true;
      }

      const email = route.queryParams['email'];
      const type = route.queryParams['type'];

      if (!email || !type) {
        return false;
      }

      // store.dispatch(authActions.googleLoginSuccess({ user: { email, type } }));

      return true;
    })
  );
};
