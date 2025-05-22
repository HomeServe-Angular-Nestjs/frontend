import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { customerActions } from "./customer.actions";
import { catchError, map, switchMap } from "rxjs";
import { CustomerService } from "../../core/services/customer.service";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { NotificationService } from "../../core/services/public/notification.service";

export const customerEffects = {
    fetchAvatar$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(customerActions.fetchOneCustomer),
            switchMap(() =>
                customerService.fetchOneCustomer().pipe(
                    map((customer) => customerActions.fetchOneCustomerSuccess({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.fetchOneCustomerFailure, notyf)
                    })
                )
            )
        );
    }, { functional: true })
}