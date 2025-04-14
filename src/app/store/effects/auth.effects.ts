import { createEffect, ofType } from "@ngrx/effects";
import { inject } from "@angular/core"
import { Actions } from "@ngrx/effects"
import { LoginAuthService } from "../../core/services/login-auth.service";
import { Router } from "@angular/router";
import { authActions } from "../actions/auth.actions";
import { catchError, map, of, switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";

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
                        const url = user.type === 'customer' ? 'homepage' :
                            user.type === 'provider' ? 'provider/homepage' : 'admin/dashboard';
                        router.navigate([url]);
                    }),
                    catchError((error: HttpErrorResponse) => {
                        console.error('[Login Effect] API Error:', error);
                        const errorMessage = error?.error?.message || 'Something went wrong. Please try again.';
                        notyf.error(errorMessage);
                        return of(authActions.loginFailure(({ error: errorMessage })));
                    })
                )
            )
        )
    }, { functional: true }),

    googleLogin$: createEffect(() => {
        const actions$ = inject(Actions);
        const loginService = inject(LoginAuthService);

        return actions$.pipe(
            ofType(authActions.googleLogin),
            switchMap(({ userType }) =>
                loginService.initializeGoogleAuth(userType).pipe(
                    tap((response) => {
                        window.location.href = response.data;
                    })
                )
            )
        )
    }, { functional: true, dispatch: false }),
}; 