import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { offeredServiceActions } from "../actions/offeredService.action";
import { catchError, map, of, switchMap } from "rxjs";
import { OfferedServicesService } from "../../core/services/service-management.service";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";

export const offeredServiceEffects = {
    fetchOfferedServices$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(offeredServiceActions.fetchOfferedServices),
            switchMap(() =>
                serviceOfferedService.fetchOfferedServices().pipe(
                    map((response) => offeredServiceActions.fetchOfferedServicesSuccess({ offeredServices: response })),
                    catchError((error: HttpErrorResponse) => {
                        console.error('[Fetch Offered Service Effect] API Error: ', error);
                        const errorMessage = error?.error?.message || "Something went wrong. Please try again!";
                        notyf.error(errorMessage);
                        return of(offeredServiceActions.fetchOfferedServiceFailure({ error: errorMessage }));
                    })
                )
            )
        );
    }, { functional: true }),
    
}