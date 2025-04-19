import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { filter, first, of, switchMap, tap } from "rxjs";
import { authActions } from "../../store/actions/auth.actions";
import { selectAuthUser } from "../../store/selectors/auth.selector";

export const ProfileAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store);

    const isLoggedIn: string = route.queryParams['loggedIn'];
    const email: string = route.queryParams['email'];

    if (isLoggedIn === 'true' && email !== '') {
        console.log('got in profile guard');
        store.dispatch(authActions.loginSuccess({ email }));

        // wait for the store to be updated.
        return store.select(selectAuthUser).pipe(
            tap((email) => console.log(email)),
            filter(email => !!email),
            first(),
            switchMap(() => of(true))
        );
    }

    return of(true);
}