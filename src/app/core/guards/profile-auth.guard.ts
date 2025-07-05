import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { filter, first, Observable, of, switchMap, tap } from "rxjs";
import { authActions } from "../../store/auth/auth.actions";
import { selectAuthUser } from "../../store/auth/auth.selector";

/**
 * Route guard to validate profile access based on query parameters.
 *
 * @param {ActivatedRouteSnapshot} route - The snapshot of the current route.
 * @returns {Observable<boolean>} - An observable that resolves to `true` if access is allowed.
 *
 * If the `loggedIn=true` and a valid `email` is present in the query params,
 * the guard dispatches a login action and waits for the store to update.
 * It uses `filter` to wait until a non-null user is emitted from the store,
 * ensuring the user is authenticated before allowing route activation.
 *
 * If the parameters are not present or invalid, access is granted by default.
 */

export const ProfileAuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
): Observable<boolean> => {
    const store = inject(Store);

    const isLoggedIn: string = route.queryParams['loggedIn'];
    const email: string = route.queryParams['email'];
    const id: string = route.queryParams['id'];

    if (isLoggedIn === 'true' && email !== '') {
        store.dispatch(authActions.loginSuccess({ email, id }));

        // wait for the store to be updated.
        return store.select(selectAuthUser).pipe(
            filter(email => !!email), // ensures the guard waits until the store reflects the login state
            first(),
            switchMap(() => of(true))
        );
    }

    return of(true);
}