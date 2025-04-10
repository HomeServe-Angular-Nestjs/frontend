//* Guards Authenticated Users navigating to signup/login page.

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable, take } from "rxjs";
import { selectAuthUserType, selectCheckStatus } from "../../store/selectors/auth.selector";
import {  navigationAfterLogin } from "../utils/navigation.utils";

export const GuestGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);

    return combineLatest([
        store.select(selectCheckStatus),
        store.select(selectAuthUserType),
    ]).pipe(
        take(1),
        map(([status, type]) => {
            console.log('GuestGuard check:', { status, type });
            if (status === 'authenticated' && type) {
                const url = navigationAfterLogin(type)
                return router.createUrlTree([url]);
            }
            return true;
        })
    );

};