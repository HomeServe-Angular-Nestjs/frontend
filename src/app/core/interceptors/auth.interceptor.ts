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
                    // const status = new Set([401, 403]);

                    // if (status.has(401) || status.has(403)) {
                    //     store.dispatch(authActions.logout({ fromInterceptor: true }));

                    //     return throwError(() => error);
                    // }

                    if (error.status === 401) {
                        store.dispatch(authActions.logout({ fromInterceptor: true }));
                        return of();
                    } else if (error.status === 403) {
                        console.log(error);
                        return of();
                    }

                    return throwError(() => {
                        console.error(error)
                        throw new Error();
                    })
                })
            )
        })
    )
};