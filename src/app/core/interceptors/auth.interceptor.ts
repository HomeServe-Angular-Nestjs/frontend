import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, first, mergeMap, of, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../store/auth/auth.selector";
import { authActions } from "../../store/auth/auth.actions";
import { ToastNotificationService } from "../services/public/toastr.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);
    const toastr = inject(ToastNotificationService);

    return store.select(selectAuthUserType).pipe(
        first(),
        mergeMap(userType => {
            const modifiedRequest = req.clone({
                setHeaders: {
                    'x-user-type': userType || ''
                },
                withCredentials: true
            });

            return next(modifiedRequest).pipe(
                catchError((error: HttpErrorResponse) => {
                    // const message = error?.error?.message;
                    const status = new Set([401, 403]);

                    if (status.has(401) || status.has(403)) {
                        // toastr.error(message || 'Session expired');
                        store.dispatch(authActions.logout({ fromInterceptor: true }));

                        return throwError(() => error);
                    }

                    return throwError(() => {
                        // toastr.error(message || 'session expired');
                        console.error(error)
                        throw new Error('Session Expired!');
                    })
                })
            )
        })
    )
};