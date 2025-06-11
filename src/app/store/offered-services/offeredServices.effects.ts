import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { offeredServiceActions } from "./offeredService.action";
import { catchError, map, switchMap } from "rxjs";
import { OfferedServicesService } from "../../core/services/service-management.service";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { Router } from "@angular/router";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const offeredServiceEffects = {
    fetchOfferedServices$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(offeredServiceActions.fetchOfferedServices),
            switchMap(() =>
                serviceOfferedService.fetchOfferedServices().pipe(
                    map((response) => offeredServiceActions.fetchOfferedServicesSuccess({ offeredServices: response })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, offeredServiceActions.fetchOfferedServiceFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),

    updateOfferedService$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const toastr = inject(ToastNotificationService);
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
                        return handleApiError(error, offeredServiceActions.updateOfferedServiceFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),

    updateSubService$: createEffect(() => {
        const actions$ = inject(Actions);
        const serviceOfferedService = inject(OfferedServicesService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(offeredServiceActions.updateSubService),
            switchMap(({ updateData }) =>
                serviceOfferedService.updateSubService(updateData).pipe(
                    map((response) => offeredServiceActions.updateSubServiceSuccess({
                        id: response.id,
                        subService: response.subService
                    })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, offeredServiceActions.updateOfferedServiceFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),
}