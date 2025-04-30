import { createEffect, ofType } from "@ngrx/effects";
import { inject } from "@angular/core"
import { Actions } from "@ngrx/effects"
import { LoginAuthService } from "../../core/services/login-auth.service";
import { Router } from "@angular/router";
import { authActions } from "./auth.actions";
import { catchError, map, of, switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { navigationAfterLogin } from "../../core/utils/navigation.utils";

export const authEffects = {
    login$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);
        const router = inject(Router);
        const notyf = inject(NotificationService);

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
                        return handleApiError(error, authActions.loginFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    googleLogin$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(authActions.googleLogin),
            switchMap(({ userType }) =>
                loginService.initializeGoogleAuth(userType).pipe(
                    tap((response) => window.location.href = response.data),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, authActions.loginFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true, dispatch: false }),

    logout$: createEffect(() => {
        const actions$ = inject(Actions);
        const authService = inject(LoginAuthService);
        const router = inject(Router);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(authActions.logout),
            switchMap(({ userType }) =>
                authService.logout(userType).pipe(
                    tap(() => router.navigate(['landing_page'])),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, authActions.loginFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true, dispatch: false })
}; 