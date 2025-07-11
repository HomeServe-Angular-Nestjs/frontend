import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, first, mergeMap, of, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../store/auth/auth.selector";
import { authActions } from "../../store/auth/auth.actions";

export const USE_CREDENTIALS = new HttpContextToken(() => true);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);

    return store.select(selectAuthUserType).pipe(
        first(),
        mergeMap(userType => {
            const withCred = req.context.get(USE_CREDENTIALS);

            const modifiedRequest = req.clone({
                setHeaders: {
                    'x-user-type': userType || ''
                },
                withCredentials: withCred
            });

            return next(modifiedRequest).pipe(
                catchError((error: HttpErrorResponse) => {
                    const message = error?.error?.message;

                    if (error.status === 401) {
                        store.dispatch(authActions.logout({ fromInterceptor: true, message }));
                        return of();
                    } else if (error.status === 403) {
                        console.log(error);
                        return of();
                    }

                    return throwError(() => {
                        const message = error?.error?.error || error?.error?.message || error.message || 'Something went wrong. Please try again!';
                        throw new Error(message);
                    });
                })
            );
        })
    );
};