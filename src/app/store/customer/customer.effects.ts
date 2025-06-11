import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { customerActions } from "./customer.actions";
import { catchError, map, switchMap } from "rxjs";
import { CustomerService } from "../../core/services/customer.service";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { NotificationService } from "../../core/services/public/notification.service";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const customerEffects = {
    fetchOneCustomer$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.fetchOneCustomer),
            switchMap(() =>
                customerService.fetchOneCustomer().pipe(
                    map((customer) => customerActions.customerSuccessAction({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr
                        )
                    })
                )
            )
        );
    }, { functional: true }),

    updateCustomer$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.updateCustomer),
            switchMap(({ updateData }) =>
                customerService.partialUpdate(updateData).pipe(
                    map((customer) => customerActions.customerSuccessAction({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr
                        )
                    })
                )
            )
        );
    }, { functional: true }),

    updateAddToSaved$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.updateAddToSaved),
            switchMap(({ providerId }) =>
                customerService.updateAddToSaved(providerId).pipe(
                    map((customer) => customerActions.customerSuccessAction({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr
                        )
                    })
                )
            )
        );
    }, { functional: true })
}