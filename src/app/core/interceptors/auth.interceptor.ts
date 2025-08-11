import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, first, mergeMap, of, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../store/auth/auth.selector";
import { authActions } from "../../store/auth/auth.actions";
import { ErrorHandlerService } from "../services/public/error-handler.service";
import { ToastNotificationService } from "../services/public/toastr.service";

export const USE_CREDENTIALS = new HttpContextToken(() => true);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);
    const errorHandler = inject(ErrorHandlerService);
    const toastr = inject(ToastNotificationService);

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
                    const errorCode = error?.error?.code;
                    const backendMessage = error?.error?.message;

                    const userMessage = errorHandler.getErrorMessage(
                        error.status,
                        errorCode,
                        backendMessage
                    );

                    if (error.status === 401) {
                        store.dispatch(authActions.logout({ fromInterceptor: true, message: userMessage }));
                        return of();
                    }

                    if (error.status === 403) {
                        console.warn('Forbidden:', userMessage);
                        return of();
                    }

                    toastr.error(userMessage);
                    return throwError(() => new Error(userMessage));
                })
            );
        })
    );
};