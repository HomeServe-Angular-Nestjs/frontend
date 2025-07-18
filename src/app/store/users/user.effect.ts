import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { userActions } from "./user.actions";
import { catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ProviderService } from "../../core/services/provider.service";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { CustomerService } from "../../core/services/customer.service";
import { ToastNotificationService } from "../../core/services/public/toastr.service";

export const userEffects = {
    /**
     * Partially updates a provider when 'partialUpdateProvider' is dispatched.
     * On success, dispatches 'partialUpdateProviderSuccess'. On error, handles it and dispatches 'partialUpdateProviderFailure'.
     */
    partialUpdateProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(userActions.partialUpdateProvider),
            switchMap(({ updateData }) =>
                providerService.partialUpdate(updateData).pipe(
                    map((provider) => userActions.partialUpdateProviderSuccess({ provider })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.partialUpdateProviderFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),

    /**
     * Partially updates a customer when 'partialUpdateCustomer' is dispatched.
     * On success, dispatches 'partialUpdateCustomerSuccess'. On error, handles it and dispatches 'partialUpdateCustomerFailure'.
     */
    partialUpdateCustomer$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(userActions.partialUpdateCustomer),
            switchMap(({ updateData }) =>
                customerService.partialUpdate(updateData).pipe(
                    map((customer) => userActions.partialUpdateCustomerSuccess({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.partialUpdateCustomerFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),

    /**
     * fetches filtered customers when 'filterCustomer' is dispatched.
     * On success, dispatches 'filterCustomerSuccess'. On error, shows a notification and dispatches 'filterCustomerFailure'.
     */
    filterCustomers$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(userActions.filterCustomer),
            switchMap(({ filter }) =>
                customerService.getCustomers(filter).pipe(
                    map((customers) => userActions.filterCustomerSuccess({ customers })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.filterCustomerFailure, toastr
                        );
                    })
                )
            )
        );
    }, { functional: true }),
}
