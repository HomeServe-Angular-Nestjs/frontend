import { inject } from "@angular/core";
import { act, Actions, createEffect, ofType } from "@ngrx/effects";
import { customerActions } from "./customer.actions";
import { catchError, map, of, switchMap, throwError } from "rxjs";
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
                        return handleApiError(error, customerActions.customerFailureAction, toastr);
                    })
                )
            )
        );
    }, { functional: true }),

    updateProfile$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.updateProfile),
            switchMap(({ profileData }) =>
                customerService.updateProfile(profileData).pipe(
                    map(response => {
                        if (response && response.data) {
                            toastr.success(response.message);
                            return customerActions.customerSuccessAction({ customer: response.data })
                        }

                        throw new Error(response.message);
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr);
                    })
                )
            )
        );
    }, { functional: true }),

    changePassword$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.changePassword),
            switchMap(({ passwordData }) =>
                customerService.changePassword(passwordData).pipe(
                    map(response => {
                        if (response && response.data) {
                            toastr.success(response.message);
                            return customerActions.customerSuccessAction({ customer: response.data })
                        }

                        throw new Error(response.message);
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr);
                    })
                )
            )
        );
    }, { functional: true }),

    changeAvatar$: createEffect(() => {
        const actions$ = inject(Actions);
        const customerService = inject(CustomerService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(customerActions.changeAvatar),
            switchMap(({ formData }) =>
                customerService.changeAvatar(formData).pipe(
                    map(response => {
                        if (response && response.data) {
                            toastr.success(response.message);
                            return customerActions.customerSuccessAction({ customer: response.data })
                        }

                        throw new Error(response.message);
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, customerActions.customerFailureAction, toastr);
                    })
                )
            )
        );
    }, { functional: true })
}