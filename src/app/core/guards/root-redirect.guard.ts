import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable, take } from "rxjs";
import { selectAuthUserType, selectCheckStatus } from "../../store/auth/auth.selector";
import { navigationAfterLogin } from "../utils/navigation.utils";

export const RootRedirectGuard: CanActivateFn = (): Observable<UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);

    return combineLatest([
        store.select(selectCheckStatus),
        store.select(selectAuthUserType),
    ]).pipe(
        take(1),
        map(([status, type]) => {
            if (status === 'authenticated' && type) {
                return router.createUrlTree([navigationAfterLogin(type)]);
            }
            return router.createUrlTree(['landing_page']);
        })
    );
};