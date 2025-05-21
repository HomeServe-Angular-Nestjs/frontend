import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, first, mergeMap, of, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../store/auth/auth.selector";
import { loginNavigation } from "../utils/navigation.utils";
import { UserType } from "../../modules/shared/models/user.model";
import { NotificationService } from "../services/public/notification.service";
import { authActions } from "../../store/auth/auth.actions";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const store = inject(Store);
    const notyf = inject(NotificationService);

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
                    if (error.status === 401) {
                        store.dispatch(authActions.logout({ fromInterceptor: true }));
                        return of();
                    } else if (error.status === 403) {
                        console.log(error);
                        return of();
                    }

                    return throwError(() => {
                        console.error(error)
                        throw new Error('Session Expired!');
                    })
                })
            )
        })
    )
};