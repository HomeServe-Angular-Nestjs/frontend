import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { offeredServiceActions } from "./offeredService.action";
import { catchError, map, mergeMap, of, switchMap, throwError } from "rxjs";
import { OfferedServicesService } from "../../core/services/service-management.service";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { Router } from "@angular/router";

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
                        return handleApiError(error, offeredServiceActions.fetchOfferedServiceFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    updateOfferedService$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const notyf = inject(NotificationService);
        const router = inject(Router);

        return actions$.pipe(
            ofType(offeredServiceActions.updateOfferedService),
            switchMap(({ updateData }) =>
                serviceOfferedService.updateService(updateData).pipe(
                    map((updatedService) => {
                        router.navigate(['provider', 'profiles', 'service_offered']);
                        return offeredServiceActions.updateOfferedServiceSuccess({ updatedService })
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, offeredServiceActions.updateOfferedServiceFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    updateSubService$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(offeredServiceActions.updateSubService),
            switchMap(({ updateData }) =>
                serviceOfferedService.updateSubService(updateData).pipe(
                    map((response) => offeredServiceActions.updateSubServiceSuccess({
                        id: response.id,
                        subService: response.subService
                    })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, offeredServiceActions.updateOfferedServiceFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    // deleteSubService$: createEffect(() => {
    //     const actions$ = inject(Actions);
    //     const serviceOfferedService = inject(OfferedServicesService);
    //     const notyf = inject(NotificationService);

    //     return actions$.pipe(
    //         ofType(offeredServiceActions.deleteSubService),
    //         switchMap(({ serviceId, subId }) =>
    //             serviceOfferedService.deleteSubService(serviceId, subId).pipe(
    //                 mergeMap((success) => {
    //                     if (success) {
    //                         return of(offeredServiceActions.deleteSubServiceSuccess({ serviceId, subId }));
    //                     } else {
    //                         return throwError(() => new Error('Failed to delete sub service'));
    //                     }
    //                 }),
    //                 catchError((error: HttpErrorResponse) => {
    //                     return handleApiError(error, offeredServiceActions.deleteSubServiceFailure, notyf);
    //                 }))
    //         )
    //     )
    // }, { functional: true })

}