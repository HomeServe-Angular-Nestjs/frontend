import { createEffect, ofType } from "@ngrx/effects";
import { inject } from "@angular/core"
import { Actions } from "@ngrx/effects"
import { LoginAuthService } from "../../core/services/login-auth.service";
import { Router } from "@angular/router";
import { authActions } from "./auth.actions";
import { catchError, first, map, of, switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { loginNavigation, navigationAfterLogin } from "../../core/utils/navigation.utils";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "./auth.selector";
import { UserType } from "../../modules/shared/models/user.model";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const authEffects = {
    login$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);
        const router = inject(Router);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(authActions.login),
            switchMap(({ user }) =>
                loginService.authCredentials(user).pipe(
                    map(() => authActions.loginSuccess({ email: user.email })),
                    tap(() => {
                        const url = navigationAfterLogin(user.type);
                        router.navigate([url]);
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, authActions.loginFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),

    googleLogin$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(authActions.googleLogin),
            switchMap(({ userType }) =>
                loginService.initializeGoogleAuth(userType).pipe(
                    tap((response) => window.location.href = response.data),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, authActions.loginFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true, dispatch: false }),

    logout$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);
        const router = inject(Router);
        const store = inject(Store);

        return actions$.pipe(
            ofType(authActions.logout),
            switchMap(({ fromInterceptor }) =>
                store.select(selectAuthUserType).pipe(
                    first(),
                    switchMap((userType) => {
                        if (fromInterceptor) {
                            router.navigate([loginNavigation(userType as UserType)]);
                            return of(authActions.logoutSuccess());
                        }

                        return loginService.logout().pipe(
                            catchError((error) => of(null)),
                            map(() => authActions.logoutSuccess()),
                            tap(() => {
                                router.navigate([loginNavigation(userType as UserType)]);
                            })
                        );
                    })
                )),
        );
    }, { functional: true })
}; 
