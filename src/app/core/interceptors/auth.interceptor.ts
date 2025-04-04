import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, first, firstValueFrom, mergeMap, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { selectAuthUserType } from "../../store/selectors/auth.selector";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const store = inject(Store);

    return store.select(selectAuthUserType).pipe(
        first(),
        mergeMap(userType => {
            const modifiedReq = req.clone({
                setHeaders: { 'X-User-Type': userType || '' },
                withCredentials: true
            });

            return next(modifiedReq).pipe(
                catchError((err: HttpErrorResponse) => {
                    if (err.status === 401) {
                        router.navigate(['/login']);
                    } else if (err.status === 403) {
                        router.navigate(['access_denied']);
                    }
                    return throwError(() => err);
                }),
            );
        })
    );
};