import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable, take } from "rxjs";
import { selectAuthUserType, selectCheckStatus } from "../../store/auth/auth.selector";
import { navigationAfterLogin } from "../utils/navigation.utils";

/**
 * Guard to prevent authenticated users from accessing guest-only routes.
 *
 * @returns {Observable<boolean | UrlTree>} - Returns `true` if the user is a guest;
 * otherwise redirects authenticated users to their respective dashboard based on user type.
 *
 * This guard checks the authentication status and user type from the store.
 * If the user is authenticated, it generates a redirect `UrlTree` using the user type
 * to send them to the appropriate route (e.g., admin or customer dashboard).
 * Otherwise, it allows access to the route.
 */

export const GuestGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);

    return combineLatest([
        store.select(selectCheckStatus),
        store.select(selectAuthUserType),
    ]).pipe(
        take(1),
        map(([status, type]) => {
            if (status === 'authenticated' && type) {
                const url = navigationAfterLogin(type)
                return router.createUrlTree([url]);
            }
            return true;
        })
    );
}; 