import { createEffect, ofType } from "@ngrx/effects";
import { inject } from "@angular/core"
import { Actions } from "@ngrx/effects"
import { LoginAuthService } from "../../core/services/login-auth.service";
import { Router } from "@angular/router";
import { authActions } from "./auth.actions";
import { catchError, map, of, switchMap, take, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { navigationAfterLogin } from "../../core/utils/navigation.utils";
import { ToastNotificationService } from "../../core/services/public/toastr.service";
import { SubscriptionService } from "../../core/services/subscription.service";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "./auth.selector";

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
                    map((response: any) => {
                        return authActions.loginSuccess({ email: user.email, id: response.id as string })
                    }),
                    tap(() => {
                        const url = navigationAfterLogin(user.type);
                        router.navigate([url]);
                        toastr.success('Logged in successfully');
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, authActions.loginFailure, toastr);
                    }),
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
        const toastr = inject(ToastNotificationService);
        const store = inject(Store);

        return actions$.pipe(
            ofType(authActions.logout),
            switchMap(({ fromInterceptor, message }) =>
                store.select(selectAuthUserType).pipe(
                    take(1),
                    switchMap(type => {
                        const dest = type === 'admin' ? ['/admin/login'] : ['/landing_page'];

                        if (fromInterceptor) {
                            toastr.error(message || 'Oops, Something happened');
                            router.navigate(dest);
                            return of(authActions.logoutSuccess());
                        }

                        return loginService.logout().pipe(
                            catchError(() => of(null)),
                            tap(() => {
                                router.navigate(dest);
                            }),
                            map(() => authActions.logoutSuccess())
                        );
                    })
                )
            ),
        );
    }, { functional: true }),

    logoutSubscriptionReset$: createEffect(() => {
        const actions$ = inject(Actions);
        const subscriptionService = inject(SubscriptionService);

        return actions$.pipe(
            ofType(authActions.logoutSuccess),
            tap(() => subscriptionService.reset())
        );
    }, { functional: true, dispatch: false }),
}; 
