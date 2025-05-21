import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserManagementService } from "../../core/services/user.service";
import { userActions } from "./user.actions";
import { catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";
import { ProviderService } from "../../core/services/provider.service";
import { providerActions } from "../provider/provider.action";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { CustomerService } from "../../core/services/customer.service";
import { Store } from "@ngrx/store";
import { authActions } from "../auth/auth.actions";

export const userEffects = {
    /**
    * Fetches users (customers and providers) when 'fetchUsers' is dispatched.
    * On success, dispatches 'fetchUsersSuccess'. On error, shows a notification and dispatches 'fetchUsersFailure'.
    */
    fetchUsers$: createEffect(() => {
        const actions$ = inject(Actions);
        const userService = inject(UserManagementService);
        const notyf = inject(NotificationService);
        const store = inject(Store);

        return actions$.pipe(
            ofType(userActions.fetchUsers),
            switchMap(() =>
                userService.getUsers().pipe(
                    map((response) => userActions.fetchUsersSuccess({ customers: response.customers, providers: response.providers })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.fetchUsersFailure, notyf, store);
                    })
                )
            )
        );
    }, { functional: true }),

    /**
     * Fetches providers when 'fetchProviders' is dispatched.
     * On success, dispatches 'fetchProvidersSuccess'. On error, shows a notification and dispatches 'fetchProvidersFailure'.
     */
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

    /**
     * Partially updates a provider when 'partialUpdateProvider' is dispatched.
     * On success, dispatches 'partialUpdateProviderSuccess'. On error, handles it and dispatches 'partialUpdateProviderFailure'.
     */
    partialUpdateProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.partialUpdateProvider),
            switchMap(({ updateData }) =>
                providerService.partialUpdate(updateData).pipe(
                    map((provider) => userActions.partialUpdateProviderSuccess({ provider })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.partialUpdateProviderFailure, notyf);
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
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.partialUpdateCustomer),
            switchMap(({ updateData }) =>
                customerService.partialUpdate(updateData).pipe(
                    map((customer) => userActions.partialUpdateCustomerSuccess({ customer })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.partialUpdateCustomerFailure, notyf);
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
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.filterCustomer),
            switchMap(({ filter }) =>
                customerService.getCustomers(filter).pipe(
                    map((customers) => userActions.filterCustomerSuccess({ customers })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.filterCustomerFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    /**
     * fetches filtered providers when 'filterProvider' is dispatched.
     * On success, dispatches 'filterProviderSuccess'. On error, shows a notification and dispatches 'filterProviderFailure'.
     */
    filterProviders$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.filterProvider),
            switchMap(({ filter }) =>
                providerService.getProviders(filter).pipe(
                    map((providers) => userActions.filterProviderSuccess({ providers })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, userActions.filterProviderFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),
}
