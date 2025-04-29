import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserManagementService } from "../../core/services/user.service";
import { customerActions, userActions } from "./user.actions";
import { catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";
import { ProviderService } from "../../core/services/provider.service";
import { providerActions } from "../provider/provider.action";
import { handleApiError } from "../../core/utils/handle-errors.utils";

export const userEffects = {
    fetchUsers$: createEffect(() => {
        const actions$ = inject(Actions);
        const userService = inject(UserManagementService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.fetchUsers),
            switchMap(() =>
                userService.getUsers().pipe(
                    map((response) => userActions.fetchUsersSuccess({ customers: response.customers, providers: response.providers })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.fetchUsersFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    fetchProviders$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.fetchProviders),
            switchMap(() =>
                providerService.getProviders().pipe(
                    map((response) => userActions.fetchProvidersSuccess({ providers: response })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.fetchProvidersFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),



    updateCustomer$: createEffect(() => {
        const actions$ = inject(Actions);
        const userService = inject(UserManagementService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(customerActions.updateCustomer),
            switchMap(({ email, data }) =>
                userService.updateUser(email, data, 'customer').pipe(
                    map((customer) => customerActions.updateCustomerSuccess({ customer })),
                    tap(() => notyf.success('Updated Successfully')),
                    catchError((error) => {
                        return handleApiError(error, customerActions.updateCustomerFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),


}
